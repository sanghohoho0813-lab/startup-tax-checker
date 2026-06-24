import type {
  ConsultPriority,
  FormData,
  ItemResult,
  SavingsPoint,
  Verdict,
} from '../types'

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

// ---------------------------------------------------------------------------
// 예상 절세 포인트 — "검토받으면 돈을 아낄 수 있겠다"를 느끼게
// (정확한 세액 계산이 아니라 검토 대상 여부만 표현)
// ---------------------------------------------------------------------------
const SAVINGS_SHORT: Record<string, string> = {
  incomeTax: '법인세·소득세',
  acquisitionTax: '취득세',
  propertyTax: '재산세',
}

export function buildSavingsPoints(
  coreItems: ItemResult[],
  overall: Verdict,
  recognition: Verdict,
): SavingsPoint[] {
  const points: SavingsPoint[] = []

  // 창업 제외 가능성이 큰 경우 상단에 경고 한 줄
  if (recognition === 'bad' || overall === 'bad') {
    points.push({
      tone: 'bad',
      text: '창업 제외 가능성이 높아 세제혜택 적용이 어려울 수 있습니다.',
    })
  }

  for (const item of coreItems) {
    const short = SAVINGS_SHORT[item.key] ?? item.title
    if (item.verdict === 'bad') {
      points.push({ tone: 'bad', text: `${short} 감면 적용이 어려울 수 있습니다.` })
    } else {
      points.push({ tone: 'good', text: `${short} 감면 가능성 검토 대상` })
    }
  }

  return points
}

// ---------------------------------------------------------------------------
// 많은 대표님들이 놓치는 부분 — 결과별 자동 생성
// ---------------------------------------------------------------------------
export function buildMissedPoints(form: FormData, isYouth: boolean | null): string[] {
  const out: string[] = []

  out.push('업종코드에 따라 감면 적용 여부가 달라질 수 있습니다.')

  if (form.overconcentration !== 'no') {
    out.push('과밀억제권역 여부에 따라 결과가 크게 달라질 수 있습니다.')
  }
  if (form.startupForm === 'conversion') {
    out.push('법인전환 구조에 따라 창업 인정 여부가 달라질 수 있습니다.')
  }
  if (
    form.startupForm === 'acquisition' ||
    form.startupForm === 'succession' ||
    form.startupForm === 'reopen_same'
  ) {
    out.push('사업 양수·승계 구조에 따라 창업 인정 여부가 달라질 수 있습니다.')
  }
  out.push('사업장 주소(소재지)가 감면 판정에 중요할 수 있습니다.')
  if (isYouth === false || isYouth === null) {
    out.push('병역 이행 기간에 따라 청년 감면 대상 여부가 달라질 수 있습니다.')
  }

  return dedupe(out).slice(0, 5)
}

// ---------------------------------------------------------------------------
// 상담 우선순위 (A/B/C/D) — 상담사가 연락 순서를 판단
// ---------------------------------------------------------------------------
export function buildPriority(overall: Verdict): ConsultPriority {
  switch (overall) {
    case 'good':
      return {
        grade: 'A',
        label: '지금 바로 상담 연결 권장',
        description: '확인만 하면 감면 적용 가능성이 높은 우선 상담 대상입니다.',
      }
    case 'caution':
      return {
        grade: 'B',
        label: '우선 상담 권장',
        description: '일부 항목만 확인하면 적용 여부가 분명해지는 케이스입니다.',
      }
    case 'conditional':
      return {
        grade: 'C',
        label: '구조 검토 후 상담',
        description: '창업 형태·권역 등 구조 검토가 선행되어야 하는 케이스입니다.',
      }
    case 'bad':
    default:
      return {
        grade: 'D',
        label: '감면 가능성 낮음',
        description: '현재 정보 기준 감면 적용 가능성이 낮은 케이스입니다.',
      }
  }
}

function dedupe(arr: string[]): string[] {
  return [...new Set(arr)]
}
