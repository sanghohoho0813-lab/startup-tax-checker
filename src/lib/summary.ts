import type { JudgementResult } from '../types'
import { VERDICT_EMOJI, VERDICT_LABEL } from './judgement'

// 카카오톡/문자 전송용 간결 요약문 (고객 발송용, 10줄 내외)
export function buildSummaryText(result: JudgementResult): string {
  const L: string[] = []

  L.push('[창업감면 사전진단 결과]')
  L.push('')
  L.push('종합판정:')
  L.push(`${VERDICT_EMOJI[result.overall]} ${VERDICT_LABEL[result.overall]}`)
  L.push('')

  // 판정 사유 (최대 3개)
  if (result.reasons.length > 0) {
    L.push('판정 사유:')
    for (const r of result.reasons.slice(0, 3)) L.push(`- ${r}`)
    L.push('')
  }

  // 추가 확인 필요 (최대 2개)
  if (result.keyChecks.length > 0) {
    L.push('추가 확인 필요:')
    for (const c of result.keyChecks.slice(0, 2)) L.push(`- ${c}`)
    L.push('')
  }

  L.push('※ 최종 적용 여부는 세무 검토가 필요합니다.')

  return L.join('\n')
}
