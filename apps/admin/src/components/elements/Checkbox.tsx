export type InputProps = {
  label: string
  name: string
  checked?: boolean
  onChange?: () => void
}

export default function Checkbox({
  label,
  name,
  checked = false,
  onChange = () => null
}: InputProps) {

  return (
    <div className="input-block">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        />
      <label
        htmlFor={name}
        >
        {label}
      </label>
    </div>
  )
}
