// 상담 시 확인해야 할 핵심 질문 카드 (컨설턴트용)
export default function ConsultCard({ questions }: { questions: string[] }) {
  if (questions.length === 0) return null

  return (
    <div className="rounded-3xl border border-blue-100 bg-blue-50/60 p-6 shadow-card sm:p-7">
      <div className="flex items-center gap-2.5">
        <span className="text-2xl">💬</span>
        <h3 className="text-xl font-bold text-gray-900">상담 시 확인해야 할 핵심 질문</h3>
      </div>
      <p className="mt-2 text-base leading-relaxed text-gray-500">
        대표님께 아래 항목을 직접 확인하면 판정이 더 정확해집니다.
      </p>

      <ul className="mt-4 space-y-2.5">
        {questions.map((q, i) => (
          <li
            key={q}
            className="flex items-start gap-3 rounded-2xl bg-white p-4 text-lg leading-relaxed text-gray-800"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
              {i + 1}
            </span>
            <span>{q}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
