import { useState } from 'react'
import type { JudgementResult } from '../types'
import { DISCLAIMER } from '../lib/judgement'
import { Accordion } from './ui'
import OverallCard from './OverallCard'
import ConsultCard from './ConsultCard'
import ContractCta from './ContractCta'
import ExclusionCard from './ExclusionCard'
import ItemCard from './ItemCard'
import RegistrationReference from './RegistrationReference'

interface Props {
  result: JudgementResult
  summaryText: string
  onBack: () => void
  onPrint: () => void
}

export default function ResultCards({ result, summaryText, onBack, onPrint }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText)
    } catch {
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
      {/* 1) 초기 노출: 종합판정 + 한줄결론 + 주요 확인사항 */}
      <OverallCard result={result} />

      {/* 액션 버튼 */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-2xl border border-gray-200 bg-white px-6 py-4 text-lg font-bold text-gray-600 shadow-card transition-colors hover:bg-gray-50"
        >
          다시 입력
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="flex-1 rounded-2xl bg-brand px-6 py-4 text-lg font-bold text-white shadow-card transition-colors hover:bg-brand-dark"
        >
          {copied ? '✓ 복사됨' : '카톡 요약 복사'}
        </button>
        <button
          type="button"
          onClick={onPrint}
          className="rounded-2xl border border-brand bg-white px-6 py-4 text-lg font-bold text-brand shadow-card transition-colors hover:bg-brand/5"
        >
          PDF 출력
        </button>
      </div>

      {/* 2) 상담 핵심 질문 (컨설턴트용) */}
      <ConsultCard questions={result.consultQuestions} />

      {/* 3) 상세보기 — 기본 닫힘 아코디언 */}
      <Accordion title="상세보기 (항목별 판정)">
        <div className="flex flex-col gap-3">
          {result.coreItems.map((item) => (
            <ItemCard key={item.key} item={item} />
          ))}

          {result.registration && <RegistrationReference data={result.registration} />}

          <ExclusionCard reasons={result.exclusionReasons} />

          {/* 카카오톡 요약 미리보기 */}
          <details className="rounded-3xl border border-gray-100 bg-white p-6 shadow-card">
            <summary className="cursor-pointer text-lg font-bold text-gray-800">
              카카오톡 전송용 요약문 보기
            </summary>
            <pre className="mt-3 whitespace-pre-wrap break-words rounded-2xl bg-gray-50 p-4 text-base leading-relaxed text-gray-700">
              {summaryText}
            </pre>
          </details>
        </div>
      </Accordion>

      {/* 4) 계약 유도 CTA */}
      <ContractCta checklist={result.consultChecklist} />

      {/* 주의 문구 */}
      <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6">
        <div className="mb-1 text-base font-bold text-gray-500">⚠️ 안내</div>
        <p className="text-base leading-relaxed text-gray-500">{DISCLAIMER}</p>
      </div>
    </div>
  )
}
