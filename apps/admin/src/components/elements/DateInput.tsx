import { useState } from 'react'
import DatePicker from 'react-datepicker'
import { getYear, getMonth } from 'date-fns'
import 'react-datepicker/dist/react-datepicker.css'
import clsx from 'clsx'
import IconArrowLeft from '../icons/IconArrowLeft'
import IconArrowRight from '../icons/IconArrowRight'

export type DateInputProps = {
  label?: string
  inline?: boolean
  className?: string
  name: string
  startDate?: Date
  minDate?: Date
  maxDate?: Date
  onChange?: (e: any) => void
}

export default function DateInput({
  label,
  inline,
  name,
  className,
  startDate = new Date(),
  minDate,
  maxDate,
  onChange
}: DateInputProps) {
  const [currDate, setCurrDate] = useState(startDate)
  const classes = clsx({
    'input-block': true,
    'input-block--inline': inline,
    [className]: className
  })

  const years = []
  for (let i = getYear(new Date()); i < getYear(new Date()) + 10; i++) {
    years.push(i)
  }

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]

  const customHeader = ({
    date,
    changeYear,
    changeMonth,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled
  }) => (
    <div
      style={{
        margin: 10,
        display: 'flex',
        justifyContent: 'center'
      }}>
      <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
        <IconArrowLeft />
      </button>
      <select
        value={getYear(date)}
        onChange={({ target: { value } }) => changeYear(value)}>
        {years.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <select
        value={months[getMonth(date)]}
        onChange={({ target: { value } }) =>
          changeMonth(months.indexOf(value))
        }>
        {months.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
        <IconArrowRight />
      </button>
    </div>
  )

  const handleChange = (d: any) => {
    setCurrDate(d)
    if (onChange) onChange(d)
  }

  return (
    <div className={classes}>
      {label && <label htmlFor={name}>{label}</label>}
      <DatePicker
        id={name}
        selected={currDate}
        onChange={(date) => handleChange(date)}
        showTimeSelect
        timeFormat="HH:mm"
        dateFormat="yyyy-MM-dd 'at' HH:mmaaa"
        minDate={minDate || null}
        maxDate={maxDate || null}
        renderCustomHeader={customHeader}
      />
    </div>
  )
}
