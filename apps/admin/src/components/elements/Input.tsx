import clsx from "clsx"
import { useEffect, useState } from "react"

export type InputProps = {
  type?: 'text' | 'number' | 'email' | 'tel' | 'textarea'
  label: string
  placeholder?: string
  name: string
  value?: any
  changed?: (e:any) => void
  rows?: number
  className?: string
}

export default function Input({
  className,
  type = 'text',
  label,
  placeholder = '',
  name,
  value = '',
  changed = (e:any) => null,
  rows = 5
}: InputProps) {

  const [val, setVal] = useState(value)
  const classes = clsx({
    'input-block': true,
    [className]: className
  })

/*   useEffect(() => {
    setVal(value)
  }, [value]) */

  const handleChange = (e) => {
    changed(e.target.value)
    setVal(e.target.value)
  }

  return (
    <div className={classes}>
      <label
        htmlFor={name}
        >
        {label}
      </label>
      { type !== 'textarea' ?
        <input
          type={type}
          name={name}
          value={val}
          onChange={ (e) => handleChange(e) }
          placeholder={placeholder}
          />
      :
        <textarea
          name={name}
          value={val}
          onChange={ (e) => handleChange(e) }
          placeholder={placeholder}
          rows={rows}
        ></textarea>
      }
    </div>
  )
}
