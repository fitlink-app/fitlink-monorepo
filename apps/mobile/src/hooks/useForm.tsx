import {useState} from 'react';

export function useForm<T, K extends keyof T>(initialValues: T) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<T>>({} as T);
  const [isSubmitting, setSubmitting] = useState(false);

  /** Set field value */
  const handleChange = (name: K) => (value: typeof values[K]) => {
    setValues(values => ({...values, [name]: value}));

    if (errors[name]) {
      setErrors({...errors, [name]: ''});
    }
  };

  /** Submits form */
  const handleSubmit = (callback: (data: T) => Promise<void>) => async () => {
    setSubmitting(true);
    setErrors({});

    try {
      await callback(values);
    } catch (e) {
      // TODO: Handle form errors
      console.warn('TODO: Handle form errors', e.message);
    }

    setSubmitting(false);
  };

  return {
    handleChange,
    handleSubmit,
    isSubmitting,
    errors,
    setErrors,
    values,
  };
}
