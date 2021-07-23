import { useState } from 'react'
import clsx from 'clsx'

export type CheckboxProps = {
  label: string
  name: string
  checked?: boolean
  showSwitch?: boolean
  onChange?: (e:any) => void
  error?: string
}

export default function Checkbox({
  label,
  name,
  checked = false,
  onChange,
  showSwitch = true,
  error = ''
}: CheckboxProps) {
  const [internal, setInternal] = useState(checked)

  const blockClasses = clsx({
    'input-block': true,
    'input-block--error': error !== ''
  })

  const classes = clsx({
    'toggle-switch': showSwitch
  })

  const handleChange = () => {
    onChange(!internal)
    setInternal(!internal)
  }

  return (
    <div className={blockClasses}>
      <input
        type="checkbox"
        name={name}
        id={name}
        checked={internal}
        className={classes}
        onChange={ () => handleChange() }
        />
      <label
        htmlFor={name}
        >
        {label}
      </label>
      { error !== '' && <span>{error}</span> }
    </div>
  )
}
