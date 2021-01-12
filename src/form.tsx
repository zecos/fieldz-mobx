import { useState } from 'react'
import {
  UseTextProps,
  UseTextReturn,
  Errors,
  useText,
  parseProps,
} from './fieldz'


type UseFormReturnBase<T> = {
  fields: {[key in keyof T]: UseTextReturn}
  values: {[key in keyof T]: string}
  errors: {[key in keyof T]: Errors}
  hasErrors: Boolean
}
type SubmitFn<T> = (props: UseFormReturnBase<T>) => any
type UseFormReturn<T> = UseFormReturnBase<T> & {
  handleSubmit: (e: React.FormEvent) => any
  isLoading: boolean
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
}


type FormProps<T> = {
  fields: {[key in keyof T]: UseTextProps}
  submit?: SubmitFn<T>
}

export function useForm<T = any>(formProps: FormProps<T>): UseFormReturn<T> {
  const fields = {} as {[key in keyof T]: UseTextReturn}
  for (const [name, field] of Object.entries<UseTextProps>(formProps.fields)) {
    const props = parseProps(field)
    fields[name] = useText({
      name,
      ...props
    })
  }
  const values = {} as {[key in keyof T]: any}
  const errors = {} as {[key in keyof T]: Errors}
  let hasErrors = false
  for (const fieldKey in fields) {
    const field = fields[fieldKey]
    fields[fieldKey] = field
    values[fieldKey] = field.state
    errors[fieldKey] = field.errors
    if (field.errors && field.errors.length) {
      hasErrors = true
    }
  }

  const fieldsArray = Array.isArray(fields) ? fields : Object.values(fields)
  let handleSubmit = (e: React.FormEvent): any => {
    e.preventDefault()
    console.error('You did not provide a `submit` function to `useForm`')
  }
  if (formProps.submit) {
    handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (hasErrors) {
        for (const field of fieldsArray) {
          field.setTouched(true)
        }
      } else {
        setIsLoading(true)
        await formProps.submit!({fields, values, errors, hasErrors})
        setIsLoading(false)
      }
    }
  }

  const [isLoading, setIsLoading] = useState<boolean>(false)
  return {
    fields,
    values,
    errors,
    hasErrors,
    handleSubmit,
    isLoading,
    setIsLoading,
  }
}