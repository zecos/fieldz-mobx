import {
  FieldStoreProps,
  FieldStore,
  IFieldStore,
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
  nameGetter,
} from './util'

interface IStrObj {
  [key: string]: string | IStrObj
}
interface IErrObj {
  [key: string]: Errors | IErrObj
}

interface IAction {
  (...args: any[]): any | void
}

interface IActionProps {
  [key: string]: IAction
}
export interface IFormStoreProps {
  [key: string]: FieldOrActionProp | IFormStoreProps
}
type FieldOrActionProp = FieldStoreProps | IAction
type ActionsObj = {[key: string]: any /*IAction*/}

interface IFieldOrFormStoreObj {
  [key: string]: IFieldStore | IFormStore
}

const fieldKeys = ["validate", "name", "init"]
const checkIsFieldProps = (obj: any) => {
  if (typeof obj !== "object") {
    return false
  }
  for (const key in obj) {
    if (!fieldKeys.includes(key)) {
      return false
    }
  }
  return true
}
const propsToFieldsOrActions = (props: IFormStoreProps) => {
  const fields: IFieldOrFormStoreObj = {}
  const actions: ActionsObj = {}
  const entries = Object.entries<FieldOrActionProp>(props)
  for (const [name, field] of entries) {
    if (typeof field === "function") {
      actions[name] = field as IAction
      continue
    } else if (typeof field === "object" && !checkIsFieldProps(field)) {
      fields[name] = new FormStore(field as IFormStoreProps)
      fields[name].name.camel = name
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

const getByFormat = (format: string, prop: string, formProp: string, fields: IFieldOrFormStoreObj) => {
  const result = {} as {[key: string]: string}
  for (const field of Object.values<IFieldStore | IFormStore>(fields)) {
    if (field instanceof FieldStore) {
      result[field.name[format]] = field[prop]
    } else if (field instanceof FormStore) {
      result[field.name!![format]] = field[formProp][format]
    }
  }
  return result
}

export interface IFormStore {
  loading: boolean
  submit: (...args) => any
  submitAttempted: boolean
  serverErrors: string[]
  fields: any //IFieldOrFormStoreObj
  actions: ActionsObj
  valid: boolean
  name: {
    title: string
    kebab: string
    camel: string
    snake: string
  }
  values: {
    camel: IStrObj
    kebab: IStrObj
    title: IStrObj
    snake: IStrObj
  }
  errors: {
    camel: IErrObj
    kebab: IErrObj
    title: IErrObj
    snake: IErrObj
  }
  reset: () => any
}

const setItems = (
    that: FormStore,
    items: any,
    fieldProp: string,
    formProp: string
) => {
  for (const key in items) {
    if (!(key in that.fields)) {
      throw new Error(`Could not find field ${key}`)
    }
  }
  for (const key in items) {
    if (that.fields[key] instanceof FieldStore) {
      ;(that.fields[key] as FieldStore)[fieldProp] = items[key]
    } else if (that.fields[key] instanceof FormStore) {
      ;(that.fields[key] as unknown as IFormStore)[formProp] = items[key]
    }
  }
}

const parseServerErrors = (err): any => {
  if (typeof err === "string") {
    return [err]
  } else if (Array.isArray(err)) {
    if (err.every(e => e instanceof Error)) {
      return err.map(e => e.message)
    } else if (err.every(e => typeof e === "string")) {
      return err
    } else {
      console.warn("Couldn't parse the error type of ", err)
      return err
    }
  } else if (err instanceof Error) {
    return [err.message]
  } else if (typeof err === "object") {
    if (typeof err.message === "string") {
      return [err.message]
    } else if (typeof err.data !== "undefined") {
      return parseServerErrors(err.data)
    } else {
      console.warn("Couldn't parse the error type of ", err)
      return err
    }
  } else {
    console.warn("Couldn't parse the error type of ", err)
    return err
  }
}

const respProps = [
  "status",
  "ok",
  "redirected",
]
export class FormStore implements IFormStore {
  public fields: IFieldOrFormStoreObj = {}
  private _name = ""
  public name = (() => nameGetter(this))()
  public actions: ActionsObj = {}
  public loading = false
  private _submit = () => {}
  public serverErrors: string[] = []
  public submitAttempted = false
  public submit = (...args) => new Promise(async (res, rej) => {
    if (args[0] && typeof args[0].preventDefault === "function") {
      args[0].preventDefault()
    }
    if (!(typeof this._submit ==="function")) {
      console.warn("You haven't provided a submit function.")
    }
    if (!this.valid) {
      this.touched = true
      this.submitAttempted = true
      return
    }
    this.serverErrors = [""]
    this.loading = true
    try {
      // @ts-ignore
      const resp:any = await this._submit(...args)
      this.loading = false
      if ((typeof Response !== "undefined") && (resp instanceof Response)) {
        if ((resp.status / 100 | 0) !== 2) {
          const type = resp.headers.get('content-type')
          const resIsJson = type && type.indexOf("application/json") > -1

          const result = {
            data: await (resIsJson ? resp.json() : resp.text()),
          }
          this.serverErrors = parseServerErrors(result.data)
          console.error(this.serverErrors)
          for (const key of respProps) {
            result[key] = resp[key]
          }
          return rej(result)
        }
      }
      res(resp)
    } catch (err) {
      this.serverErrors = parseServerErrors(err)
      console.error(this.serverErrors)
      this.loading = false
      rej(err)
    }
  })
  public values = (() => {
    const that = this
    return {
      get camel() {
        return getByFormat("camel", "value", "values", that.fields)
      },
      set camel(obj: {[key:string]: any}) {
        setItems(that, obj, "value","values")
      },
      get snake() {
        return getByFormat("snake", "value", "values", that.fields)
      },
      set snake(_obj: {[key:string]: string}) {
        const obj = Object.assign({}, _obj)
        for (const key in obj) {
          const temp = obj[key]
          delete obj[key]
          obj[camelToSnake(key)] = temp
        }
        setItems(that, obj, "value","values")
      },
      get kebab() {
        return getByFormat("kebab", "value", "values", that.fields)
      },
      set kebab(_obj: {[key:string]: string}) {
        const obj = Object.assign({}, _obj)
        for (const key in obj) {
          const temp = obj[key]
          delete obj[key]
          obj[camelToKebab(key)] = temp
        }
        setItems(that, obj, "value","values")
      },
      get title() {
        return getByFormat("title", "value", "values", that.fields)
      },
      set title(_obj: {[key:string]: string}) {
        const obj = Object.assign({}, _obj)
        for (const key in obj) {
          const temp = obj[key]
          delete obj[key]
          obj[camelToTitle(key)] = temp
        }
        setItems(that, obj, "value","values")
      },
    }
  })()
  public errors = (() => {
    const that = this
    return {
      get camel() {
        return getByFormat("camel", "errors", "errors", that.fields)
      },
      get snake() {
        return getByFormat("snake", "errors", "errors", that.fields)
      },
      get kebab() {
        return getByFormat("kebab", "errors", "errors", that.fields)
      },
      get title() {
        return getByFormat("title", "errors", "errors", that.fields)
      },
    }
  })()

  get valid() {
    let invalid = false
    for (const fieldKey in this.fields) {
      const field = this.fields[fieldKey]
      if (field instanceof FieldStore && field.errors && field.errors.length) {
        invalid = true
        break
      }
      if (field instanceof FormStore && !field.valid) {
        invalid = true
        break
      }
    }
    return !invalid
  }

  set touched(val: boolean) {
    for (const field of Object.values<any>(this.fields)) {
      field.touched = val
    }
  }

  get touched() {
    for (const field of Object.values<any>(this.fields)) {
      if (field.touched) {
        return true
      }
    }
    return false
  }

  constructor(_formProps: IFormStoreProps = {}) {
    makeAutoObservable(this)
    const {submit, ...formProps} = _formProps
    if (typeof submit === "function") {
      this._submit = submit
    }
    const {actions, fields} = propsToFieldsOrActions(formProps)
    for (const key in actions) {
      this.actions[key] = (actions[key] as any).bind(this)
    }
    this.fields = fields
  }

  public reset = () => {
    for (const field of Object.values<IFieldStore | IFormStore>(this.fields)) {
      field.reset()
      this.touched = false
      this.submitAttempted = false
    }
  }
}
