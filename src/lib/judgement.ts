import type { FormData, ItemResult, JudgementResult, Verdict } from '../types'
import { calcAge, isYouthAge } from './date'
import { computeScore } from './score'
import { diagnoseExclusion } from './exclusion'

// ---------------------------------------------------------------------------
// 판정 상태 라벨 / 우선순위
// ---------------------------------------------------------------------------
export const VERDICT_LABEL: Record<Verdict, string> = {
  good: '감면 가능성 높음',
  caution: '주의 필요',
  bad: '불가 가능성 높음',
  review: '전문가 확인 필요',
}

// 종합 판정 산출 시 "가장 보수적인" 상태를 고르기 위한 순위 (낮을수록 부정적)
const VERDICT_RANK: Record<Verdict, number> = {
  bad: 0,
  caution: 1,
  review: 2,
  good: 3,
}

export const DISCLAIMER =
  '본 결과는 상담용 1차 판정이며, 실제 감면 적용 여부는 조세특례제한법, 지방세특례제한법, 업종코드, 창업 형태, 과밀억제권역 여부, 지자체 해석에 따라 달라질 수 있습니다. 최종 적용 전 세무사 또는 관할 지자체 확인이 필요합니다.'

// ---------------------------------------------------------------------------
// A. 창업 인정 여부 판정
// ---------------------------------------------------------------------------
function judgeStartupRecognition(form: FormData): { verdict: Verdict; note: string } {
  switch (form.startupForm) {
    case 'brand_new':
      return {
        verdict: 'good',
        note: '완전 신규 창업으로 보여 창업 인정 가능성이 높습니다.',
      }
    case 'conversion':
      return {
        verdict: 'caution',
        note: '개인사업자에서 법인전환한 경우 신규 창업으로 보지 않을 수 있어 주의가 필요합니다.',
      }
    case 'acquisition':
      return {
        verdict: 'caution',
        note: '기존 사업을 양수한 경우 창업으로 인정되지 않을 가능성이 있습니다.',
      }
    case 'reopen_same':
      return {
        verdict: 'caution',
        note: '폐업 후 같은 업종으로 재창업한 경우 창업 인정이 제한될 수 있습니다.',
      }
    case 'succession':
      return {
        verdict: 'bad',
        note: '가족·특수관계인의 사업을 승계한 경우 창업으로 인정되지 않을 가능성이 높습니다.',
      }
    case 'unknown':
      return {
        verdict: 'review',
        note: '창업 형태가 불분명하여 세무사 검토가 필요합니다.',
      }
    default:
      return {
        verdict: 'review',
        note: '창업 형태를 선택하면 창업 인정 여부를 판단할 수 있습니다.',
      }
  }
}

// 창업 인정 가능성이 "낮은" 편인지 (caution/bad)
function isRecognitionWeak(v: Verdict): boolean {
  return v === 'caution' || v === 'bad'
}

