import { useState } from 'react'
import type { ItemResult, JudgementResult, Verdict } from '../types'
import { DISCLAIMER, VERDICT_LABEL } from '../lib/judgement'

interface Props {
  result: JudgementResult
  summaryText: string
  onBack: () => void
}

// 판정 상태별 스타일 토큰
const VERDICT_STYLE: Record<
  Verdict,
  { bg: string; border: string; text: string; chipBg: string; emoji: string }
> = {
  good: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    chipBg: 'bg-green-600',
    emoji: '🟢',
  },
  caution: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    chipBg: 'bg-amber-500',
    emoji: '🟡',
  },
  bad: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    chipBg: 'bg-red-600',
    emoji: '🔴',
  },
  review: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-700',
    chipBg: 'bg-gray-500',
    emoji: '⚪',
  },
}

function VerdictChip({ verdict }: { verdict: Verdict }) {
  const s = VERDICT_STYLE[verdict]
  return (
    <span
      className={`inline-flex items-center rounded-full ${s.chipBg} px-3 py-1 text-sm font-bold text-white`}
    >
      {VERDICT_LABEL[verdict]}
    </span>
  )
}

function OverallCard({ result }: { result: JudgementResult }) {
  const s = VERDICT_STYLE[result.overall]
  return (
    <div className={`rounded-3xl border ${s.border} ${s.bg} p-6 shadow-card`}>
      <div className="text-sm font-medium text-gray-500">종합 판정</div>
      <div className="mt-2 flex items-center gap-3">
        <span className="text-4xl">{s.emoji}</span>
        <span className={`text-2xl font-extrabold ${s.text}`}>
          {VERDICT_LABEL[result.overall]}
        </span>
      </div>
      <p className="mt-4 text-base leading-relaxed text-gray-700">{result.overallSummary}</p>

      {/* 부가 정보 */}
      <div className="mt-4 flex flex-wrap gap-2">
        {result.age !== null && (
          <span className="rounded-full bg-white/70 px-3 py-1 text-sm font-medium text-gray-600">
            만 {result.age}세
          </span>
        )}
        {result.isYouth === true && (
          <span className="rounded-full bg-white/70 px-3 py-1 text-sm font-medium text-gray-600">
            청년 요건 해당 가능
          </span>
        )}
        {result.isYouth === false && (
          <span className="rounded-full bg-white/70 px-3 py-1 text-sm font-medium text-gray-600">
            청년 요건 미해당
          </span>
        )}
      </div>

      <div className="mt-3 rounded-2xl bg-white/60 p-3 text-sm text-gray-600">
        <span className="font-semibold">창업 인정 여부: </span>
        {result.startupRecognitionNote}
      </div>

      {result.isYouth !== null && (
        <p className="mt-3 text-sm text-gray-500">
          ※ 병역기간에 따라 청년 여부가 달라질 수 있습니다.
        </p>
      )}
    </div>
  )
}

function ItemCard({ item }: { item: ItemResult }) {
  const s = VERDICT_STYLE[item.verdict]
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-card sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
        <VerdictChip verdict={item.verdict} />
      </div>

      {/* 이유 */}
      <div className={`mt-4 rounded-2xl ${s.bg} p-4`}>
        <div className={`mb-1.5 text-sm font-bold ${s.text}`}>판단 이유</div>
        <ul className="space-y-1.5">
          {item.reasons.map((r, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed text-gray-700">
              <span className="text-gray-400">•</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 추가 확인 필요사항 */}
      <div className="mt-3">
        <div className="mb-1.5 text-sm font-bold text-gray-800">추가 확인 필요사항</div>
        <ul className="space-y-1.5">
          {item.checkPoints.map((c, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed text-gray-600">
              <span className="text-gray-300">▸</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 상담 멘트 예시 */}
      <div className="mt-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4">
        <div className="mb-1 text-xs font-bold text-gray-400">상담 멘트 예시</div>
        <p className="text-sm leading-relaxed text-gray-700">“{item.consultScript}”</p>
      </div>
    </div>
  )
}

export default function ResultCards({ result, summaryText, onBack }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText)
    } catch {
      // 클립보드 API 미지원 시 폴백
      const ta = document.createElement('textarea')
      ta.value = summaryText
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-4">
      <OverallCard result={result} />

      {/* 액션 */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-2xl border border-gray-200 bg-white px-5 py-3.5 text-base font-bold text-gray-600 shadow-card transition-colors hover:bg-gray-50"
        >
          다시 입력
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="flex-1 rounded-2xl bg-brand px-5 py-3.5 text-base font-bold text-white shadow-card transition-colors hover:bg-brand-dark"
        >
          {copied ? '✓ 복사됨' : '결과 요약 복사'}
        </button>
      </div>

      {/* 항목별 카드 */}
      <div className="flex flex-col gap-3">
        {result.items.map((item) => (
          <ItemCard key={item.key} item={item} />
        ))}
      </div>

      {/* 카카오톡/문자용 요약 미리보기 */}
      <details className="rounded-3xl border border-gray-100 bg-white p-5 shadow-card">
        <summary className="cursor-pointer text-base font-bold text-gray-800">
          카카오톡/문자용 요약문 보기
        </summary>
        <pre className="mt-3 whitespace-pre-wrap break-words rounded-2xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
          {summaryText}
        </pre>
      </details>

      {/* 주의 문구 */}
      <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
        <div className="mb-1 text-sm font-bold text-gray-500">⚠️ 안내</div>
        <p className="text-sm leading-relaxed text-gray-500">{DISCLAIMER}</p>
      </div>
    </div>
  )
}
