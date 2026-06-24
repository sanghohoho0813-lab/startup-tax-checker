import type { ConsultPriority, PriorityGrade } from '../types'

// 등급별 색상 토큰
const GRADE_STYLE: Record<PriorityGrade, { ring: string; badge: string; text: string }> = {
  A: { ring: 'border-green-200 bg-green-50', badge: 'bg-green-600', text: 'text-green-700' },
  B: { ring: 'border-amber-200 bg-amber-50', badge: 'bg-amber-500', text: 'text-amber-700' },
  C: { ring: 'border-orange-200 bg-orange-50', badge: 'bg-orange-500', text: 'text-orange-700' },
  D: { ring: 'border-gray-200 bg-gray-50', badge: 'bg-gray-500', text: 'text-gray-600' },
}

// 상담 우선순위 카드 — 상담사가 연락 순서를 판단
export default function PriorityCard({ priority }: { priority: ConsultPriority }) {
  const s = GRADE_STYLE[priority.grade]
  return (
    <div className={`flex items-center gap-4 rounded-3xl border ${s.ring} p-6 shadow-card sm:p-7`}>
      {/* 등급 배지 */}
      <div
        className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl ${s.badge} text-white`}
      >
        <span className="text-3xl font-extrabold leading-none">{priority.grade}</span>
        <span className="mt-0.5 text-[10px] font-bold opacity-80">등급</span>
      </div>

      <div>
        <div className="text-base font-medium text-gray-500">상담 우선순위</div>
        <div className={`text-xl font-extrabold ${s.text}`}>{priority.label}</div>
        <p className="mt-1 text-base leading-relaxed text-gray-600">{priority.description}</p>
      </div>
    </div>
  )
}
