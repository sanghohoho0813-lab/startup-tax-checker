import type { SavingsPoint } from '../types'

// 예상 절세 포인트 — 결과 화면 최상단
// "검토받으면 돈을 아낄 수 있겠다"를 느끼게 한다 (정확 세액 계산 아님)
export default function SavingsCard({ points }: { points: SavingsPoint[] }) {
  if (points.length === 0) return null

  return (
    <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-6 shadow-card sm:p-7">
      <div className="flex items-center gap-2.5">
        <span className="text-2xl">💰</span>
        <h3 className="text-xl font-bold text-gray-900">예상 절세 포인트</h3>
      </div>
      <p className="mt-2 text-base leading-relaxed text-gray-500">
        아래 항목은 전문가 검토 시 절세 가능성을 확인할 수 있는 부분입니다.
      </p>

      <ul className="mt-4 space-y-2.5">
        {points.map((p, i) => {
          const good = p.tone !== 'bad'
          return (
            <li
              key={i}
              className={[
                'flex items-start gap-3 rounded-2xl p-4 text-lg font-semibold leading-relaxed',
                good ? 'bg-white text-gray-800' : 'bg-red-50 text-red-700',
              ].join(' ')}
            >
              <span className="text-xl">{good ? '🟢' : '🔴'}</span>
              <span>{p.text}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
