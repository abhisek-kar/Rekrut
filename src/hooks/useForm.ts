// Form hook
// This is a placeholder file for the hook structure

import { useState } from "react";

export function useForm<T>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (name: keyof T, value: unknown) => {
    setValues({ ...values, [name]: value });
  };

  const validate = (
    validateFn?: (values: T) => Partial<Record<keyof T, string>>
  ) => {
    if (!validateFn) return true;

    const validationErrors = validateFn(values);
    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = (
    onSubmit: (values: T) => void,
    validateFn?: (values: T) => Partial<Record<keyof T, string>>
  ) => {
    return async (e: React.FormEvent) => {
      e.preventDefault();

      if (validate(validateFn)) {
        setIsSubmitting(true);
        await onSubmit(values);
        setIsSubmitting(false);
      }
    };
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset,
  };
}

export default useForm;
