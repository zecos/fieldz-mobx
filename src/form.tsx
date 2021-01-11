import {
  UseTextReturn,
  Errors,
} from './fieldz'


type FieldsObj = {[key: string]: UseTextReturn}
type FieldsArr = UseTextReturn[]

type FieldsArrayReturn = {
  fields: UseTextReturn[]
  values: any[]
  errors: Errors[]
  hasErrors: boolean
}
const parseFieldsArray = (fields: FieldsArr): FieldsArrayReturn => {
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
  fields: FieldsObj
  values: {[key: string]: any}
  errors: {[key: string]: Errors}
  hasErrors: boolean
}
const parseFieldsObject = (fields: FieldsObj): FieldsObjectReturn => {
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

type UseFormReturnObj = {
  fields: FieldsObj
  values: {[key: string]: string}
  errors: {[key: string]: Errors}
  hasErrors: Boolean
}
type UseFormReturnArr = {
  fields: FieldsArr
  values: string[]
  errors: Errors[]
  hasErrors: Boolean
}

export function useForm(formProps: FieldsArr): UseFormReturnArr;
export function useForm(formProps: FieldsObj): UseFormReturnObj;
export function useForm(formProps: any):any {
  const { fields, values, errors, hasErrors } = Array.isArray(formProps.fields) ?
    parseFieldsArray(formProps.fields) :
    parseFieldsObject(formProps.fields)
  const fieldsArray = Array.isArray(fields) ? fields : Object.values(fields)
  let handleSubmit: (()=>never) | (()=>void) = () => {
    throw new Error('You did not provide a `submit` function to `useForm`')
  }
  if (formProps.submit) {
    handleSubmit = () => {
      if (hasErrors) {
        for (const field of fieldsArray) {
          field.setTouched(true)
        }
      } else {
        formProps.submit({fields, values, errors, hasErrors})
      }
    }
  }
  return {
    fields,
    values,
    errors,
    hasErrors,
  }
}