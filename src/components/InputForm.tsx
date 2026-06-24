import type {
  BusinessType,
  ExemptionKey,
  FormData,
  Industry,
  Overconcentration,
  Region,
  StartupForm,
} from '../types'

interface Props {
  form: FormData
  onChange: (form: FormData) => void
  onSubmit: () => void
  onReset: () => void
}

// 선택지 정의
const BUSINESS_TYPES: { value: BusinessType; label: string }[] = [
  { value: 'individual', label: '개인사업자' },
  { value: 'corporation', label: '법인사업자' },
]

const REGIONS: { value: Region; label: string }[] = [
  { value: 'seoul', label: '서울' },
  { value: 'gyeonggi_incheon', label: '경기/인천' },
  { value: 'metro_city', label: '지방 광역시' },
  { value: 'other_local', label: '기타 지방' },
]

const OVERCONCENTRATIONS: { value: Overconcentration; label: string }[] = [
  { value: 'yes', label: '예' },
  { value: 'no', label: '아니오' },
  { value: 'unknown', label: '잘 모르겠음' },
]

const INDUSTRIES: { value: Industry; label: string }[] = [
  { value: 'manufacturing', label: '제조업' },
  { value: 'ict', label: '정보통신업' },
  { value: 'professional', label: '전문서비스업' },
  { value: 'wholesale_retail', label: '도소매업' },
  { value: 'restaurant', label: '음식점업' },
  { value: 'real_estate', label: '부동산업' },
  { value: 'finance_insurance', label: '금융/보험업' },
  { value: 'etc', label: '기타' },
]

const STARTUP_FORMS: { value: StartupForm; label: string }[] = [
  { value: 'brand_new', label: '완전 신규 창업' },
  { value: 'conversion', label: '개인사업자에서 법인전환' },
  { value: 'acquisition', label: '기존 사업 양수' },
  { value: 'reopen_same', label: '폐업 후 같은 업종 재창업' },
  { value: 'succession', label: '가족/특수관계인 사업 승계' },
  { value: 'unknown', label: '잘 모르겠음' },
]

const CHECK_ITEMS: { key: ExemptionKey; label: string }[] = [
  { key: 'incomeTax', label: '법인세/소득세' },
  { key: 'acquisitionTax', label: '취득세' },
  { key: 'propertyTax', label: '재산세' },
  { key: 'registrationTax', label: '등록면허세' },
]

// 공통 라벨 컴포넌트
function FieldLabel({ step, children }: { step: number; children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
        {step}
      </span>
      <h3 className="text-lg font-bold text-gray-900">{children}</h3>
    </div>
  )
}

// 선택형 버튼 그룹
function ChoiceGroup<T extends string>({
  options,
  value,
  onSelect,
  columns = 2,
}: {
  options: { value: T; label: string }[]
  value: T | ''
  onSelect: (v: T) => void
  columns?: number
}) {
  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            className={[
              'rounded-2xl border px-4 py-3.5 text-base font-medium transition-colors',
              active
                ? 'border-brand bg-brand text-white shadow-sm'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 active:bg-gray-50',
            ].join(' ')}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function Section({ children }: { children: React.ReactNode }) {
  return <div className="rounded-3xl bg-white p-5 shadow-card sm:p-6">{children}</div>
}

export default function InputForm({ form, onChange, onSubmit, onReset }: Props) {
  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    onChange({ ...form, [key]: value })
  }

  const toggleCheck = (key: ExemptionKey) => {
    onChange({
      ...form,
      checkItems: { ...form.checkItems, [key]: !form.checkItems[key] },
    })
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      {/* 1. 사업자 유형 */}
      <Section>
        <FieldLabel step={1}>사업자 유형</FieldLabel>
        <ChoiceGroup
          options={BUSINESS_TYPES}
          value={form.businessType}
          onSelect={(v) => update('businessType', v)}
        />
      </Section>

      {/* 2 & 3. 날짜 */}
      <Section>
        <FieldLabel step={2}>대표자 생년월일</FieldLabel>
        <input
          type="date"
          value={form.birthDate}
          onChange={(e) => update('birthDate', e.target.value)}
          className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-base text-gray-900 outline-none focus:border-brand"
        />
        <div className="mt-2 text-sm text-gray-400">
          만 15~34세는 청년 창업 요건에 해당할 수 있습니다. (병역기간 미반영)
        </div>

        <div className="mt-5">
          <FieldLabel step={3}>창업일</FieldLabel>
          <input
            type="date"
            value={form.startupDate}
            onChange={(e) => update('startupDate', e.target.value)}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-base text-gray-900 outline-none focus:border-brand"
          />
        </div>
      </Section>

      {/* 4. 지역 */}
      <Section>
        <FieldLabel step={4}>사업장 지역</FieldLabel>
        <ChoiceGroup
          options={REGIONS}
          value={form.region}
          onSelect={(v) => update('region', v)}
        />
      </Section>

      {/* 5. 과밀억제권역 */}
      <Section>
        <FieldLabel step={5}>수도권 과밀억제권역 여부</FieldLabel>
        <ChoiceGroup
          options={OVERCONCENTRATIONS}
          value={form.overconcentration}
          onSelect={(v) => update('overconcentration', v)}
          columns={3}
        />
        <div className="mt-2 text-sm text-gray-400">
          과밀억제권역 여부에 따라 감면율과 적용 여부가 크게 달라집니다.
        </div>
      </Section>

      {/* 6. 업종 */}
      <Section>
        <FieldLabel step={6}>업종</FieldLabel>
        <ChoiceGroup
          options={INDUSTRIES}
          value={form.industry}
          onSelect={(v) => update('industry', v)}
        />
      </Section>

      {/* 7. 창업 형태 */}
      <Section>
        <FieldLabel step={7}>창업 형태</FieldLabel>
        <ChoiceGroup
          options={STARTUP_FORMS}
          value={form.startupForm}
          onSelect={(v) => update('startupForm', v)}
          columns={1}
        />
      </Section>

      {/* 8. 감면 확인 항목 */}
      <Section>
        <FieldLabel step={8}>감면 확인 항목</FieldLabel>
        <div className="text-sm text-gray-400">
          확인하고 싶은 항목을 선택하세요. (선택하지 않으면 전체 항목을 판정합니다)
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {CHECK_ITEMS.map((item) => {
            const active = form.checkItems[item.key]
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => toggleCheck(item.key)}
                className={[
                  'flex items-center gap-2 rounded-2xl border px-4 py-3.5 text-base font-medium transition-colors',
                  active
                    ? 'border-brand bg-brand/5 text-brand'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
                ].join(' ')}
              >
                <span
                  className={[
                    'flex h-5 w-5 items-center justify-center rounded-md border text-xs',
                    active ? 'border-brand bg-brand text-white' : 'border-gray-300 bg-white',
                  ].join(' ')}
                >
                  {active ? '✓' : ''}
                </span>
                {item.label}
              </button>
            )
          })}
        </div>
      </Section>

      {/* 액션 버튼 */}
      <div className="sticky bottom-4 z-10 mt-2 flex gap-3">
        <button
          type="button"
          onClick={onReset}
          className="rounded-2xl border border-gray-200 bg-white px-5 py-4 text-base font-bold text-gray-600 shadow-card transition-colors hover:bg-gray-50"
        >
          초기화
        </button>
        <button
          type="submit"
          className="flex-1 rounded-2xl bg-brand px-5 py-4 text-base font-bold text-white shadow-card transition-colors hover:bg-brand-dark"
        >
          1분 판정하기
        </button>
      </div>
    </form>
  )
}
