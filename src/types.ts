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

// 판정 상태 (4단계 + 정보)
export type Verdict = 'good' | 'caution' | 'bad' | 'review'

// 개별 항목 판정 결과
export interface ItemResult {
  key: ExemptionKey
  title: string
  verdict: Verdict
  reasons: string[] // 이유 2~4줄
  checkPoints: string[] // 추가 확인 필요사항
  consultScript: string // 상담 멘트 예시
}

// 종합 판정 결과
export interface JudgementResult {
  overall: Verdict
  overallSummary: string
  // 부가 분석 정보
  isYouth: boolean | null // 청년 여부 (생년월일 미입력 시 null)
  age: number | null // 만 나이
  startupRecognition: Verdict // 창업 인정 여부 판정
  startupRecognitionNote: string
  items: ItemResult[]
}
