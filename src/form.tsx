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
import {
  camelToSnake,
  camelToTitle,
  camelToKebab,
} from './util'

type SubmitFn = (props: typeof FormStore) => any


type FormProps = {
  fields: {[key: string]: FieldStoreProps}
  submit?: SubmitFn
}

interface IAction extends FormStore {
  (...args: any[]): any
}
type ActionProps = (...args: any[]) => any
type FieldOrActionProp = FieldStoreProps | ActionProps
type FieldOrActionProps = {
  [key: string]: FieldOrActionProp
}
type ActionsObj = {[key: string]: IAction}

type PropsObj = {[key: string]: FieldStoreProps}
type FieldStoreObj = {[key: string]: FieldStore}
const propsToFieldsOrActions = (props: FieldOrActionProps): {fields: FieldStoreObj, actions: ActionsObj} => {
  const fields: FieldStoreObj = {}
  const actions: ActionsObj = {}
  const entries = Object.entries<FieldOrActionProp>(props)
  for (const [name, field] of entries) {
    if (typeof field === "function") {
      actions[name] = field as IAction
      continue
    } else {
      const props = parseProps(field)
      fields[name] = new FieldStore({
        name,
        ...props
      })
    }
  }
  return {
    fields,
    actions,
  }
}

const getByFormat = (format: string, prop: string, fields: FieldStoreObj) => {
  const result = {} as {[key: string]: string}
  for (const field of Object.values<FieldStore>(fields)) {
    result[field.name[format]] = field[prop]
  }
  return result
}

export interface IFormStore {
  loading: boolean
  fields: FieldStoreObj
  actions: ActionsObj
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
  public fields: FieldStoreObj = {}
  public actions: ActionsObj = {}
  public loading = false
  public values = (() => {
    const that = this
    return {
      get camel() {
        return getByFormat("camel", "value", that.fields)
      },
      set camel(obj: {[key:string]: string}) {
        for (const key in obj) {
          if (!(key in that.fields)) {
            throw new Error(`Could not find field ${key}`)
          }
        }
        for (const key in obj) {
          that.fields[key].value = obj[key]
        }
      },
      get snake() {
        return getByFormat("snake", "value", that.fields)
      },
      set snake(_obj: {[key:string]: string}) {
        const obj = Object.assign({}, _obj)
        for (const key in obj) {
          const temp = obj[key]
          delete obj[key]
          obj[camelToSnake(key)] = temp
        }
        for (const key in obj) {
          if (!(key in that.fields)) {
            throw new Error(`Could not find field ${key}`)
          }
        }
        for (const key in obj) {
          that.fields[key].value = obj[key]
        }
      },
      get kebab() {
        return getByFormat("kebab", "value", that.fields)
      },
      set kebab(_obj: {[key:string]: string}) {
        const obj = Object.assign({}, _obj)
        for (const key in obj) {
          const temp = obj[key]
          delete obj[key]
          obj[camelToKebab(key)] = temp
        }
        for (const key in obj) {
          if (!(key in that.fields)) {
            throw new Error(`Could not find field ${key}`)
          }
        }
        for (const key in obj) {
          that.fields[key].value = obj[key]
        }
      },
      get title() {
        return getByFormat("title", "value", that.fields)
      },
      set title(_obj: {[key:string]: string}) {
        const obj = Object.assign({}, _obj)
        for (const key in obj) {
          const temp = obj[key]
          delete obj[key]
          obj[camelToTitle(key)] = temp
        }
        for (const key in obj) {
          if (!(key in that.fields)) {
            throw new Error(`Could not find field ${key}`)
          }
        }
        for (const key in obj) {
          that.fields[key].value = obj[key]
        }
      },
    }
  })()
  public errors = (() => {
    const that = this
    return {
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
    }
  })()

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
  constructor(formProps: {[key:string]: any} = {}) {
    makeAutoObservable(this)
    const {actions, fields} = propsToFieldsOrActions(formProps)
    for (const key in actions) {
      this.actions[key] = actions[key].bind(this)
    }
    this.fields = fields
  }

  public reset = () => {
    for (const field of Object.values<FieldStore>(this.fields)) {
      field.reset()
    }
  }
}
