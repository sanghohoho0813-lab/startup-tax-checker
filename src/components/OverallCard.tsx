import type { JudgementResult } from '../types'
import { VERDICT_LABEL } from '../lib/judgement'
import { VERDICT_STYLE } from '../lib/verdictStyle'

// 종합 판정 카드 (상단)
export default function OverallCard({ result }: { result: JudgementResult }) {
  const s = VERDICT_STYLE[result.overall]
  return (
    <div className={`rounded-3xl border ${s.border} ${s.bg} p-7 shadow-card`}>
      <div className="text-base font-medium text-gray-500">종합 판정</div>
      <div className="mt-2 flex items-center gap-3">
        <span className="text-5xl">{s.emoji}</span>
        <div>
          <span className={`text-3xl font-extrabold ${s.text}`}>
            {VERDICT_LABEL[result.overall]}
          </span>
          <div className="mt-1 text-lg font-bold text-gray-500">
            감면 가능성 {result.score}점 / 100점
          </div>
        </div>
      </div>

      <p className="mt-4 text-lg leading-relaxed text-gray-700">{result.overallSummary}</p>

      {/* 청년 / 나이 칩 */}
      <div className="mt-4 flex flex-wrap gap-2">
        {result.age !== null && (
          <Chip>만 {result.age}세</Chip>
        )}
        {result.isYouth === true && <Chip>청년 요건 해당 가능</Chip>}
        {result.isYouth === false && <Chip>청년 요건 미해당</Chip>}
      </div>

      {/* 창업 인정 여부 */}
      <div className="mt-4 rounded-2xl bg-white/70 p-4 text-base text-gray-600">
        <span className="font-semibold text-gray-800">창업 인정 여부: </span>
        {result.startupRecognitionNote}
      </div>

      {result.isYouth !== null && (
        <p className="mt-3 text-base text-gray-500">
          ※ 병역기간에 따라 청년 여부가 달라질 수 있습니다.
        </p>
      )}
    </div>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-white/80 px-3.5 py-1.5 text-base font-medium text-gray-600">
      {children}
    </span>
  )
}
