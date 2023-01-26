import {useState} from 'react';
import {RequestError} from '@api';

export function useForm<T, K extends keyof T>(initialValues: T) {
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState<Partial<T>>({} as T);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [isSubmitted, setSubmitted] = useState(false);

  /** Set field value */
  const handleChange = (name: K) => (value: typeof values[K]) => {
    setValues(values => ({...values, [name]: value}));

    setErrorMessage(null);

    if (fieldErrors[name]) {
      setFieldErrors({...fieldErrors, [name]: ''});
    }
  };

  /**
   * Submits the form by invoking the provided callback
   * If the promise returns a RequestError, the error values will be stored in the state
   *
   * @param callback
   * @returns
   */
  const handleSubmit = async (
    callback: (data: T) => Promise<RequestError | undefined> | Promise<void>,
  ) => {
    setSubmitting(true);
    setFieldErrors({});
    setErrorMessage(null);

    try {
      const requestError = await callback(values);

      // Process request error (if provided) and store values in state
      if (requestError) {
        const {message, fields} = requestError;
        if (message) setErrorMessage(message);
        if (fields) setFieldErrors(fields as unknown as Partial<T>);
      } else {
        setSubmitted(true);
      }
    } catch (e) {
      console.warn('handleSubmit', e);
      setErrorMessage('Something went wrong. Please try again.');
    }

    setSubmitting(false);
  };

  return {
    handleChange,
    handleSubmit,
    isSubmitting,
    isSubmitted,
    errorMessage,
    setErrorMessage,
    fieldErrors,
    values,
    setValues,
  };
}
