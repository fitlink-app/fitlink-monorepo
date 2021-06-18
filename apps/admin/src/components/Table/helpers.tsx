import { format } from 'date-fns'
import IconCheck from '../icons/IconCheck'
import IconClose from '../icons/IconClose'
export const toDateCell = ({ value }) => {
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
    return <div className="confirmed"><IconCheck /></div>
  else
    return <div className="unconfirmed"><IconClose /></div>
}
