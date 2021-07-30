import { useEffect, useState } from 'react'
import { ResponseError } from '@fitlink/api-sdk/types'

export default function useApiErrors(error: ResponseError) {
  const [errors, setErrors] = useState<NodeJS.Dict<string>>({})
  const [errorMessage, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  useEffect(() => {
    if (error && error.response && error.response.data) {
      if (error.response.data.errors) {
        setErrors(error.response.data.errors)
      }

      setIsError(true)
      setMessage(error.response.data.message)
    }
  }, [error])

  function clearErrors() {
    console.log('clearing...')
    setErrors({})
    setMessage('')
    setIsError(false)
  }

  return {
    errors,
    isError,
    errorMessage,
    clearErrors
  }
}
