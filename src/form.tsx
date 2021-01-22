import {
  FieldStoreProps,
  FieldStore,
  parseProps,
} from './fieldz'
import { extendObservable, computed } from 'mobx'

type SubmitFn = (props: typeof FormStore) => any


type FormProps = {
  fields: {[key: string]: FieldStoreProps}
  submit?: SubmitFn
}

export class FormStore {
  public fields: {[key: string]: FieldStore} = {}
  public validate() {
    if (this.hasErrors) {
      for (const field of Object.values(this.fields)) {
        field.touched = true
      }
      return false
    }
    return true
  }
  constructor(formProps: FormProps) {
    const fields: {[key: string]: FieldStore} = {}
    for (const [name, field] of Object.entries<FieldStoreProps>(formProps.fields)) {
      const props = parseProps(field)
      fields[name] = new FieldStore({
        name,
        ...props
      })
    }
    extendObservable(this, fields)
  }
  @computed values(format = "camel") {
    const result = {} as {[key: string]: string}
    for (const fieldKey in this.fields) {
      const field = this.fields[fieldKey]
      result[field.name[format]] = field.value
    }
    return result
  }
  @computed errors(format = "camel") {
    const result = {} as {[key: string]: string}
    for (const fieldKey in this.fields) {
      const field = this.fields[fieldKey]
      result[field.name[format]] = field.value
    }
    return result
  }
  @computed get hasErrors() {
    let hasErrors = false
    for (const fieldKey in this.fields) {
      const field = this.fields[fieldKey]
      if (field.errors && field.errors.length) {
        hasErrors = true
      }
    }
    return hasErrors
  }
}
