// ===========================================================================
// 도메인 타입 정의
// ===========================================================================

// 사업자 유형
export type BusinessType = 'individual' | 'corporation'

// 사업장 지역
export type Region = 'seoul' | 'gyeonggi_incheon' | 'metro_city' | 'other_local'

// 수도권 과밀억제권역 여부
export type Overconcentration = 'yes' | 'no' | 'unknown'

// 업종
export type Industry =
  | 'manufacturing'
  | 'ict'
  | 'professional'
  | 'wholesale_retail'
  | 'restaurant'
  | 'real_estate'
  | 'finance_insurance'
  | 'etc'

// 창업 형태
export type StartupForm =
  | 'brand_new' // 완전 신규 창업
  | 'conversion' // 개인 -> 법인 전환
  | 'acquisition' // 기존 사업 양수
  | 'reopen_same' // 폐업 후 같은 업종 재창업
  | 'succession' // 가족/특수관계인 사업 승계
  | 'unknown' // 잘 모르겠음

// 감면 확인 항목 키
export type ExemptionKey = 'incomeTax' | 'acquisitionTax' | 'propertyTax' | 'registrationTax'

// 입력 폼 데이터
export interface FormData {
  businessType: BusinessType | ''
  birthDate: string // YYYY-MM-DD
  startupDate: string // YYYY-MM-DD
  region: Region | ''
  overconcentration: Overconcentration | ''
  industry: Industry | ''
  startupForm: StartupForm | ''
  checkItems: Record<ExemptionKey, boolean>
}

// ===========================================================================
// 판정 결과 타입
// ===========================================================================

// 판정 상태 (4단계)
//  good        🟢 감면 가능성 높음
//  caution     🟡 주의 필요
//  conditional 🟠 조건부 검토
//  bad         🔴 불가 가능성 높음
export type Verdict = 'good' | 'caution' | 'conditional' | 'bad'

// 핵심 감면 항목 판정 결과 (법인세/소득세, 취득세, 재산세)
export interface ItemResult {
  key: ExemptionKey
  title: string
  verdict: Verdict
  reasons: string[] // 이유 2~4줄
  checkPoints: string[] // 추가 확인 필요사항
  consultScript: string // 상담 멘트 예시
}

// 등록면허세 — 종합판정에서 제외, 별도 참고 영역으로만 표시
export interface RegistrationReference {
  title: string
  note: string
  checkPoints: string[]
}

// 창업 제외사유 진단 항목
export interface ExclusionReason {
  title: string
  detail: string
  exception: string
}

// 종합 판정 결과
export interface JudgementResult {
  overall: Verdict
  oneLineConclusion: string // 한줄 결론 (사장님용)
  reasons: string[] // 판정 사유 (간단 불릿)
  keyChecks: string[] // 주요 확인사항 (초기 화면 노출)

  // 청년 분석
  isYouth: boolean | null
  age: number | null

  // 창업 인정 분석
  startupRecognition: Verdict
  startupRecognitionNote: string
  exclusionReasons: ExclusionReason[]

  // 핵심 항목 (종합판정 대상) + 등록면허세 참고
  coreItems: ItemResult[]
  registration: RegistrationReference | null

  // 상담 활용
  consultQuestions: string[] // 상담 시 확인해야 할 핵심 질문
  consultChecklist: string[] // 전문가 상담 시 확인할 항목 (계약 유도)
}
