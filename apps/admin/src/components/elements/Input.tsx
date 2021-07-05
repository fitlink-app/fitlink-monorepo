import { useEffect, useState } from 'react'
import clsx from 'clsx'

export type InputProps = {
  type?: 'text' | 'number' | 'email' | 'tel' | 'textarea'
  label?: string
  placeholder?: string
  name: string
  value?: any
  onChange?: (e: any) => void
  rows?: number
  className?: string
  inline?: boolean
  min?: number
  max?: number
}

export default function Input({
  className,
  type = 'text',
  label,
  placeholder = '',
  name,
  value = '',
  onChange = () => null,
  rows = 5,
  inline,
  min,
  max
}: InputProps) {
  const [val, setVal] = useState(value)
  const classes = clsx({
    'input-block': true,
    'input-block--inline': inline,
    [className]: className
  })

  useEffect(() => {
    setVal(value)
  }, [value])

  const handleChange = (e) => {
    onChange(e.target.value)
    setVal(e.target.value)
  }

  const handleKeyDown = (e) => {
    const char = e.which
    if (type === 'number') {
      if (
        char === 9 ||
        char === 37 ||
        char === 39 ||
        char === 8 ||
        char === 46 ||
        char === 13 ||
        (char >= 48 && char <= 57) ||
        (char >= 96 && char <= 105)
      )
        return true

      e.preventDefault()
      return false
    }
  }

  const output = () => {
    if (type === 'textarea') {
      return (
        <textarea
          name={name}
          value={val}
          onChange={(e) => handleChange(e)}
          placeholder={placeholder}
          rows={rows}
        />
      )
    }
    if (type === 'number') {
      return (
        <input
          type={type}
          name={name}
          value={val}
          onChange={(e) => handleChange(e)}
          placeholder={placeholder}
          onKeyDown={(e) => handleKeyDown(e)}
          min={min || -9999999999}
          max={max || 9999999999}
        />
      )
    }
    return (
      <input
        type={type}
        name={name}
        value={val}
        onChange={(e) => handleChange(e)}
        placeholder={placeholder}
        onKeyDown={(e) => handleKeyDown(e)}
      />
    )
  }

  return (
    <div className={classes}>
      {label && <label htmlFor={name}>{label}</label>}
      {output()}
    </div>
  )
}
