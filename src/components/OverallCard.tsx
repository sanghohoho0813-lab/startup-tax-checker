import type { JudgementResult } from '../types'
import { VERDICT_LABEL } from '../lib/judgement'
import { VERDICT_STYLE } from '../lib/verdictStyle'

// 종합 판정 카드 (상단) — 한줄 결론 + 종합판정 + 주요 확인사항
export default function OverallCard({ result }: { result: JudgementResult }) {
  const s = VERDICT_STYLE[result.overall]
  return (
    <div className={`rounded-3xl border ${s.border} ${s.bg} p-7 shadow-card`}>
      {/* 한줄 결론 */}
      <div className="text-base font-medium text-gray-500">한줄 결론</div>
      <p className={`mt-1.5 text-2xl font-extrabold leading-snug ${s.text}`}>
        {result.oneLineConclusion}
      </p>

      {/* 종합판정 배지 */}
      <div className="mt-5 flex items-center gap-3 border-t border-black/5 pt-5">
        <span className="text-5xl">{s.emoji}</span>
        <div>
          <div className="text-base font-medium text-gray-500">종합 판정</div>
          <span className={`text-2xl font-extrabold ${s.text}`}>{VERDICT_LABEL[result.overall]}</span>
        </div>
      </div>

      {/* 판정 사유 칩 */}
      {result.reasons.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {result.reasons.map((r) => (
            <span
              key={r}
              className="rounded-full bg-white/80 px-3.5 py-1.5 text-base font-medium text-gray-600"
            >
              {r}
            </span>
          ))}
        </div>
      )}

      {/* 주요 확인사항 */}
      {result.keyChecks.length > 0 && (
        <div className="mt-4 rounded-2xl bg-white/70 p-4">
          <div className="mb-1.5 text-base font-bold text-gray-800">주요 확인사항</div>
          <ul className="space-y-1">
            {result.keyChecks.map((c) => (
              <li key={c} className="flex gap-2 text-base leading-relaxed text-gray-600">
                <span className="text-gray-400">•</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.isYouth !== null && (
        <p className="mt-3 text-sm text-gray-500">
          ※ 병역기간에 따라 청년 여부가 달라질 수 있습니다.
        </p>
      )}
    </div>
  )
}
