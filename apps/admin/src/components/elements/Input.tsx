export type InputProps = {
  type?: 'text' | 'number' | 'email' | 'tel' | 'textfield'
  label: string
  placeholder?: string
  name: string
  value?: any
  onChange?: () => void
}

export default function Input({
  type = 'text',
  label,
  placeholder = '',
  name,
  value = '',
  onChange = () => null
}: InputProps) {

  return (
    <div className="input-block">
      <label
        htmlFor={name}
        >
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        />
    </div>
  )
}
