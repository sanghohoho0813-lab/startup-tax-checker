import { useMemo, useState } from 'react'
import type { ExemptionKey, FormData } from './types'
import { judge } from './lib/judgement'
import { buildSummaryText } from './lib/summary'
import InputForm from './components/InputForm'
import ResultCards from './components/ResultCards'
import PrintSheet from './components/PrintSheet'

const EMPTY_CHECK: Record<ExemptionKey, boolean> = {
  incomeTax: false,
  acquisitionTax: false,
  propertyTax: false,
  registrationTax: false,
}

// 요청 사양: 생년월일 기본값 1980-01-01, 창업일 기본값 2020-01-01
const INITIAL_FORM: FormData = {
  businessType: '',
  birthDate: '1980-01-01',
  startupDate: '2020-01-01',
  region: '',
  overconcentration: '',
  industry: '',
  startupForm: '',
  checkItems: { ...EMPTY_CHECK },
}

export default function App() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [submitted, setSubmitted] = useState(false)

  // 진단 기준일 (오늘) — 마운트 시 1회 고정
  const baseDate = useMemo(() => new Date(), [])
  const currentYear = baseDate.getFullYear()

  const result = useMemo(
    () => (submitted ? judge(form, baseDate) : null),
    [submitted, form, baseDate],
  )
  const summaryText = useMemo(
    () => (submitted && result ? buildSummaryText(form, result, baseDate) : ''),
    [submitted, result, form, baseDate],
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

  const handlePrint = () => window.print()

  return (
    <>
      {/* 화면 UI (인쇄 시 숨김) */}
      <div className="min-h-screen bg-gray-50 print:hidden">
        <div className="mx-auto max-w-xl px-4 pb-16 pt-8 sm:pt-12">
          <header className="mb-6 px-1">
            <div className="text-base font-bold text-brand">세무·법인컨설팅 상담용</div>
            <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-gray-900">
              창업감면 1분 판정기
            </h1>
            <p className="mt-2.5 text-lg leading-relaxed text-gray-500">
              대표자 정보를 입력하면 창업기업 관련 감면 가능성을 1차로 판정합니다.
              <br />
              세액 계산기가 아닌 <b className="text-gray-700">상담 보조 판정 도구</b>입니다.
            </p>
          </header>

          {submitted && result ? (
            <ResultCards
              result={result}
              summaryText={summaryText}
              onBack={handleBack}
              onPrint={handlePrint}
            />
          ) : (
            <InputForm
              form={form}
              onChange={setForm}
              onSubmit={handleSubmit}
              onReset={handleReset}
              currentYear={currentYear}
            />
          )}

          <footer className="mt-10 px-1 text-center text-sm text-gray-300">
            창업감면 1분 판정기 · 상담용 사전진단 도구 · 프론트엔드 단독 동작
          </footer>
        </div>
      </div>

      {/* 인쇄 전용 A4 결과서 */}
      {submitted && result && <PrintSheet form={form} result={result} baseDate={baseDate} />}
    </>
  )
}
