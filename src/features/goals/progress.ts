export type GoalStatus = 'done' | 'ahead' | 'ontrack' | 'behind';

export interface GoalProgress {
  /** 이번 달 저축액 (수입 - 지출) */
  saved: number;
  target: number;
  /** 0~1로 클램프된 진행률 (게이지용) */
  progress: number;
  /** 월 경과 비율 기준 기대 진행률 */
  expectedProgress: number;
  status: GoalStatus;
  message: string;
}

const MESSAGES: Record<GoalStatus, string> = {
  done: '이번 달 목표 달성! 🎉',
  ahead: '목표보다 앞서가고 있어요 💪',
  ontrack: '계획대로 잘 가고 있어요 🙂',
  behind: '페이스가 조금 느려요. 이번 주는 아껴볼까요?',
};

/** 허용 오차: 기대 진행률보다 5%p 이내 뒤처짐은 ontrack으로 본다 */
const ONTRACK_TOLERANCE = 0.05;

export function computeGoalProgress(
  income: number,
  expense: number,
  target: number,
  dayOfMonth: number,
  daysInMonth: number,
): GoalProgress {
  const saved = income - expense;
  const rawProgress = target > 0 ? saved / target : 0;
  const expectedProgress = daysInMonth > 0 ? dayOfMonth / daysInMonth : 0;

  let status: GoalStatus;
  if (rawProgress >= 1) status = 'done';
  else if (rawProgress >= expectedProgress) status = 'ahead';
  else if (rawProgress >= expectedProgress - ONTRACK_TOLERANCE) status = 'ontrack';
  else status = 'behind';

  return {
    saved,
    target,
    progress: Math.min(Math.max(rawProgress, 0), 1),
    expectedProgress,
    status,
    message: MESSAGES[status],
  };
}

/** 파티 지출 상한형 목표(§3.3b) — 저축 목표와 방향이 반대: 적게 쓸수록 좋다 */
export type CapStatus = 'safe' | 'ontrack' | 'overPace' | 'exceeded';

export interface CapProgress {
  spent: number;
  cap: number;
  /** cap - spent. 음수면 이미 초과 */
  remaining: number;
  /** 0~1로 클램프된 진행률 (게이지용) */
  progress: number;
  expectedProgress: number;
  status: CapStatus;
  message: string;
}

const CAP_MESSAGES: Record<CapStatus, string> = {
  safe: '여유 있게 쓰고 있어요 🙂',
  ontrack: '페이스대로 쓰고 있어요',
  overPace: '이 페이스면 상한을 넘겠어요 — 아껴볼까요?',
  exceeded: '상한을 넘었어요 😥',
};

const CAP_TOLERANCE = 0.05;

export function computeSpendingCapProgress(
  expense: number,
  cap: number,
  dayOfMonth: number,
  daysInMonth: number,
): CapProgress {
  const rawProgress = cap > 0 ? expense / cap : 0;
  const expectedProgress = daysInMonth > 0 ? dayOfMonth / daysInMonth : 0;

  let status: CapStatus;
  if (rawProgress >= 1) status = 'exceeded';
  else if (rawProgress <= expectedProgress) status = 'safe';
  else if (rawProgress <= expectedProgress + CAP_TOLERANCE) status = 'ontrack';
  else status = 'overPace';

  return {
    spent: expense,
    cap,
    remaining: cap - expense,
    progress: Math.min(Math.max(rawProgress, 0), 1),
    expectedProgress,
    status,
    message: CAP_MESSAGES[status],
  };
}
