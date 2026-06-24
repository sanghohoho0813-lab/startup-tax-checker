import type { JudgementResult, Verdict } from '../types'
import { VERDICT_EMOJI, VERDICT_LABEL } from './judgement'

// 종합판정별 고객 친화 문장
const CUSTOMER_LINE: Record<Verdict, string> = {
  good: '대표님은 현재 기준 창업감면 검토 가능성이 높은 편으로 확인됩니다.',
  caution: '대표님은 현재 기준 창업감면 가능성은 있으나 일부 확인이 필요합니다.',
  conditional: '대표님은 현재 기준 창업 구조에 따라 감면 결과가 달라질 수 있습니다.',
  bad: '대표님은 현재 기준 창업감면 적용이 어려울 가능성이 있습니다.',
}

// 카카오톡/문자 전송용 요약문 (고객이 읽기 쉬운 대화체, 10줄 이내)
export function buildSummaryText(result: JudgementResult): string {
  const L: string[] = []

  L.push('[창업감면 사전진단 결과]')
  L.push('')
  L.push('종합판정')
  L.push(`${VERDICT_EMOJI[result.overall]} ${VERDICT_LABEL[result.overall]}`)
  L.push('')
  L.push(CUSTOMER_LINE[result.overall])

  // 추가 확인 필요 (최대 2개)
  if (result.keyChecks.length > 0) {
    L.push('')
    L.push('추가 확인 필요')
    for (const c of result.keyChecks.slice(0, 2)) L.push(`- ${c.replace(/\s*확인$/, '')}`)
  }

  L.push('')
  L.push('상담 시 정확한 적용 가능 여부를 확인해드릴 수 있습니다.')

  return L.join('\n')
}