// ---------------------------------------------------------------------------
// C. 법인세 / 소득세 감면
// ---------------------------------------------------------------------------
function judgeIncomeTax(
  form: FormData,
  recognition: Verdict,
  isYouth: boolean | null,
): ItemResult {
  const reasons: string[] = []
  const checkPoints: string[] = [
    '창업 지역·업종·과밀억제권역 여부에 따라 감면율(50%~100%)이 달라집니다.',
    '최초로 소득이 발생한 과세연도 기준으로 감면 기간이 산정됩니다.',
    '업종 코드(한국표준산업분류)가 감면 대상 업종에 해당하는지 확인이 필요합니다.',
  ]
  let verdict: Verdict
  let consultScript: string

  const isExcludedIndustry =
    form.industry === 'real_estate' || form.industry === 'finance_insurance'
  const inOverconcentration = form.overconcentration === 'yes'

  if (isExcludedIndustry) {
    verdict = 'bad'
    reasons.push(
      form.industry === 'real_estate'
        ? '부동산업은 창업중소기업 세액감면 대상 업종에서 제외되는 경우가 많습니다.'
        : '금융·보험업은 창업중소기업 세액감면 대상 업종에 해당하지 않을 가능성이 높습니다.',
    )
    reasons.push('대상 업종 여부를 업종 코드로 다시 확인할 필요가 있습니다.')
    consultScript =
      '대표님 업종은 창업감면 대상 업종에서 제외될 수 있어, 정확한 업종 코드 확인이 먼저 필요합니다.'
  } else if (isRecognitionWeak(recognition)) {
    verdict = 'caution'
    reasons.push('창업 인정 여부가 불확실하여 감면 적용에 주의가 필요합니다.')
    reasons.push('창업 형태(전환·양수·승계 등)에 따라 적용이 제한될 수 있습니다.')
    consultScript =
      '이 케이스는 신규창업이라기보다 법인전환·사업승계로 볼 여지가 있어 창업감면 적용이 제한될 수 있습니다.'
  } else if (isYouth === true && !inOverconcentration) {
    verdict = 'good'
    reasons.push('청년 창업 + 수도권 과밀억제권역 외 지역으로 유리한 조건입니다.')
    reasons.push('청년창업중소기업 세액감면(높은 감면율) 적용 가능성을 검토할 수 있습니다.')
    consultScript =
      '대표님은 청년 + 비과밀억제권역 창업으로, 창업감면에서 가장 유리한 구간에 해당할 가능성이 있습니다.'
  } else if (isYouth === true && inOverconcentration) {
    verdict = 'caution'
    reasons.push('청년 창업이지만 수도권 과밀억제권역으로 일부 제한이 있을 수 있습니다.')
    reasons.push('과밀억제권역에서는 감면율이 낮아지거나 적용이 제한될 수 있습니다.')
    consultScript =
      '청년 창업이지만 과밀억제권역이라 감면율이 달라질 수 있어, 권역 여부 확인이 우선입니다.'
  } else {
    verdict = 'good'
    reasons.push('창업 인정 가능성이 있어 창업중소기업 세액감면 검토가 가능합니다.')
    reasons.push(
      inOverconcentration
        ? '다만 과밀억제권역 여부에 따라 감면율이 달라질 수 있습니다.'
        : '비과밀억제권역으로 비교적 유리한 조건입니다.',
    )
    consultScript =
      '대표님 케이스는 창업감면 가능성이 있어 보이지만, 과밀억제권역 여부와 업종 코드 확인이 먼저 필요합니다.'
  }

  reasons.push(
    '정확한 감면율은 창업지역, 업종, 과밀억제권역, 최초 소득 발생연도에 따라 달라집니다.',
  )

  return {
    key: 'incomeTax',
    title: '법인세 / 소득세 감면',
    verdict,
    reasons,
    checkPoints,
    consultScript,
  }
}

