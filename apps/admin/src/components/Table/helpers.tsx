import { format } from 'date-fns'
import IconCheck from '../icons/IconCheck'
import IconClose from '../icons/IconClose'

export const toDateCell = ({ value }) => {
  if (value === '') return '-'
  return format(new Date(value), 'yyyy-MM-dd')
}

export const toLocaleCell = ({ value }) => {
  return value.toLocaleString()
}

export const toChipCell = ({ value }) => {
  return <div className="chip">{value}</div>
}

export const boolToIcon = ({ value }) => {
  if (value)
    return (
      <div className="confirmed">
        <IconCheck />
      </div>
    )
  else
    return (
      <div className="unconfirmed">
        <IconClose />
      </div>
    )
}

/**
 * Falls back the value to a different cell
 * if the primary value is falsy or equal
 * to the provided value (1st argument).
 *
 * @param ifValue The value to compare
 * @param column Alternative column to use
 * @returns
 */
export const toOtherCell = (ifValue: string, column: string) => {
  return ({
    cell: {
      row: { original }
    },
    value
  }) => {
    if ((value === ifValue || !value) && original[column]) {
      return original[column]
    }
    return value
  }
}
