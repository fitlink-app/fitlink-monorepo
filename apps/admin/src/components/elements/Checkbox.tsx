import { useState } from 'react'
import clsx from 'clsx'

export type CheckboxProps = {
  label: string
  name: string
  checked?: boolean
  showSwitch?: boolean
  onChange?: (e:any) => void
}

export default function Checkbox({
  label,
  name,
  checked = false,
  onChange,
  showSwitch = true
}: CheckboxProps) {
  const [internal, setInternal] = useState(checked)

  const classes = clsx({
    'toggle-switch': showSwitch
  })

  const handleChange = () => {
    onChange(!internal)
    setInternal(!internal)
  }

  return (
    <div className="input-block">
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
    </div>
  )
}
