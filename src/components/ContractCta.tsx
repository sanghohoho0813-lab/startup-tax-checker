// 계약 유도 영역 — 절세 가능성 강조 + 전문가 상담 체크리스트
export default function ContractCta({ checklist }: { checklist: string[] }) {
  return (
    <div className="rounded-3xl border border-brand/30 bg-brand/5 p-6 shadow-card sm:p-7">
      {/* 강조 문구 */}
      <div className="rounded-2xl bg-brand px-5 py-4 text-center">
        <p className="text-xl font-extrabold leading-snug text-white">
          추가 확인 시 절세 가능성이
          <br className="sm:hidden" /> 달라질 수 있습니다.
        </p>
      </div>

      {/* 체크리스트 */}
      <div className="mt-5">
        <h3 className="text-lg font-bold text-gray-900">전문가 상담 시 확인할 항목</h3>
        <ul className="mt-3 space-y-2">
          {checklist.map((c) => (
            <li
              key={c}
              className="flex items-center gap-3 rounded-2xl bg-white p-4 text-lg font-medium text-gray-800"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-brand text-brand">
                ☐
              </span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-center text-base font-medium text-brand-dark">
        세무 전문가 상담으로 적용 가능성을 정확히 확인해 보세요.
      </p>
    </div>
  )
}