// ---------------------------------------------------------------------------
// D. 취득세 감면
// ---------------------------------------------------------------------------
function judgeAcquisitionTax(form: FormData, recognition: Verdict): ItemResult {
  const reasons: string[] = []
  const checkPoints: string[] = [
    '취득한 부동산이 사업용(직접 사용)인지 확인이 필요합니다.',
    '창업일로부터 일정 기간 내 취득한 사업용 재산인지 확인이 필요합니다.',
    '지방세특례제한법상 감면 요건과 적용기한을 관할 지자체에 확인하는 것이 안전합니다.',
  ]
  let verdict: Verdict
  let consultScript: string

  const inOverconcentration = form.overconcentration === 'yes'

  if (isRecognitionWeak(recognition)) {
    verdict = 'bad'
    reasons.push('창업 인정 여부가 불확실하여 취득세 감면 적용이 어려울 수 있습니다.')
    reasons.push('창업으로 인정되지 않으면 취득세 감면 대상에서 제외될 수 있습니다.')
    consultScript = '창업 인정 여부가 불확실해 취득세 감면은 보수적으로 보는 것이 안전합니다.'
  } else if (inOverconcentration) {
    verdict = 'caution'
    reasons.push('수도권 과밀억제권역으로 취득세 감면이 제한되거나 불리할 수 있습니다.')
    reasons.push('과밀억제권역 내 취득은 중과 또는 감면 배제 대상이 될 수 있습니다.')
    consultScript =
      '과밀억제권역이라 취득세는 오히려 불리할 수 있어, 권역·중과 여부 확인이 필요합니다.'
  } else if (form.overconcentration === 'no') {
    verdict = 'good'
    reasons.push('비과밀억제권역으로 창업 사업용 부동산 취득세 감면 가능성이 있습니다.')
    reasons.push('사업용으로 직접 사용하는 부동산이라면 감면 검토가 가능합니다.')
    consultScript =
      '비과밀억제권역이라 사업용 부동산 취득세 감면 가능성이 있어 보입니다. 사업용 사용 여부를 확인해 주세요.'
  } else {
    verdict = 'review'
    reasons.push('과밀억제권역 여부가 불분명하여 취득세 감면 판단이 어렵습니다.')
    reasons.push('권역 여부에 따라 결과가 크게 달라집니다.')
    consultScript = '과밀억제권역 여부가 확인되어야 취득세 감면 판단이 가능합니다.'
  }

  return {
    key: 'acquisitionTax',
    title: '취득세 감면',
    verdict,
    reasons,
    checkPoints,
    consultScript,
  }
}

// ---------------------------------------------------------------------------
// E. 재산세 감면
// ---------------------------------------------------------------------------
function judgePropertyTax(recognition: Verdict): ItemResult {
  const reasons: string[] = []
  const checkPoints: string[] = [
    '해당 부동산을 사업에 직접 사용하는지(자가 사용) 확인이 필요합니다.',
    '단순 투자용·임대용 부동산은 감면 대상에서 제외될 수 있습니다.',
    '재산세 감면은 본 진단에서 별도 입력을 받지 않으므로 안내 위주로 참고해 주세요.',
  ]
  let verdict: Verdict
  let consultScript: string

  if (isRecognitionWeak(recognition)) {
    verdict = 'caution'
    reasons.push('창업 인정 여부가 불확실하여 재산세 감면도 보수적으로 봐야 합니다.')
    reasons.push('사업용 직접 사용 부동산이 아니라면 감면이 어렵습니다.')
    consultScript =
      '재산세 감면은 창업 인정과 사업용 직접 사용이 전제이므로, 두 가지를 먼저 확인해 주세요.'
  } else if (recognition === 'review') {
    verdict = 'review'
    reasons.push('창업 형태가 불분명하여 재산세 감면 판단에 검토가 필요합니다.')
    reasons.push('사업용 직접 사용 여부도 함께 확인되어야 합니다.')
    consultScript = '재산세 감면은 창업 인정 여부와 부동산 사용 형태 확인 후 판단이 가능합니다.'
  } else {
    verdict = 'good'
    reasons.push('창업 인정 가능성이 있고 사업용 직접 사용 부동산이면 감면 가능성이 있습니다.')
    reasons.push('단, 투자용·임대용 부동산은 불리하므로 사용 형태 확인이 필요합니다.')
    consultScript =
      '사업장으로 직접 사용하는 부동산이라면 재산세 감면 가능성이 있습니다. 임대·투자용이면 달라집니다.'
  }

  return {
    key: 'propertyTax',
    title: '재산세 감면',
    verdict,
    reasons,
    checkPoints,
    consultScript,
  }
}

