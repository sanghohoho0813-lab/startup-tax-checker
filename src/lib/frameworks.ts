import type {
  FormData,
  FrameworkResult,
  ItemResult,
  SavingsPoint,
  Verdict,
  YouthStatus,
} from '../types'

// ---------------------------------------------------------------------------
// 유틸
// ---------------------------------------------------------------------------
// 판정 사다리 (나쁨 → 좋음). downgrade(steps)로 보수적으로 하향.
const LADDER: Verdict[] = ['bad', 'conditional', 'caution', 'good']
function downgrade(v: Verdict, steps: number): Verdict {
  const i = LADDER.indexOf(v)
  return LADDER[Math.max(0, i - steps)]
}
function worst(a: Verdict, b: Verdict): Verdict {
  return LADDER.indexOf(a) <= LADDER.indexOf(b) ? a : b
}
function pct(s: string): number | null {
  if (!s) return null
  const n = Number(s)
  return Number.isNaN(n) ? null : n
}

const CONCLUSION: Record<Verdict, string> = {
  good: '현재 정보 기준 적용 가능성이 높아 보입니다.',
  caution: '가능성은 있으나 핵심 항목 확인이 필요합니다.',
  conditional: '조건에 따라 결과가 크게 달라질 수 있습니다.',
  bad: '현재 정보 기준 적용이 어려워 보입니다.',
}

function verdictToTone(v: Verdict): SavingsPoint['tone'] {
  if (v === 'good') return 'good'
  if (v === 'bad') return 'bad'
  return 'caution'
}

// ---------------------------------------------------------------------------
// 조특법 제6조 대상/제외 업종 안내
// ---------------------------------------------------------------------------
const INDUSTRY_TAXLAW_NOTE: Record<string, string> = {
  manufacturing: '제조업은 조특법 제6조 감면 대상 업종에 해당할 가능성이 높습니다.',
  ict: '정보통신업은 세부 업종(SW개발·정보서비스 등)에 따라 대상 여부가 달라져 업종코드 확인이 필요합니다.',
  professional:
    '전문서비스업은 세부 업종에 따라 대상/제외가 나뉘므로 업종코드(엔지니어링·연구개발 등) 확인이 필요합니다.',
  wholesale_retail:
    '도소매업은 조특법상 단순 도소매가 아니라 통신판매업 등 세부 업종 해당 여부 확인이 필요합니다.',
  restaurant: '음식점업은 대상 업종에 해당할 수 있으나 세부 요건 확인이 필요합니다.',
  real_estate: '부동산업은 조특법 제6조 감면 대상에서 제외될 가능성이 높습니다.',
  finance_insurance:
    '금융·보험업은 세부 업종 확인이 필요하며 감면 대상에서 제외될 가능성이 있습니다.',
  etc: '업종코드에 따라 대상 여부가 달라지므로 주업종 코드 확인이 필요합니다.',
}

