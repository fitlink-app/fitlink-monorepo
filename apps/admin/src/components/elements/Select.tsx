import ReactSelect, { Props } from 'react-select'

type SelectProps = Props & {
  id: string
  label: string
};

const Select: React.FC<SelectProps> = (props) => {

  const customStyles = {
    control: (provided) => ({
      ...provided,
      height: '2.75rem',
      border: '1px solid #ccc',
      borderRadius: '0.5rem'
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#ccc'
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      backgroundColor: '#eee',
      marginTop: '12px',
      marginBottom: '12px',
    }),
    indicatorContainer: (provided) => ({
      ...provided,
      color: '#ccc'
    }),
  }

  return (
    <div className="input-block">
      <label htmlFor={props.id}>{props.label}</label>
      <ReactSelect className="react-select" styles={customStyles} {...props} />
    </div>
  )
}

export default Select