// ---------------------------------------------------------------------------
// F. 등록면허세 감면
// ---------------------------------------------------------------------------
function judgeRegistrationTax(form: FormData): ItemResult {
  const reasons: string[] = [
    '법인설립 등기 관련 등록면허세 감면은 개정·일몰(적용기한) 여부 확인이 특히 중요합니다.',
    '과밀억제권역 내 법인설립 등기는 등록면허세가 중과될 수 있습니다.',
  ]
  const checkPoints: string[] = [
    '현재 시점의 지방세특례제한법 개정·일몰 여부를 확인해야 합니다.',
    '관할 지자체의 해석 및 적용기한을 직접 확인하는 것이 안전합니다.',
    '법인 설립 등기 시점과 과밀억제권역 중과 여부를 확인해야 합니다.',
  ]

  if (form.businessType === 'individual') {
    reasons.push('개인사업자는 법인설립 등기 관련 등록면허세 감면과 직접 관련이 적을 수 있습니다.')
  } else if (form.overconcentration === 'yes') {
    reasons.push('수도권 과밀억제권역이라 설립 등기 등록면허세 중과 가능성도 함께 확인해야 합니다.')
  }

  return {
    key: 'registrationTax',
    title: '등록면허세 감면',
    verdict: 'review',
    reasons,
    checkPoints,
    consultScript:
      '등록면허세 감면은 개정·적용기한에 민감해 단정하기 어렵습니다. 세무사 또는 지자체 확인이 필요합니다.',
  }
}

// ---------------------------------------------------------------------------
// 종합 판정
// ---------------------------------------------------------------------------
export function judge(form: FormData, baseDate: Date = new Date()): JudgementResult {
  const age = calcAge(form.birthDate, baseDate)
  const isYouth = isYouthAge(age)
  const recognition = judgeStartupRecognition(form)
  const { score, factors } = computeScore({ form, isYouth })
  const exclusionReasons = diagnoseExclusion(form)

  // 사용자가 체크한 항목만 판정 (미선택 시 전체)
  const checked = form.checkItems
  const anyChecked =
    checked.incomeTax || checked.acquisitionTax || checked.propertyTax || checked.registrationTax

  const allItems: ItemResult[] = [
    judgeIncomeTax(form, recognition.verdict, isYouth),
    judgeAcquisitionTax(form, recognition.verdict),
    judgePropertyTax(recognition.verdict),
    judgeRegistrationTax(form),
  ]

  const items = allItems.filter((item) => !anyChecked || checked[item.key])

  // 종합 판정: 표시 항목 중 가장 보수적인 상태
  let overall: Verdict = 'good'
  for (const item of items) {
    if (VERDICT_RANK[item.verdict] < VERDICT_RANK[overall]) {
      overall = item.verdict
    }
  }
  if (items.length === 0) overall = 'review'

  const overallSummary = buildOverallSummary(overall, recognition.verdict, isYouth, score)

  return {
    overall,
    overallSummary,
    score,
    scoreFactors: factors,
    isYouth,
    age,
    startupRecognition: recognition.verdict,
    startupRecognitionNote: recognition.note,
    exclusionReasons,
    items,
  }
}

function buildOverallSummary(
  overall: Verdict,
  recognition: Verdict,
  isYouth: boolean | null,
  score: number,
): string {
  const parts: string[] = []

  parts.push(`감면 가능성 점수는 100점 만점에 ${score}점입니다.`)

  if (isYouth === true) parts.push('청년 창업 요건(만 15~34세)에 해당할 수 있습니다.')
  else if (isYouth === false) parts.push('연령 기준상 청년 창업 요건에는 해당하지 않습니다.')

  switch (overall) {
    case 'good':
      parts.push('전반적으로 창업감면 가능성이 있어 추가 확인을 권장합니다.')
      break
    case 'caution':
      parts.push('적용에 제약이 될 수 있는 요소가 있어 주의가 필요합니다.')
      break
    case 'bad':
      parts.push('현재 정보로는 감면 적용이 어려울 가능성이 높습니다.')
      break
    case 'review':
      parts.push('정보가 부족하거나 단정하기 어려워 전문가 확인이 필요합니다.')
      break
  }

  if (recognition === 'review') {
    parts.push('특히 창업 형태가 불분명해 창업 인정 여부 확인이 우선입니다.')
  }

  return parts.join(' ')
}
