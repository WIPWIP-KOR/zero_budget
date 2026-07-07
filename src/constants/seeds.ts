import type { AccountType, CategoryType } from '@/db/schema';

interface CategorySeed {
  name: string;
  type: CategoryType;
  icon: string; // Ionicons 이름
  color: string;
}

interface AccountSeed {
  name: string;
  type: AccountType;
  color: string;
}

// 색상은 dataviz 검증기 기준(명도 밴드/채도/대비)을 통과하도록 선정.
// 11개 카테고리라 CVD 인접성은 도넛의 2px 간격 + 아이콘/라벨 리스트로 보완한다.
// '기타'의 회색은 중립(Other) 관례로 의도된 저채도.
export const DEFAULT_CATEGORIES: CategorySeed[] = [
  // 지출
  { name: '식비', type: 'expense', icon: 'restaurant', color: '#E5484D' },
  { name: '카페/간식', type: 'expense', icon: 'cafe', color: '#B45309' },
  { name: '교통', type: 'expense', icon: 'bus', color: '#3B82F6' },
  { name: '주거/관리비', type: 'expense', icon: 'home', color: '#7C3AED' },
  { name: '통신', type: 'expense', icon: 'wifi', color: '#0891B2' },
  { name: '쇼핑', type: 'expense', icon: 'cart', color: '#EC4899' },
  { name: '의료/건강', type: 'expense', icon: 'medkit', color: '#059669' },
  { name: '문화/여가', type: 'expense', icon: 'film', color: '#D97706' },
  { name: '교육', type: 'expense', icon: 'school', color: '#6366F1' },
  { name: '경조/선물', type: 'expense', icon: 'gift', color: '#A21CAF' },
  { name: '기타 지출', type: 'expense', icon: 'ellipsis-horizontal', color: '#64748B' },
  // 수입
  { name: '급여', type: 'income', icon: 'card', color: '#047857' },
  { name: '부수입', type: 'income', icon: 'briefcase', color: '#0284C7' },
  { name: '용돈', type: 'income', icon: 'heart', color: '#DB2777' },
  { name: '금융수입', type: 'income', icon: 'trending-up', color: '#65A30D' },
  { name: '기타 수입', type: 'income', icon: 'ellipsis-horizontal', color: '#64748B' },
];

export const DEFAULT_ACCOUNTS: AccountSeed[] = [
  { name: '현금', type: 'cash', color: '#1B9C5C' },
  { name: '체크카드', type: 'card', color: '#3182F6' },
  { name: '신용카드', type: 'card', color: '#8B5CF6' },
  { name: '은행', type: 'bank', color: '#F59E0B' },
];
