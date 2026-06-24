import type { FormData } from '../types'

// 결과 기반으로 상담 활용 콘텐츠를 생성한다.
// - reasons: 판정 사유 (간단 불릿, 종합카드/카톡 공용)
// - keyChecks: 주요 확인사항 (초기 화면 노출)
// - consultQuestions: 상담 시 확인해야 할 핵심 질문
// - consultChecklist: 전문가 상담 시 확인할 항목 (계약 유도)

function isExcludedIndustry(form: FormData): boolean {
  return form.industry === 'real_estate' || form.industry === 'finance_insurance'
}

// 판정 사유 (긍정/부정 요소를 짧게)
export function buildReasons(form: FormData, isYouth: boolean | null): string[] {
  const out: string[] = []

  // 창업 형태
  switch (form.startupForm) {
    case 'brand_new':
      out.push('신규 창업')
      break
    case 'conversion':
      out.push('법인전환 (창업 제외 가능성)')
      break
    case 'acquisition':
      out.push('기존 사업 양수 (창업 제외 가능성)')
      break
    case 'reopen_same':
      out.push('동종업 재창업 (창업 제외 가능성)')
      break
    case 'succession':
      out.push('특수관계인 승계 (창업 제외 가능성)')
      break
    case 'unknown':
      out.push('창업 형태 미확인')
      break
  }

  // 청년
  if (isYouth === true) out.push('청년 창업')
  else if (isYouth === false) out.push('청년 요건 미해당')

  // 과밀억제권역
  if (form.overconcentration === 'no') out.push('비과밀억제권역')
  else if (form.overconcentration === 'yes') out.push('수도권 과밀억제권역')

  // 업종
  if (isExcludedIndustry(form)) out.push('부동산·금융업 (감면 제외 가능성)')
  else if (form.industry && form.industry !== 'etc') out.push('감면 대상 업종 가능성')

  return out
}

// 주요 확인사항 (초기 화면용, 2~4개)
export function buildKeyChecks(form: FormData): string[] {
  const out: string[] = []

  if (form.overconcentration === 'unknown' || form.overconcentration === '') {
    out.push('과밀억제권역 여부 확인')
  }
  if (isExcludedIndustry(form) || form.industry === 'etc' || form.industry === '') {
    out.push('정확한 업종코드 확인')
  }
  if (
    form.startupForm === 'unknown' ||
    form.startupForm === 'conversion' ||
    form.startupForm === 'acquisition' ||
    form.startupForm === 'reopen_same' ||
    form.startupForm === 'succession'
  ) {
    out.push('창업 인정 여부 확인')
  }
  // 항상 들어가는 공통 확인
  out.push('최초 소득 발생연도 확인')

  return dedupe(out).slice(0, 4)
}

// 상담 시 확인해야 할 핵심 질문 (결과에 따라 가변)
export function buildConsultQuestions(form: FormData, isYouth: boolean | null): string[] {
  const out: string[] = []

  const hasHistorySuspect =
    form.startupForm === 'conversion' ||
    form.startupForm === 'acquisition' ||
    form.startupForm === 'reopen_same' ||
    form.startupForm === 'succession' ||
    form.startupForm === 'unknown'

  if (hasHistorySuspect) {
    out.push('기존 사업 이력이 있으신가요? (폐업·양수·승계 포함)')
  }
  if (
    form.startupForm === 'reopen_same' ||
    form.startupForm === 'acquisition' ||
    form.startupForm === 'succession' ||
    form.startupForm === 'unknown'
  ) {
    out.push('동일 업종을 운영하신 경험이 있으신가요?')
  }
  if (form.startupForm === 'conversion' || form.businessType === 'corporation') {
    out.push('개인사업자에서 법인전환을 하신 경우인가요?')
  }
  if (form.overconcentration === 'unknown' || form.overconcentration === '') {
    out.push('사업장을 어디에 두실 예정인가요? (수도권 과밀억제권역 여부)')
  }
  if (isExcludedIndustry(form) || form.industry === 'etc' || form.industry === '') {
    out.push('주업종의 정확한 업종코드(한국표준산업분류)는 무엇인가요?')
  }
  // 취득세 관련 (사업용 부동산)
  out.push('취득 예정인 사업용 부동산이 있으신가요?')
  // 청년 병역
  if (isYouth === false || isYouth === null) {
    out.push('대표자 병역 이행 기간이 있으신가요? (청년 기간 연장 가능)')
  }

  return dedupe(out).slice(0, 6)
}

// 전문가 상담 시 확인할 항목 체크리스트 (계약 유도, 3~5개)
export function buildConsultChecklist(form: FormData): string[] {
  const out: string[] = []

  out.push('창업 인정 여부 검토')

  if (isExcludedIndustry(form) || form.industry === 'etc' || form.industry === '') {
    out.push('업종코드 검토')
  }
  if (form.overconcentration !== 'no') {
    out.push('과밀억제권역 검토')
  }
  out.push('최초 소득 발생연도 검토')
  out.push('취득세 감면 가능성 검토')

  return dedupe(out).slice(0, 5)
}

function dedupe(arr: string[]): string[] {
  return [...new Set(arr)]
}
