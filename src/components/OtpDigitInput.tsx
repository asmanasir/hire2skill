'use client'

import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react'

type OtpDigitInputProps = {
  id: string
  length: number
  value: string
  onChange: (next: string) => void
  disabled?: boolean
  groupAriaLabel: string
}

function digitsOnly(s: string) {
  return s.replace(/\D/g, '')
}

export function OtpDigitInput({
  id,
  length,
  value,
  onChange,
  disabled,
  groupAriaLabel,
}: OtpDigitInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])
  const safeLen = Math.max(4, Math.min(12, length))

  const chars = [...digitsOnly(value).padEnd(safeLen, '')].slice(0, safeLen)

  function focusAt(index: number) {
    window.setTimeout(() => {
      inputsRef.current[Math.max(0, Math.min(index, safeLen - 1))]?.focus()
    }, 0)
  }

  function handleChange(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const raw = digitsOnly(e.target.value)
    const v = digitsOnly(value)
    if (raw.length === 0) {
      onChange(v.slice(0, i) + v.slice(i + 1))
      return
    }
    if (raw.length > 1) {
      const merged = digitsOnly(v.slice(0, i) + raw).slice(0, safeLen)
      onChange(merged)
      focusAt(merged.length >= safeLen ? safeLen - 1 : merged.length)
      return
    }
    const ch = raw
    const newVal = digitsOnly(v.slice(0, i) + ch + v.slice(i + 1)).slice(0, safeLen)
    onChange(newVal)
    if (ch && i < safeLen - 1) {
      focusAt(i + 1)
    }
  }

  function handleKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    const v = digitsOnly(value)
    if (e.key === 'Backspace') {
      e.preventDefault()
      if (v[i]) {
        onChange(v.slice(0, i) + v.slice(i + 1))
      } else if (i > 0) {
        const pi = i - 1
        onChange(v.slice(0, pi) + v.slice(pi + 1))
        focusAt(pi)
      }
      return
    }
    if (e.key === 'ArrowLeft' && i > 0) {
      e.preventDefault()
      focusAt(i - 1)
    }
    if (e.key === 'ArrowRight' && i < safeLen - 1) {
      e.preventDefault()
      focusAt(i + 1)
    }
  }

  function handlePaste(i: number, e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const text = digitsOnly(e.clipboardData.getData('text'))
    const v = digitsOnly(value)
    const merged = (v.slice(0, i) + text + v.slice(i)).slice(0, safeLen)
    onChange(merged)
    focusAt(merged.length >= safeLen ? safeLen - 1 : merged.length)
  }

  return (
    <div role="group" aria-label={groupAriaLabel} className="flex justify-center gap-1 sm:gap-1.5">
      {Array.from({ length: safeLen }, (_, i) => (
        <input
          key={i}
          ref={el => {
            inputsRef.current[i] = el
          }}
          id={i === 0 ? id : `${id}-${i}`}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          disabled={disabled}
          value={chars[i] ?? ''}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={e => handlePaste(i, e)}
          className="h-11 w-8 max-w-[2.75rem] shrink-0 rounded-lg border border-gray-200 bg-[#f0f7ff]/60 text-center font-mono text-base text-gray-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:h-12 sm:w-9 sm:rounded-xl sm:text-lg"
        />
      ))}
    </div>
  )
}
