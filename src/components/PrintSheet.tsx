import type { FormData, JudgementResult } from '../types'
import { VERDICT_LABEL } from '../lib/judgement'
import { LABEL, labelOf } from '../lib/options'
import { formatDate, formatKoreanDate } from '../lib/date'

interface Props {
  form: FormData
  result: JudgementResult
  baseDate: Date
}

// A4 1페이지 「창업감면 사전진단 결과서」
// 화면에서는 숨기고(hidden) 인쇄 시에만 표시(print:block)된다.
// 인쇄 색상이 유지되도록 명시적 색상과 print-color-adjust를 사용한다.
export default function PrintSheet({ form, result, baseDate }: Props) {
  const today = formatDate(baseDate)
  const verdictColor = VERDICT_PRINT_COLOR[result.overall]

  return (
    <div className="print-area hidden bg-white text-[11px] leading-snug text-gray-900 print:block">
      {/* 머리글 */}
      <div className="flex items-start justify-between border-b-2 border-gray-900 pb-2">
        <div>
          <h1 className="text-[18px] font-extrabold">창업감면 사전진단 결과서</h1>
          <p className="mt-0.5 text-[10px] text-gray-500">
            세무·법인컨설팅 상담용 1차 판정 자료
          </p>
        </div>
        <div className="text-right text-[10px] text-gray-600">
          <div>진단일: {today}</div>
        </div>
      </div>

      {/* 입력 요약 */}
      <table className="mt-3 w-full border-collapse text-[10px]">
        <tbody>
          <Row
            cells={[
              ['사업자 유형', labelOf(LABEL.businessType, form.businessType)],
              ['대표자 나이', result.age !== null ? `만 ${result.age}세` : '-'],
            ]}
          />
          <Row
            cells={[
              ['창업일', form.startupDate ? formatKoreanDate(form.startupDate) : '-'],
              ['청년 여부', result.isYouth === null ? '-' : result.isYouth ? '해당 가능' : '미해당'],
            ]}
          />
          <Row
            cells={[
              ['사업장 지역', labelOf(LABEL.region, form.region)],
              ['과밀억제권역', labelOf(LABEL.overconcentration, form.overconcentration)],
            ]}
          />
          <Row
            cells={[
              ['업종', labelOf(LABEL.industry, form.industry)],
              ['창업 형태', labelOf(LABEL.startupForm, form.startupForm)],
            ]}
          />
        </tbody>
      </table>

      {/* 종합 판정 */}
      <div className="mt-3 flex items-center justify-between rounded border border-gray-300 px-3 py-2">
        <div>
          <span className="text-[10px] text-gray-500">종합 판정</span>
          <div className="text-[15px] font-extrabold" style={{ color: verdictColor }}>
            {VERDICT_LABEL[result.overall]}
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-gray-500">감면 가능성 점수</span>
          <div className="text-[15px] font-extrabold" style={{ color: verdictColor }}>
            {result.score} / 100점
          </div>
        </div>
      </div>
      <p className="mt-1.5 text-[10px] leading-relaxed text-gray-700">{result.overallSummary}</p>

      {/* 창업 제외사유 */}
      {result.exclusionReasons.length > 0 && (
        <div className="mt-3">
          <SectionTitle>창업 제외사유 진단</SectionTitle>
          {result.exclusionReasons.map((r) => (
            <p key={r.title} className="mt-1 text-[10px] leading-relaxed text-gray-700">
              <b>· {r.title}</b> — {r.detail}
            </p>
          ))}
        </div>
      )}

      {/* 항목별 판정 */}
      <div className="mt-3">
        <SectionTitle>항목별 감면 판정</SectionTitle>
        <table className="mt-1 w-full border-collapse text-[10px]">
          <thead>
            <tr className="bg-gray-100">
              <th className="w-[28%] border border-gray-300 px-2 py-1 text-left">항목</th>
              <th className="w-[20%] border border-gray-300 px-2 py-1 text-left">판정</th>
              <th className="border border-gray-300 px-2 py-1 text-left">주요 사유</th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((item) => (
              <tr key={item.key}>
                <td className="border border-gray-300 px-2 py-1 font-semibold">{item.title}</td>
                <td
                  className="border border-gray-300 px-2 py-1 font-bold"
                  style={{ color: VERDICT_PRINT_COLOR[item.verdict] }}
                >
                  {VERDICT_LABEL[item.verdict]}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-gray-700">
                  {item.reasons[0] ?? '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 추가 확인사항 */}
      <div className="mt-3">
        <SectionTitle>추가 확인 필요사항</SectionTitle>
        <ul className="mt-1 list-disc pl-4 text-[10px] leading-relaxed text-gray-700">
          {collectCheckPoints(result).map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </div>

      {/* 주의 문구 */}
      <p className="mt-4 border-t border-gray-300 pt-2 text-[9px] leading-relaxed text-gray-500">
        ※ 본 결과는 상담용 1차 판정이며, 실제 감면 적용 여부는 조세특례제한법·지방세특례제한법,
        업종코드, 창업 형태, 과밀억제권역 여부, 지자체 해석에 따라 달라질 수 있습니다. 최종 적용
        전 세무사 또는 관할 지자체 확인이 필요합니다.
      </p>
    </div>
  )
}

const VERDICT_PRINT_COLOR: Record<string, string> = {
  good: '#16a34a',
  caution: '#d97706',
  bad: '#dc2626',
  review: '#4b5563',
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-4 border-gray-900 pl-2 text-[12px] font-bold text-gray-900">
      {children}
    </div>
  )
}

function Row({ cells }: { cells: [string, string][] }) {
  return (
    <tr>
      {cells.map(([k, v], i) => (
        <td key={i} className="border border-gray-200 px-2 py-1">
          <span className="font-semibold text-gray-500">{k}</span>
          <span className="ml-2 text-gray-900">{v}</span>
        </td>
      ))}
    </tr>
  )
}

function collectCheckPoints(result: JudgementResult): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const item of result.items) {
    for (const c of item.checkPoints) {
      if (!seen.has(c)) {
        seen.add(c)
        out.push(c)
      }
    }
  }
  return out.slice(0, 8)
}
