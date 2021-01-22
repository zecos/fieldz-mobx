import {
  FieldStoreProps,
  FieldStore,
  parseProps,
  Errors,
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
const propsToFields = (props: PropsObj): FieldStoreObj => {
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

const getByFormat = (format: string, prop: string, fields: FieldStoreObj) => {
  const result = {} as {[key: string]: string}
  for (const field of Object.values<FieldStore>(fields)) {
    result[field.name[format]] = field[prop]
  }
  return result
}

interface IFormStore {
  loading: boolean
  fields: {[key: string]: FieldStore}
  hasErrors: boolean
  values: {
    camel: { [key: string]: string }
    kebab: { [key: string]: string }
    title: { [key: string]: string }
    snake: { [key: string]: string }
  }
  errors: {
    camel: { [key: string]: Errors }
    kebab: { [key: string]: Errors }
    title: { [key: string]: Errors }
    snake: { [key: string]: Errors }
  }
}

export class FormStore implements IFormStore {
  public fields: {[key: string]: FieldStore} = {}
  public loading = false
  public hasErrors = false
  public values: {
    camel: {}
    kebab: {}
    title: {}
    snake: {}
  }
  public errors: {
    camel: {}
    kebab: {}
    title: {}
    snake: {}
  }
  constructor(formProps: PropsObj) {
    makeAutoObservable(this)
    const that = this
    this.fields = propsToFields(formProps)
    extendObservable(this, {
      values: {
        get camel() {
          return getByFormat("camel", "value", that.fields)
        },
        get snake() {
          return getByFormat("snake", "value", that.fields)
        },
        get kebab() {
          return getByFormat("kebab", "value", that.fields)
        },
        get title() {
          return getByFormat("title", "value", that.fields)
        },
      },
      errors: {
        get camel() {
          return getByFormat("camel", "errors", that.fields)
        },
        get snake() {
          return getByFormat("snake", "errors", that.fields)
        },
        get kebab() {
          return getByFormat("kebab", "errors", that.fields)
        },
        get title() {
          return getByFormat("title", "errors", that.fields)
        },
      },
      get hasErrors() {
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
    })
  }

  public reset = () => {
    for (const field of Object.values<FieldStore>(this.fields)) {
      field.reset()
    }
  }
}
