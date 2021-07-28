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
 * if the primary value is falsy
 *
 * @param column
 * @returns
 */
export const toOtherCell = (column: string) => {
  return ({
    cell: {
      row: { original }
    },
    value
  }) => {
    if (!value && original[column]) {
      return original[column]
    }
    return value
  }
}
