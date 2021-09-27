import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import axios from 'axios'

export type Currency = 'GBP' | 'EUR' | 'USD' | 'AED' | 'AUD'

export default function useCurrencyConversion(
  amountGBP: number,
  currency: Currency
) {
  const [rates, setRates] = useState({})
  const query = useQuery(
    'exchange_rates',
    () => {
      return axios.get(`https://openexchangerates.org/api/latest.json`, {
        params: {
          app_id: 'd78eabb31ba3411ea871d84c4b35550b',
          base: 'GBP'
        }
      })
    },
    {
      initialData: {} as any
    }
  )

  useEffect(() => {
    if (query.isFetched) {
      setRates(query.data.data.rates)
    }
  }, [query.isFetched])

  const amount = amountGBP * (rates[currency] || 1)

  return {
    rates: query.data.data,
    amount,
    formatAmount: (amt: number) =>
      amt.toLocaleString('en-GB', { style: 'currency', currency })
  }
}
