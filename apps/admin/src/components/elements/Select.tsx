import ReactSelect, { Props } from 'react-select'
import clsx from 'clsx'

type SelectProps = Props & {
  id: string
  label?: string
  inline?: boolean
};

const Select: React.FC<SelectProps> = (props) => {
  const classes = clsx({
    'input-block': true,
    'input-block--inline': props.inline
  })

  const theme = {
    colors: {
      primary: '#00E9D7'
    }
  }

  const customStyles = {
    /* container: (provided, state) => ({
      ...provided,
      position: 'relative',
      zIndex: state.menuIsOpen ? 10 : 1,
    }), */
    control: (provided, state) => ({
      ...provided,
      backgroundColor: '#fff',
      height: '2.75rem',
      border: state.menuIsOpen ? '1px solid #00E9D7' : '1px solid #ccc',
      boxShadow: state.menuIsOpen ? '0 0 0 3px rgba(0, 233, 215, 0.25)' : '0',
      borderRadius: '0.5rem'
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '0 0.5rem',
      maxHeight: '100%'
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#ccc'
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#232323',
      fontWeight: 'normal'
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
    menu: (provided) => ({
      ...provided,
      border: 0,
      borderRadius: '0.5rem',
      overflow: 'hidden',
      margin: '2px 0 0',
      boxShadow: '0px 10px 20px 0 rgba(0, 0, 0, 0.1)'
    }),
    menuList: (provided) => ({
      ...provided,
      backgroundColor: '#fff',
      padding: 0,
      border: 0
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#eee' : '#fff',
      padding: '0.75rem 0.5rem'
    }),
  }

  return (
    <div className={classes}>
      { props.label && <label htmlFor={props.id}>{props.label}</label> }
      <ReactSelect
        id={props.id}
        instanceId={props.id}
        className="react-select"
        classNamePrefix="react-select"
        styles={customStyles}
        theme={theme}
        {...props} />
    </div>
  )
}

export default Select