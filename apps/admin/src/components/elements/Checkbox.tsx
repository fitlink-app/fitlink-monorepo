import { useState } from 'react'
import clsx from 'clsx'

export type CheckboxProps = {
  label?: string
  name: string
  checked?: boolean
  showSwitch?: boolean
  onChange?: (e: any) => void
  error?: string
  style?: any
  className?: string
}

export default function Checkbox({
  label,
  name,
  checked = false,
  onChange,
  showSwitch = true,
  error = '',
  className,
  ...props
}: CheckboxProps) {
  const blockClasses = clsx(
    {
      'input-block': true,
      'input-block--error': error !== ''
    },
    className
  )

  const classes = clsx({
    'toggle-switch': showSwitch
  })

  return (
    <div className={blockClasses} {...props}>
      <input
        type="checkbox"
        name={name}
        id={name}
        checked={checked}
        className={classes}
        onChange={(event) => onChange(event.target.checked)}
      />
      <label htmlFor={name}>{label}</label>
      {error !== '' && <span>{error}</span>}
    </div>
  )
}
