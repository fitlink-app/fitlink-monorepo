import CurrencyInput from 'react-currency-input-field'
import { UseFormRegisterReturn } from 'react-hook-form'
import clsx from 'clsx'

export type CurrencyProps = {
  label?: string
  placeholder?: string
  name: string
  value?: any
  onChange?: (e: any) => void
  rows?: number
  className?: string
  inline?: boolean
  decimals?: number
  locale?: {
    locale: string
    currency: string
  }
  error?: string
  register?: UseFormRegisterReturn
}

export default function Currency({
  className,
  label,
  placeholder = '',
  name,
  value = '',
  onChange = () => null,
  rows = 5,
  inline,
  decimals = 2,
  locale = { locale: 'en-US', currency: 'GBP' },
  error = '',
  register
}: CurrencyProps) {
  const classes = clsx({
    'input-block': true,
    'input-block--inline': inline,
    'input-block--error': error !== '',
    [className]: className
  })

  const handleChange = (value) => {
    onChange(value)
  }

  return (
    <div className={classes}>
      {label && <label htmlFor={name}>{label}</label>}
      <CurrencyInput
        intlConfig={locale}
        id={name}
        name={name}
        defaultValue={value}
        decimalsLimit={decimals}
        decimalScale={decimals}
        onValueChange={(value) => handleChange(value)}
        placeholder={placeholder}
        {...register}
      />
      {error !== '' && <span>{error}</span>}
    </div>
  )
}
