import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import axios from 'axios'

export type Currency = 'GBP' | 'EUR' | 'USD' | 'AED' | 'AUD'

export default function useCurrencyConversion(currency: Currency) {
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

  return {
    rates: query.data.data,
    convertGbp: (amt: number) => {
      const amount = amt * (rates[currency] || 1)
      return amount.toLocaleString('en-GB', { style: 'currency', currency })
    }
  }
}
