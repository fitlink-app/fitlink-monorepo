import {
  startOfYear,
  subYears,
  subMonths,
  startOfMonth,
  startOfWeek,
  subWeeks,
  startOfDay,
  subDays
} from 'date-fns'

export const options = [
  {
    label: 'Today',
    value: 'today',
    date: startOfDay(new Date()),
    end_date: new Date()
  },
  {
    label: 'Yesterday',
    value: 'yesterday',
    date: subDays(startOfDay(new Date()), 1),
    end_date: startOfDay(new Date())
  },
  {
    label: 'This week',
    value: 'thisweek',
    date: startOfWeek(new Date())
  },
  {
    label: 'Last week',
    value: 'lastweek',
    date: subWeeks(startOfWeek(new Date()), 1),
    end_date: startOfWeek(new Date())
  },
  {
    label: 'This month',
    value: 'thismonth',
    date: startOfMonth(new Date())
  },
  {
    label: 'Last month',
    value: 'lastmonth',
    date: subMonths(startOfMonth(new Date()), 1),
    end_date: startOfMonth(new Date())
  },
  {
    label: 'This year',
    value: 'thisyear',
    date: startOfYear(new Date())
  },
  {
    label: 'Last year',
    value: 'lastyear',
    date: subDays(startOfYear(new Date()), 365),
    end_date: startOfYear(new Date())
  },
  {
    label: 'All time',
    value: 'all',
    date: subYears(new Date(), 10)
  }
]
