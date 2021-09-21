import { useEffect, useState } from 'react'
import { ResponseError } from '@fitlink/api-sdk/types'

export default function useApiErrors(isError: boolean, error: ResponseError) {
  const [errors, setErrors] = useState<NodeJS.Dict<string>>({})
  const [errorMessage, setMessage] = useState('')
  useEffect(() => {
    if (isError && error && error.response && error.response.data) {
      if (error.response.data.errors) {
        setErrors(error.response.data.errors)
      }
      setMessage(error.response.data.message)
    } else {
      clearErrors()
    }
  }, [isError])

  function clearErrors() {
    setErrors({})
    setMessage('')
  }

  return {
    errors,
    isError,
    errorMessage,
    clearErrors,
    setErrors,
    setMessage
  }
}
