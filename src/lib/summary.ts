import type { FormData, JudgementResult } from '../types'
import { VERDICT_LABEL } from './judgement'
import { LABEL, labelOf } from './options'
import { formatDate, formatKoreanDate } from './date'

// 카카오톡/문자 전송용 상세 요약문
// 고객에게 바로 전달 가능한 수준으로, 친절하고 구체적으로 작성한다.
export function buildSummaryText(
  form: FormData,
  result: JudgementResult,
  baseDate: Date = new Date(),
): string {
  const L: string[] = []
  const today = formatDate(baseDate)

  L.push('━━━━━━━━━━━━━━━')
  L.push('📋 창업감면 사전진단 결과')
  L.push(`📅 진단일: ${today}`)
  L.push('━━━━━━━━━━━━━━━')
  L.push('')

  // 인사 + 종합 한 줄
  L.push('대표님 입력 정보를 바탕으로 창업기업 감면 가능성을 1차 진단해 드립니다.')
  L.push('')

  // 종합 판정 + 점수
  L.push(`■ 종합 판정: ${VERDICT_LABEL[result.overall]}`)
  L.push(`■ 감면 가능성 점수: ${result.score}점 / 100점`)
  L.push('')

  // 입력 요약
  L.push('■ 입력하신 정보')
  L.push(`· 사업자 유형: ${labelOf(LABEL.businessType, form.businessType)}`)
  if (result.age !== null) {
    L.push(`· 대표자 나이: 만 ${result.age}세${result.isYouth ? ' (청년 요건 해당 가능)' : ''}`)
  }
  if (form.startupDate) L.push(`· 창업일: ${formatKoreanDate(form.startupDate)}`)
  L.push(`· 사업장 지역: ${labelOf(LABEL.region, form.region)}`)
  L.push(`· 과밀억제권역: ${labelOf(LABEL.overconcentration, form.overconcentration)}`)
  L.push(`· 업종: ${labelOf(LABEL.industry, form.industry)}`)
  L.push(`· 창업 형태: ${labelOf(LABEL.startupForm, form.startupForm)}`)
  L.push('')

  // 창업 인정 여부
  L.push('■ 창업 인정 여부')
  L.push(`· ${result.startupRecognitionNote}`)
  if (result.exclusionReasons.length > 0) {
    L.push('· 아래 사유로 창업 인정이 제한될 수 있습니다:')
    for (const ex of result.exclusionReasons) {
      L.push(`  - ${ex.title}: ${ex.detail}`)
    }
  }
  L.push('')

  // 항목별 판정
  L.push('■ 항목별 감면 판정')
  for (const item of result.items) {
    L.push(`· ${item.title} → ${VERDICT_LABEL[item.verdict]}`)
    if (item.reasons[0]) L.push(`   ${item.reasons[0]}`)
  }
  L.push('')

  // 다음 단계 안내 (추가 확인사항 모아서)
  const checkPoints = collectTopCheckPoints(result)
  if (checkPoints.length > 0) {
    L.push('■ 다음 단계로 확인할 사항')
    checkPoints.forEach((c, i) => L.push(`${i + 1}. ${c}`))
    L.push('')
  }

  // 청년/병역 안내
  if (result.isYouth !== null) {
    L.push('※ 병역기간에 따라 청년 여부(만 34세 기준)가 달라질 수 있습니다.')
    L.push('')
  }

  // 마무리 멘트
  L.push('정확한 적용 여부는 업종 코드와 창업 형태, 과밀억제권역 확인 후 안내드리겠습니다.')
  L.push('편하게 문의 주세요. 감사합니다. 🙇')
  L.push('')

  // 주의 문구
  L.push('─────────────')
  L.push(
    '※ 본 결과는 상담용 1차 판정이며, 실제 감면 적용 여부는 조세특례제한법·지방세특례제한법, 업종코드, 창업 형태, 과밀억제권역 여부, 지자체 해석에 따라 달라질 수 있습니다. 최종 적용 전 세무사 또는 관할 지자체 확인이 필요합니다.',
  )

  return L.join('\n')
}

// 항목별 추가 확인사항 중 대표적인 것을 중복 없이 모음 (최대 5개)
function collectTopCheckPoints(result: JudgementResult): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const item of result.items) {
    const first = item.checkPoints[0]
    if (first && !seen.has(first)) {
      seen.add(first)
      out.push(first)
    }
    if (out.length >= 5) break
  }
  return out
}
