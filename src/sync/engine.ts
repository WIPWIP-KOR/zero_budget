import { and, eq, isNull, sql } from 'drizzle-orm';

import { getDb } from '@/db/client';
import {
  accounts,
  budgets,
  categories,
  goals,
  ledgerMembers,
  ledgers,
  syncState,
  transactions,
} from '@/db/schema';
import { nowISO } from '@/lib/dates';
import { newId } from '@/lib/id';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

import { shouldApplyRemote } from './lww';
import { SYNC_TABLES, type TableSync } from './mappings';

const PUSH_CHUNK = 500;
const PULL_LIMIT = 1000;
const EPOCH = '1970-01-01T00:00:00Z';

export interface SyncResult {
  skipped: boolean;
  pushed: number;
  pulled: number;
}

let running = false;

/**
 * pull 커서를 초기화한다. 장부 합류처럼 멤버십이 바뀌면
 * 커서보다 오래된 상대 데이터도 받아야 하므로 전체 재-pull이 필요하다.
 */
export async function resetSyncCursors(): Promise<void> {
  await getDb().delete(syncState);
}

/**
 * 전체 동기화 1회: 로컬 데이터를 계정에 연결 → 테이블별 push → pull.
 * 미설정/미로그인이면 조용히 건너뛴다.
 */
export async function syncNow(): Promise<SyncResult> {
  if (!isSupabaseConfigured || running) return { skipped: true, pushed: 0, pulled: 0 };

  const supabase = getSupabase();
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user.id;
  if (!userId) return { skipped: true, pushed: 0, pulled: 0 };

  running = true;
  try {
    await claimLocalData(userId);
    let pushed = 0;
    let pulled = 0;
    for (const table of SYNC_TABLES) {
      pushed += await pushTable(table);
      pulled += await pullTable(table);
    }
    return { skipped: false, pushed, pulled };
  } finally {
    running = false;
  }
}

/**
 * 로그인 전(로컬 전용)에 만든 데이터를 계정 소유로 연결한다.
 * user_id가 비어있는 행에 채우고 dirty로 표시해 다음 push에 업로드.
 */
export async function claimLocalData(userId: string): Promise<void> {
  const db = getDb();
  const ts = nowISO();

  const dataTables = [ledgers, categories, accounts, transactions, goals, budgets];
  for (const table of dataTables) {
    await db
      .update(table)
      .set({ userId, updatedAt: ts, dirty: 1 })
      .where(isNull(table.userId));
  }

  // 내 멤버십 행이 없는 장부에 owner 멤버십 생성 (부부 합류 전 = 내 장부)
  const myLedgers = await db.select({ id: ledgers.id }).from(ledgers).where(isNull(ledgers.deletedAt));
  for (const ledger of myLedgers) {
    const membership = await db
      .select({ id: ledgerMembers.id })
      .from(ledgerMembers)
      .where(and(eq(ledgerMembers.ledgerId, ledger.id), eq(ledgerMembers.userId, userId)))
      .limit(1);
    if (membership.length === 0) {
      await db.insert(ledgerMembers).values({
        id: newId(),
        ledgerId: ledger.id,
        userId,
        role: 'owner',
        createdAt: ts,
        updatedAt: ts,
        dirty: 1,
      });
    }
  }
}

/** dirty 행을 서버로 upsert하고, push 도중 수정되지 않은 행만 dirty를 내린다. */
async function pushTable(t: TableSync): Promise<number> {
  const db = getDb();
  const supabase = getSupabase();

  const dirtyRows = (await db
    .select()
    .from(t.table)
    .where(sql`dirty = 1 AND user_id IS NOT NULL`)) as Record<string, unknown>[];
  if (dirtyRows.length === 0) return 0;

  for (let i = 0; i < dirtyRows.length; i += PUSH_CHUNK) {
    const chunk = dirtyRows.slice(i, i + PUSH_CHUNK);
    const { error } = await supabase
      .from(t.remoteName)
      .upsert(chunk.map((row) => t.toRemote(row)), { onConflict: 'id' });
    if (error) throw new Error(`${t.remoteName} push 실패: ${error.message}`);

    for (const row of chunk) {
      await db
        .update(t.table)
        .set({ dirty: 0 })
        .where(sql`id = ${row.id as string} AND updated_at = ${row.updatedAt as string}`);
    }
  }
  return dirtyRows.length;
}

/** updated_at 커서 이후의 서버 변경분을 받아 LWW로 반영한다. */
async function pullTable(t: TableSync): Promise<number> {
  const db = getDb();
  const supabase = getSupabase();

  const cursorRow = await db
    .select()
    .from(syncState)
    .where(eq(syncState.tableName, t.remoteName))
    .limit(1);
  let cursor = cursorRow[0]?.lastPulledAt ?? EPOCH;
  let applied = 0;

  for (;;) {
    const { data: remoteRows, error } = await supabase
      .from(t.remoteName)
      .select('*')
      .gt('updated_at', cursor)
      .order('updated_at', { ascending: true })
      .limit(PULL_LIMIT);
    if (error) throw new Error(`${t.remoteName} pull 실패: ${error.message}`);
    if (!remoteRows || remoteRows.length === 0) break;

    for (const remote of remoteRows) {
      const values = t.fromRemote(remote);
      const id = values.id as string;
      const local = (await db
        .select()
        .from(t.table)
        .where(sql`id = ${id}`)
        .limit(1)) as Record<string, unknown>[];

      if (local.length === 0) {
        await db.insert(t.table).values(values as never);
        applied += 1;
      } else if (
        shouldApplyRemote(
          local[0].updatedAt as string,
          local[0].dirty as number,
          remote.updated_at as string,
        )
      ) {
        await db.update(t.table).set(values).where(sql`id = ${id}`);
        applied += 1;
      }
      cursor = remote.updated_at as string;
    }

    await db
      .insert(syncState)
      .values({ tableName: t.remoteName, lastPulledAt: cursor })
      .onConflictDoUpdate({ target: syncState.tableName, set: { lastPulledAt: cursor } });

    if (remoteRows.length < PULL_LIMIT) break;
  }
  return applied;
}
