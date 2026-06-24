// 많은 대표님들이 놓치는 부분 — 결과별 자동 생성 체크포인트
export default function MissedPointsCard({ points }: { points: string[] }) {
  if (points.length === 0) return null

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-card sm:p-7">
      <div className="flex items-center gap-2.5">
        <span className="text-2xl">🔎</span>
        <h3 className="text-xl font-bold text-gray-900">많은 대표님들이 놓치는 부분</h3>
      </div>

      <ul className="mt-4 space-y-2.5">
        {points.map((p, i) => (
          <li
            key={i}
            className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4 text-base leading-relaxed text-gray-700"
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-gray-300 text-xs text-gray-400">
              ☐
            </span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
