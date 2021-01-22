import {
  FieldStoreProps,
  FieldStore,
  parseProps,
} from './fieldz'
import {
  extendObservable,
  computed,
  makeAutoObservable,
} from 'mobx'

type SubmitFn = (props: typeof FormStore) => any


type FormProps = {
  fields: {[key: string]: FieldStoreProps}
  submit?: SubmitFn
}

type PropsObj = {[key: string]: FieldStoreProps}
type FieldStoreObj = {[key: string]: FieldStore}
const propsToFields = (props: PropsObj)  => {
  const fields: FieldStoreObj = {}
  const entries = Object.entries<FieldStoreProps>(props)
  for (const [name, field] of entries) {
    const props = parseProps(field)
    fields[name] = new FieldStore({
      name,
      ...props
    })
  }
  return fields
}

export class FormStore {
  public fields: {[key: string]: FieldStore} = {}
  constructor(formProps: PropsObj) {
    makeAutoObservable(this)
    extendObservable(this, propsToFields(formProps))
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
        break
      }
    }
    return hasErrors
  }
  public loading = false
  reset() {
    for (const field of Object.values(this.fields)) {
      field.reset()
    }
  }
}
