import ReactSelect, { Props } from 'react-select'

type SelectProps = Props & {
  id: string
  label: string
};

const Select: React.FC<SelectProps> = (props) => {
  return (
    <div className="input-block">
      <label htmlFor={props.id}>{props.label}</label>
      <div>
        <ReactSelect {...props} />
      </div>
    </div>
  )
}

export default Select