import { useMemo, useState } from 'react'
import type { ExemptionKey, FormData } from './types'
import { buildSummaryText, judge } from './lib/judgement'
import InputForm from './components/InputForm'
import ResultCards from './components/ResultCards'

const EMPTY_CHECK: Record<ExemptionKey, boolean> = {
  incomeTax: false,
  acquisitionTax: false,
  propertyTax: false,
  registrationTax: false,
}

const INITIAL_FORM: FormData = {
  businessType: '',
  birthDate: '',
  startupDate: '',
  region: '',
  overconcentration: '',
  industry: '',
  startupForm: '',
  checkItems: { ...EMPTY_CHECK },
}

export default function App() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [submitted, setSubmitted] = useState(false)

  const result = useMemo(() => (submitted ? judge(form) : null), [submitted, form])
  const summaryText = useMemo(
    () => (submitted && result ? buildSummaryText(form, result) : ''),
    [submitted, result, form],
  )

  const handleSubmit = () => {
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleReset = () => {
    setForm({ ...INITIAL_FORM, checkItems: { ...EMPTY_CHECK } })
    setSubmitted(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    setSubmitted(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-xl px-4 pb-16 pt-8 sm:pt-12">
        {/* 헤더 */}
        <header className="mb-6 px-1">
          <div className="text-sm font-bold text-brand">세무·법인컨설팅 상담용</div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900">
            창업감면 1분 판정기
          </h1>
          <p className="mt-2 text-base leading-relaxed text-gray-500">
            대표자 정보를 입력하면 창업기업 관련 감면 가능성을 1차로 판정합니다.
            <br />
            세액 계산기가 아닌 <b className="text-gray-700">상담 보조 판정 도구</b>입니다.
          </p>
        </header>

        {submitted && result ? (
          <ResultCards result={result} summaryText={summaryText} onBack={handleBack} />
        ) : (
          <InputForm
            form={form}
            onChange={setForm}
            onSubmit={handleSubmit}
            onReset={handleReset}
          />
        )}

        {/* 푸터 */}
        <footer className="mt-10 px-1 text-center text-xs text-gray-300">
          창업감면 1분 판정기 · MVP · 프론트엔드 단독 동작
        </footer>
      </div>
    </div>
  )
}
