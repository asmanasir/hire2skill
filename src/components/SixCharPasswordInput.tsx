'use client'

import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react'

const LENGTH = 6

type SixCharPasswordInputProps = {
  id: string
  value: string
  onChange: (next: string) => void
  disabled?: boolean
  autoComplete?: string
  groupAriaLabel: string
}

export function SixCharPasswordInput({
  id,
  value,
  onChange,
  disabled,
  autoComplete = 'new-password',
  groupAriaLabel,
}: SixCharPasswordInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  const chars = [...value.padEnd(LENGTH, '')].slice(0, LENGTH)

  function focusAt(index: number) {
    window.setTimeout(() => {
      inputsRef.current[Math.max(0, Math.min(index, LENGTH - 1))]?.focus()
    }, 0)
  }

  function handleChange(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value
    if (next.length === 0) {
      onChange(value.slice(0, i) + value.slice(i + 1))
      return
    }
    if (next.length > 1) {
      const merged = (value.slice(0, i) + next).replace(/\s/g, '').slice(0, LENGTH)
      onChange(merged)
      focusAt(merged.length >= LENGTH ? LENGTH - 1 : merged.length)
      return
    }
    const ch = next
    const newVal = (value.slice(0, i) + ch + value.slice(i + 1)).slice(0, LENGTH)
    onChange(newVal)
    if (ch && i < LENGTH - 1) {
      focusAt(i + 1)
    }
  }

  function handleKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      e.preventDefault()
      if (value[i]) {
        onChange(value.slice(0, i) + value.slice(i + 1))
      } else if (i > 0) {
        const pi = i - 1
        onChange(value.slice(0, pi) + value.slice(pi + 1))
        focusAt(pi)
      }
      return
    }
    if (e.key === 'ArrowLeft' && i > 0) {
      e.preventDefault()
      focusAt(i - 1)
    }
    if (e.key === 'ArrowRight' && i < LENGTH - 1) {
      e.preventDefault()
      focusAt(i + 1)
    }
  }

  function handlePaste(i: number, e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\s/g, '')
    const merged = (value.slice(0, i) + text + value.slice(i)).slice(0, LENGTH)
    onChange(merged)
    focusAt(merged.length >= LENGTH ? LENGTH - 1 : merged.length)
  }

  return (
    <div role="group" aria-label={groupAriaLabel} className="flex justify-center gap-1.5 sm:gap-2">
      {Array.from({ length: LENGTH }, (_, i) => (
        <input
          key={i}
          ref={el => {
            inputsRef.current[i] = el
          }}
          id={i === 0 ? id : `${id}-${i}`}
          type="password"
          inputMode="text"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          autoComplete={i === 0 ? autoComplete : 'off'}
          maxLength={1}
          disabled={disabled}
          value={chars[i] ?? ''}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={e => handlePaste(i, e)}
          className="h-12 w-10 shrink-0 rounded-xl border border-gray-200 bg-[#f0f7ff]/60 text-center font-mono text-base text-gray-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:h-12 sm:w-11 sm:text-lg"
        />
      ))}
    </div>
  )
}
