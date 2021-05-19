import { format } from 'date-fns'
export const toDateCell = ({ value }) => {
  return format(new Date(value), 'yyyy-MM-dd')
}
