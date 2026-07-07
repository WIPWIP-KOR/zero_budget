import { getSupabase } from '@/lib/supabase';

import { getCurrentLedgerId } from './current';

/** 헷갈리는 문자(0/O, 1/I/L)를 뺀 초대 코드 문자셋 */
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;

export function generateInviteCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

/**
 * 현재 장부의 초대 코드를 만든다 (24시간 유효).
 * 서버 RLS가 멤버십을 검사하므로, 호출 전에 내 장부가 push되어 있어야 한다.
 */
export async function createInviteCode(): Promise<string> {
  const supabase = getSupabase();
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) throw new Error('로그인이 필요합니다');

  const code = generateInviteCode();
  const { error } = await supabase.from('ledger_invites').insert({
    ledger_id: getCurrentLedgerId(),
    code,
    created_by: userId,
  });
  if (error) throw new Error(`초대 코드 생성 실패: ${error.message}`);
  return code;
}

/** 배우자의 초대 코드로 장부에 합류하고, 합류한 장부 id를 돌려준다. */
export async function joinWithCode(code: string): Promise<string> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('join_ledger_with_code', {
    p_code: code.trim().toUpperCase(),
  });
  if (error) throw new Error(error.message);
  return data as string;
}
