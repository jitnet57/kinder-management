/**
 * AKMS 공유 TypeScript 인터페이스
 * 모든 페이지와 컨텍스트가 이 타입을 사용하여 데이터 일관성 보장
 */

// 아동 정보 (number ID 기준 확정)
export interface Child {
  id: number;        // 1, 2, 3, 4 - 절대 string name 아님
  name: string;      // '민준', '소영', '지호', '연서'
  birthDate: string;
  phone: string;
  address: string;
  notes: string;
  color: string;
  photo: string | null;
}

// 세션 과제 (childId를 number로 확정)
export interface SessionTask {
  id: string;
  childId: number;    // 변경: string → number (1, 2, 3, 4)
  domainId: string;
  ltoId: string;
  stoId: string;
  date: string;       // ISO 8601 형식
  startTime: string;
  endTime: string;
  score: number;      // 0-100
  notes: string;
  completed: boolean;
  completedAt?: string;
}

// 완료된 과제
export interface CompletionTask extends SessionTask {
  completedAt: string;
}

// 발달 영역 (도메인)
export interface DevelopmentDomain {
  id: string;
  name: string;
  description?: string;
  color?: string;
  ltos: LTO[];
}

// 장기 목표 (Long-Term Objective)
export interface LTO {
  id: string;
  name: string;
  order?: number;
  goal?: string;
  stos: STO[];
  teachingTips?: Record<string, string>;
}

// 단기 목표 (Short-Term Objective)
export interface STO {
  id: string;
  name: string;
  description?: string;
  order?: number;
}

// 스케줄 세션
export interface ScheduleSession {
  id: string;
  dayOfWeek: number;       // 0=월 ~ 5=토
  timeSlotIndex: number;   // 0-3 (4개 시간대: 8시, 10시, 14시, 16시)
  childId: number;         // 변경: 'c1' → number (1, 2, 3, 4)
  childName: string;
  sessionName: string;
  startTime: number;
  endTime: number;
  color: string;
}

// 공식 아동 데이터 (CANONICAL_CHILDREN)
export const CANONICAL_CHILDREN: Child[] = [
  {
    id: 1,
    name: '민준',
    birthDate: '2021-01-15',
    phone: '010-1234-5678',
    address: '서울시 강남구 테헤란로 123, 푸른숲아파트 101동',
    notes: '언어발달 우수, 집중력이 매우 좋음.',
    color: '#FFB6D9',
    photo: null,
  },
  {
    id: 2,
    name: '소영',
    birthDate: '2021-06-10',
    phone: '010-2345-6789',
    address: '서울시 서초구 강남대로 45, 현대빌라 3층',
    notes: '활발하고 사교적인 성격.',
    color: '#B4D7FF',
    photo: null,
  },
  {
    id: 3,
    name: '지호',
    birthDate: '2020-03-22',
    phone: '010-3456-7890',
    address: '서울시 강동구 구천면로 789, 삼성아파트 205동',
    notes: '차분하고 침착함.',
    color: '#C1FFD7',
    photo: null,
  },
  {
    id: 4,
    name: '연서',
    birthDate: '2021-09-05',
    phone: '010-4567-8901',
    address: '경기도 성남시 분당구 정자동 456번지',
    notes: '긍정적이고 밝은 성격.',
    color: '#FFE4B5',
    photo: null,
  },
];

export type ChildId = 1 | 2 | 3 | 4;

// 알림
export interface Notification {
  id: string;
  type: 'new_session' | 'completion' | 'approval_request';
  message: string;
  createdAt: string;
  read: boolean;
  targetRole: 'admin' | 'therapist' | 'parent' | 'all';
}
