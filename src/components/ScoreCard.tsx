import type { ScoreFactor } from '../types'
import { scoreBand } from '../lib/score'
import { scoreColor } from '../lib/verdictStyle'

interface Props {
  score: number
  factors: ScoreFactor[]
}

// 감면 가능성 점수 (0~100) + 산정 근거
export default function ScoreCard({ score, factors }: Props) {
  const color = scoreColor(score)
  const band = scoreBand(score)
  // 원형 게이지 (SVG)
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const dash = (score / 100) * circumference

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-card sm:p-7">
      <div className="flex items-center gap-5">
        {/* 게이지 */}
        <div className="relative h-32 w-32 shrink-0">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="#f1f3f5" strokeWidth="12" />
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-gray-900">{score}</span>
            <span className="text-sm font-medium text-gray-400">/ 100점</span>
          </div>
        </div>

        {/* 요약 */}
        <div>
          <div className="text-base font-medium text-gray-500">감면 가능성 점수</div>
          <div className="mt-1 text-xl font-extrabold" style={{ color }}>
            {band.label}
          </div>
          <p className="mt-2 text-base leading-relaxed text-gray-500">
            입력 정보를 바탕으로 한 상대적 가능성 지표입니다.
          </p>
        </div>
      </div>

      {/* 산정 근거 */}
      <div className="mt-5 space-y-3">
        <div className="text-base font-bold text-gray-800">점수 산정 근거</div>
        {factors.map((f) => {
          const ratio = f.max > 0 ? f.points / f.max : 0
          return (
            <div key={f.label}>
              <div className="flex items-center justify-between text-base">
                <span className="font-semibold text-gray-700">{f.label}</span>
                <span className="font-bold text-gray-900">
                  {f.points}
                  <span className="text-gray-400"> / {f.max}점</span>
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${ratio * 100}%`, backgroundColor: scoreColor(score) }}
                />
              </div>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">{f.note}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
