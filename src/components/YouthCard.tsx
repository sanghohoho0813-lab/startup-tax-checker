import type { YouthStatus } from '../types'

function badge(state: boolean | null): { text: string; cls: string } {
  if (state === true) return { text: '해당 가능', cls: 'bg-green-600 text-white' }
  if (state === false) return { text: '미해당', cls: 'bg-gray-400 text-white' }
  return { text: '확인 필요', cls: 'bg-amber-500 text-white' }
}

// 청년 기준 이중 표시 (조특법 / 창업지원법)
export default function YouthCard({ youth }: { youth: YouthStatus }) {
  const tax = badge(youth.taxLaw)
  const startup = badge(youth.startupLaw)

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-card sm:p-6">
      <div className="flex items-center gap-2.5">
        <span className="text-2xl">🎂</span>
        <h3 className="text-xl font-bold text-gray-900">청년 기준 (법별 분리)</h3>
        {youth.age !== null && (
          <span className="ml-auto text-base font-bold text-gray-400">만 {youth.age}세</span>
        )}
      </div>

      <div className="mt-3.5 space-y-2.5">
        <div className="rounded-2xl bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-gray-800">조특법 청년</span>
            <span className={`rounded-full px-3 py-1 text-sm font-bold ${tax.cls}`}>{tax.text}</span>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
            만 15~34세 (병역 최대 6년 차감) · {youth.taxLawNote}
          </p>
        </div>

        <div className="rounded-2xl bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-gray-800">창업지원법 청년</span>
            <span className={`rounded-full px-3 py-1 text-sm font-bold ${startup.cls}`}>
              {startup.text}
            </span>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
            만 39세 이하 · {youth.startupLawNote}
          </p>
        </div>
      </div>
    </div>
  )
}
