import { format } from 'date-fns'
export const toDateCell = ({ value }) => {
  return format(new Date(value), 'yyyy-MM-dd')
}

export const toLocaleCell = ({ value }) => {
  return value.toLocaleString()
}

export const toChipCell = ({ value }) => {
  return <div className="chip">{value}</div>
}
