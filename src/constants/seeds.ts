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

export const DEFAULT_CATEGORIES: CategorySeed[] = [
  // 지출
  { name: '식비', type: 'expense', icon: 'restaurant', color: '#F76D5E' },
  { name: '카페/간식', type: 'expense', icon: 'cafe', color: '#B08968' },
  { name: '교통', type: 'expense', icon: 'bus', color: '#3B82F6' },
  { name: '주거/관리비', type: 'expense', icon: 'home', color: '#8B5CF6' },
  { name: '통신', type: 'expense', icon: 'wifi', color: '#06B6D4' },
  { name: '쇼핑', type: 'expense', icon: 'cart', color: '#EC4899' },
  { name: '의료/건강', type: 'expense', icon: 'medkit', color: '#10B981' },
  { name: '문화/여가', type: 'expense', icon: 'film', color: '#F59E0B' },
  { name: '교육', type: 'expense', icon: 'school', color: '#6366F1' },
  { name: '경조/선물', type: 'expense', icon: 'gift', color: '#E11D48' },
  { name: '기타 지출', type: 'expense', icon: 'ellipsis-horizontal', color: '#94A3B8' },
  // 수입
  { name: '급여', type: 'income', icon: 'card', color: '#1B9C5C' },
  { name: '부수입', type: 'income', icon: 'briefcase', color: '#0EA5E9' },
  { name: '용돈', type: 'income', icon: 'heart', color: '#F472B6' },
  { name: '금융수입', type: 'income', icon: 'trending-up', color: '#84CC16' },
  { name: '기타 수입', type: 'income', icon: 'ellipsis-horizontal', color: '#94A3B8' },
];

export const DEFAULT_ACCOUNTS: AccountSeed[] = [
  { name: '현금', type: 'cash', color: '#1B9C5C' },
  { name: '체크카드', type: 'card', color: '#3182F6' },
  { name: '신용카드', type: 'card', color: '#8B5CF6' },
  { name: '은행', type: 'bank', color: '#F59E0B' },
];
