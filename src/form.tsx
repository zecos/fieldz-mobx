import {
  HookProps,
  UseTextReturn,
  Errors,
  useText,
} from './fieldz'

type SubmitType = {
  values: {
    [key: string]: any
  }
  errors: {
    [key: string]: string
  }
  touched: {
    [key: string]: boolean
  }
}

type HookPropsObj = {[key: string]: UseTextReturn}

type FieldsArrayReturn = {
  fields: UseTextReturn[]
  values: any[]
  errors: Errors[]
  hasErrors: boolean
}
const parseFieldsArray = (fields: UseTextReturn[]): FieldsArrayReturn => {
  const values = [] as any[]
  const errors = [] as Errors[]
  let hasErrors = false
  for (const field of fields) {
    values.push(field.state)
    errors.push(field.errors)
    if (field.errors && field.errors.length) {
      hasErrors = true
    }
  }
  return {
    fields,
    values,
    errors,
    hasErrors,
  }
}

type FieldsObjectReturn = {
  fields: {[key: string]: UseTextReturn<string | number>}
  values: {[key: string]: any}
  errors: {[key: string]: Errors}
  hasErrors: boolean
}
const parseFieldsObject = (fields: HookPropsObj): FieldsObjectReturn => {
  const values = {} as {[key: string]: any}
  const errors = {} as {[key: string]: Errors}
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
  return {
    fields,
    values,
    errors,
    hasErrors,
  }
}

type UseFormReturn<T, U> = {
  fields: T
  values: T extends UseTextReturn<U>[] ?  U[] : {[key: string]: U}
  errors: T extends UseTextReturn<U>[] ?  Errors[] : {[key: string]: Errors}
  hasErrors: Boolean
}
interface UseFormFn<T, U> {
  (formProps: T): UseFormReturn<T, U>
}
type UseFormTypes = UseFormFn<UseTextReturn<string>, string> |
  UseFormFn<UseTextReturn<number>, number>;
export const useForm: UseFormTypes = (formProps) =>{
  const { fields, values, errors, hasErrors } = Array.isArray(formProps.fields) ?
    parseFieldsArray(formProps.fields) :
    parseFieldsObject(formProps.fields)
  const fieldsArray = Array.isArray(fields) ? fields : Object.values(fields)
  // let handleSubmit = () => {
  //   throw new Error('You did not provide a `submit` function to `useForm`')
  // }
  // if (formProps.submit) {
  //   handleSubmit = () => {

  //   }
  //   if (hasErrors) {
  //     for (const field of fieldsArray) {
  //       field.setTouched(true)
  //     }
  //   }
  // }
  return {
    fields,
    values,
    errors,
    hasErrors,
  }
}