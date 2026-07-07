import { getSupabase } from '@/lib/supabase';
import { newId } from '@/lib/id';

export type PostType = 'saving_win' | 'nice_spend' | 'goal_done';

export interface Post {
  id: string;
  authorName: string;
  type: PostType;
  message: string;
  amount: number | null;
  createdAt: string;
}

export const POST_TYPE_META: Record<PostType, { label: string; icon: string; color: string }> = {
  saving_win: { label: '아꼈어요', icon: 'leaf', color: '#047857' },
  nice_spend: { label: '멋진 소비', icon: 'heart', color: '#DB2777' },
  goal_done: { label: '목표 달성', icon: 'trophy', color: '#D97706' },
};

/** 공개 피드 최신 포스트 */
export async function fetchPublicPosts(limit = 30): Promise<Post[]> {
  const { data, error } = await getSupabase()
    .from('posts')
    .select('id, author_name, type, message, amount, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(`피드 불러오기 실패: ${error.message}`);
  return (data ?? []).map((row) => ({
    id: row.id as string,
    authorName: row.author_name as string,
    type: row.type as PostType,
    message: row.message as string,
    amount: (row.amount as number | null) ?? null,
    createdAt: row.created_at as string,
  }));
}

export interface PostInput {
  type: PostType;
  message: string;
  amount: number | null;
}

export async function createPost(input: PostInput): Promise<void> {
  const supabase = getSupabase();
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) throw new Error('로그인이 필요합니다');

  const authorName = user.email?.split('@')[0] ?? '익명';
  const { error } = await supabase.from('posts').insert({
    id: newId(),
    user_id: user.id,
    author_name: authorName,
    ...input,
  });
  if (error) throw new Error(`공유 실패: ${error.message}`);
}
