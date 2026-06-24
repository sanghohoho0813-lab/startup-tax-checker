import type { FormData, ScoreFactor } from '../types'

// 감면 가능성 점수 (0~100)
// 각 요소별 가중치를 합산하며, 산정 근거(ScoreFactor[])를 함께 반환한다.
// 정밀 세액 계산이 아니라 "가능성의 상대적 크기"를 직관적으로 보여주기 위한 지표다.

interface ScoreInput {
  form: FormData
  isYouth: boolean | null
}

export function computeScore({ form, isYouth }: ScoreInput): {
  score: number
  factors: ScoreFactor[]
} {
  const factors: ScoreFactor[] = []

  // 1) 창업 인정 (40점) — 가장 중요한 요소
  {
    const max = 40
    let points = 0
    let note = ''
    switch (form.startupForm) {
      case 'brand_new':
        points = 40
        note = '완전 신규 창업으로 창업 인정 가능성이 높습니다.'
        break
      case 'conversion':
        points = 14
        note = '법인전환은 신규 창업으로 보지 않을 수 있어 크게 감점됩니다.'
        break
      case 'acquisition':
        points = 12
        note = '기존 사업 양수는 창업 제외 가능성이 있어 감점됩니다.'
        break
      case 'reopen_same':
        points = 12
        note = '동종업 재창업은 창업 제외 가능성이 있어 감점됩니다.'
        break
      case 'succession':
        points = 6
        note = '특수관계인 승계는 창업 인정이 어려워 크게 감점됩니다.'
        break
      case 'unknown':
        points = 16
        note = '창업 형태 미확인으로 보수적으로 반영했습니다.'
        break
      default:
        points = 0
        note = '창업 형태가 선택되지 않았습니다.'
    }
    factors.push({ label: '창업 인정', points, max, note })
  }

  // 2) 업종 적격성 (25점)
  {
    const max = 25
    let points = 0
    let note = ''
    if (form.industry === 'real_estate' || form.industry === 'finance_insurance') {
      points = 3
      note = '부동산·금융/보험업은 감면 대상 업종에서 제외될 가능성이 높습니다.'
    } else if (form.industry === 'etc') {
      points = 15
      note = '기타 업종은 감면 대상 여부를 업종 코드로 확인해야 합니다.'
    } else if (form.industry === '') {
      points = 0
      note = '업종이 선택되지 않았습니다.'
    } else {
      points = 25
      note = '감면 대상 업종에 해당할 가능성이 있습니다.'
    }
    factors.push({ label: '업종 적격성', points, max, note })
  }

  // 3) 과밀억제권역 (20점)
  {
    const max = 20
    let points = 0
    let note = ''
    switch (form.overconcentration) {
      case 'no':
        points = 20
        note = '비과밀억제권역으로 감면에 유리합니다.'
        break
      case 'yes':
        points = 7
        note = '과밀억제권역은 감면율 축소·배제 가능성이 있어 감점됩니다.'
        break
      case 'unknown':
        points = 10
        note = '권역 여부 미확인으로 중간값을 반영했습니다.'
        break
      default:
        points = 0
        note = '과밀억제권역 여부가 선택되지 않았습니다.'
    }
    factors.push({ label: '과밀억제권역', points, max, note })
  }

  // 4) 청년 여부 (15점)
  {
    const max = 15
    let points = 0
    let note = ''
    if (isYouth === true) {
      points = 15
      note = '청년 창업 요건(만 15~34세)에 해당해 가점됩니다.'
    } else if (isYouth === false) {
      points = 8
      note = '청년 요건에는 해당하지 않으나 일반 창업감면은 가능합니다.'
    } else {
      points = 6
      note = '생년월일 미입력으로 보수적으로 반영했습니다.'
    }
    factors.push({ label: '청년 여부', points, max, note })
  }

  const score = factors.reduce((sum, f) => sum + f.points, 0)
  return { score: Math.max(0, Math.min(100, score)), factors }
}

// 점수 구간 라벨
export function scoreBand(score: number): { label: string; tone: 'good' | 'caution' | 'bad' } {
  if (score >= 70) return { label: '감면 가능성 높음', tone: 'good' }
  if (score >= 45) return { label: '조건부 가능 · 확인 필요', tone: 'caution' }
  return { label: '감면 가능성 낮음', tone: 'bad' }
}
