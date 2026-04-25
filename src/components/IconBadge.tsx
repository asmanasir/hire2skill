import type { CSSProperties, ReactNode } from 'react'

export type IconBadgeTone =
  | 'blue'
  | 'amber'
  | 'green'
  | 'cyan'
  | 'violet'
  | 'orange'
  | 'emerald'
  | 'neutral'
  | 'frost'

export type IconBadgeSize = 'sm' | 'md' | 'lg' | 'xl'

const TONE_STYLE: Record<IconBadgeTone, { background: string; borderColor: string }> = {
  blue: { background: '#EFF6FF', borderColor: '#DBEAFE' },
  amber: { background: '#FFFBEB', borderColor: '#FEF3C7' },
  green: { background: '#F0FDF4', borderColor: '#DCFCE7' },
  cyan: { background: '#ECFEFF', borderColor: '#CFFAFE' },
  violet: { background: '#F5F3FF', borderColor: '#EDE9FE' },
  orange: { background: '#FFF7ED', borderColor: '#FFEDD5' },
  emerald: { background: '#ECFDF5', borderColor: '#D1FAE5' },
  neutral: { background: '#F9FAFB', borderColor: '#E5E7EB' },
  frost: { background: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.25)' },
}

const SIZE_CLASS: Record<IconBadgeSize, string> = {
  sm: 'h-9 w-9 rounded-xl',
  md: 'h-11 w-11 rounded-xl',
  lg: 'h-12 w-12 rounded-2xl',
  xl: 'h-16 w-16 rounded-2xl',
}

export default function IconBadge({
  children,
  tone = 'neutral',
  size = 'md',
  className = '',
  style,
  withBorder = true,
}: {
  children: ReactNode
  tone?: IconBadgeTone
  size?: IconBadgeSize
  className?: string
  style?: CSSProperties
  withBorder?: boolean
}) {
  const toneStyle = TONE_STYLE[tone]
  return (
    <div
      className={`${SIZE_CLASS[size]} flex items-center justify-center shrink-0 ${withBorder ? 'border' : ''} ${className}`.trim()}
      style={{ background: toneStyle.background, borderColor: toneStyle.borderColor, ...style }}
    >
      {children}
    </div>
  )
}
