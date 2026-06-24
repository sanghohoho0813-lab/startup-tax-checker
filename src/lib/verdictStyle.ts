import type { Verdict } from '../types'

// 판정 상태별 화면 스타일 토큰 (결과 카드 공용)
export interface VerdictStyle {
  bg: string
  border: string
  text: string
  chipBg: string
  emoji: string
}

export const VERDICT_STYLE: Record<Verdict, VerdictStyle> = {
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

// 점수 도넛/바 색상
export function scoreColor(score: number): string {
  if (score >= 70) return '#16a34a' // green-600
  if (score >= 45) return '#f59e0b' // amber-500
  return '#dc2626' // red-600
}