// ===========================================================================
// 1) 조특법 기준 (법인세/소득세 세액감면)
// ===========================================================================
function buildTaxLaw(
  form: FormData,
  income: ItemResult | undefined,
  youth: YouthStatus,
): FrameworkResult {
  const a = form.advanced
  let v: Verdict = income?.verdict ?? 'conditional'
  const risks: string[] = []
  const checkPoints: string[] = [
    '주업종 코드가 조특법 제6조 대상 업종인지 확인이 필요합니다.',
    '최초로 소득이 발생한 과세연도 기준으로 감면 기간이 산정됩니다.',
  ]

  // 창업 형태 리스크 (income.verdict에 이미 일부 반영되어 있어 추가 하향은 신중히)
  switch (form.startupForm) {
    case 'conversion':
      risks.push('개인사업자의 법인전환은 신규 창업으로 보지 않을 수 있습니다.')
      break
    case 'acquisition':
      risks.push('기존 사업 양수는 창업 제외 대상이 될 수 있습니다.')
      break
    case 'reopen_same':
      risks.push('폐업 후 동종 재개업은 창업 제외 대상이 될 수 있습니다.')
      break
    case 'succession':
      risks.push('특수관계인 사업 승계는 창업으로 인정되지 않을 가능성이 높습니다.')
      break
  }

  // 새 입력 기반 추가 리스크 (사업 동일성 / 자산 인수)
  let nf = 0
  const asset = pct(a.assetTakeoverRatio)
  if (asset !== null && asset > 30) {
    risks.push(`기존 자산 인수 ${asset}% — 30% 초과 시 사업확장·승계로 보아 창업 제외 가능성이 있습니다.`)
    nf += 1
  }
  const identity = [a.sameAddress === 'yes', a.reuseIdentity === 'yes', a.employeeMoved === 'yes'].filter(
    Boolean,
  ).length
  if (identity >= 1) {
    risks.push('기존 사업장 주소·거래처·상호·인력의 연속성은 사업 동일성(창업 부정) 쟁점이 됩니다.')
    if (identity >= 2) nf += 1
  }
  if (a.prevIndustryRelation === 'same') {
    risks.push('기존 사업과 동종 영위는 사업확장·재개업으로 보일 수 있습니다. (조특법상 동종 판단)')
    nf += 1
  }
  v = downgrade(v, Math.min(nf, 2))

  // 업종 안내
  const industryNote = form.industry ? INDUSTRY_TAXLAW_NOTE[form.industry] : ''
  if (industryNote) checkPoints.unshift(industryNote)

  // 항목 포인트
  const points: SavingsPoint[] = [
    {
      tone: verdictToTone(v),
      text:
        v === 'bad'
          ? '법인세·소득세 감면 적용이 어려울 수 있습니다.'
          : v === 'good'
            ? '법인세·소득세 감면 검토 대상입니다.'
            : '법인세·소득세 감면 가능성 있으나 제한 검토가 필요합니다.',
    },
  ]

  return {
    key: 'taxLaw',
    title: '조특법 기준 (세액감면)',
    subtitle: '법인세 / 소득세 감면 — 창업중소기업 세액감면(조특법 §6)',
    verdict: v,
    conclusion: CONCLUSION[v],
    points,
    risks,
    checkPoints,
    note: `청년이 아니어도 일반 창업중소기업 세액감면(감면율 축소) 대상이 될 수 있습니다. 청년은 감면율 우대(청년창업중소기업) 요건입니다 — ${youth.taxLawNote} · 동종 업종 판단 기준은 창업지원법과 다를 수 있습니다.`,
  }
}

// ===========================================================================
// 2) 창업지원법 기준 (정책자금 / 창업기업 확인)
// ===========================================================================
function buildStartupLaw(
  form: FormData,
  recognition: Verdict,
  youth: YouthStatus,
): FrameworkResult {
  const a = form.advanced
  let v: Verdict = recognition
  const risks: string[] = []
  const checkPoints: string[] = [
    '창업기업 확인은 청년 여부와 무관하며, 업력 7년 이내 중소기업이면서 창업 제외사유에 해당하지 않으면 가능합니다.',
    '청년(만 39세 이하)은 창업기업 확인의 필수 요건이 아니라 청년전용 정책자금 등 별도 우대 요건입니다.',
  ]

  let nf = 0
  const family = pct(a.familyShare)
  if (family !== null && family > 50) {
    risks.push(`친족 합산 지분 ${family}% — 50% 초과 시 창업기업 인정에서 제외될 수 있습니다.`)
    nf += 1
  }
  const corpExec = pct(a.existingCorpExecShare)
  if (corpExec !== null && corpExec > 50) {
    risks.push(`기존 법인+임원 합산 지분 ${corpExec}% — 50% 초과 시 창업기업 제외 가능성이 있습니다.`)
    nf += 1
  }
  if (a.isOligopoly === 'yes') {
    risks.push('기존 법인 과점주주가 중복되면 창업기업 인정에서 제외될 수 있습니다.')
    nf += 1
  }
  if (form.startupForm === 'reopen_same' || a.prevIndustryRelation === 'same') {
    risks.push('폐업 후 동종 재개업은 폐업 후 3년(부도·파산은 2년) 경과 여부 확인이 필요합니다.')
    nf += 1
    checkPoints.push('폐업일~재창업일 경과기간(동종 3년 / 부도·파산 2년)을 확인해야 합니다.')
  }
  if (a.hasExistingCorp === 'yes' || a.isExistingExec === 'yes') {
    risks.push('기존 법인 보유·임원 등재 여부는 창업기업 독립성 판단에 영향을 줄 수 있습니다.')
  }
  v = downgrade(v, Math.min(nf, 2))

  const points: SavingsPoint[] = [
    {
      tone: verdictToTone(v),
      text:
        v === 'bad'
          ? '창업기업 확인이 어려울 수 있습니다.'
          : v === 'good'
            ? '창업기업 확인 및 정책자금 검토 대상입니다.'
            : '창업기업 확인 가능성 있으나 지분·승계 요건 확인이 필요합니다.',
    },
  ]

  return {
    key: 'startupLaw',
    title: '창업지원법 기준',
    subtitle: '정책자금 / 창업기업 확인 — 중소기업창업 지원법',
    verdict: v,
    conclusion: CONCLUSION[v],
    points,
    risks,
    checkPoints,
    note: `창업기업 확인은 청년이 아니어도 요건 충족 시 가능합니다. 청년(만 39세 이하)은 별도 우대 요건입니다 — ${youth.startupLawNote} · 동종 업종 판단 기준은 조특법과 다를 수 있습니다.`,
  }
}

// ===========================================================================
// 3) 지방세 기준 (취득세 / 재산세 / 등록면허세 참고)
// ===========================================================================
function buildLocalTax(
  acquisition: ItemResult | undefined,
  property: ItemResult | undefined,
  registrationNote: string | null,
): FrameworkResult {
  const points: SavingsPoint[] = []
  if (acquisition) {
    points.push({
      tone: verdictToTone(acquisition.verdict),
      text:
        acquisition.verdict === 'good'
          ? '취득세 감면 검토 가능'
          : acquisition.verdict === 'bad'
            ? '취득세 감면 어려움'
            : '취득세 감면 제한 검토 필요',
    })
  }
  if (property) {
    points.push({
      tone: verdictToTone(property.verdict),
      text:
        property.verdict === 'good'
          ? '재산세 감면 검토 가능'
          : property.verdict === 'bad'
            ? '재산세 감면 어려움'
            : '재산세 감면 제한 검토 필요',
    })
  }

  // 종합: 취득세·재산세 중 가장 보수적
  let v: Verdict = 'good'
  if (acquisition) v = worst(v, acquisition.verdict)
  if (property) v = worst(v, property.verdict)
  if (!acquisition && !property) v = 'conditional'

  const checkPoints = [
    '사업용으로 직접 사용하는 부동산인지(투자·임대 제외) 확인이 필요합니다.',
    '지방세특례제한법상 요건·적용기한을 관할 지자체에 확인하는 것이 안전합니다.',
  ]

  return {
    key: 'localTax',
    title: '지방세 기준 (참고)',
    subtitle: '취득세 / 재산세 / 등록면허세 — 지방세특례제한법',
    verdict: v,
    conclusion: CONCLUSION[v],
    points,
    risks: registrationNote ? [`등록면허세: ${registrationNote}`] : [],
    checkPoints,
    note: '지방세 감면은 취득 목적·시점·권역에 따라 달라지며, 등록면허세는 개정·일몰 확인이 필요합니다.',
  }
}

// ===========================================================================
// 통합
// ===========================================================================
export function buildFrameworks(
  form: FormData,
  allCore: ItemResult[],
  recognition: Verdict,
  youth: YouthStatus,
  registrationNote: string | null,
): FrameworkResult[] {
  const income = allCore.find((i) => i.key === 'incomeTax')
  const acquisition = allCore.find((i) => i.key === 'acquisitionTax')
  const property = allCore.find((i) => i.key === 'propertyTax')

  return [
    buildTaxLaw(form, income, youth),
    buildStartupLaw(form, recognition, youth),
    buildLocalTax(acquisition, property, registrationNote),
  ]
}
