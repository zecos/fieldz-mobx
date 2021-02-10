import * as React from 'react'
import { camelToTitle, titleToKebab, kebabToSnake, camelToKebab, camelToSnake, nameGetter } from './util'
import styles from './fieldz.css'
import { makeAutoObservable, computed, extendObservable } from 'mobx'
import { observer } from 'mobx-react-lite'

export type FieldStorePropsObj = {
  name?: string
  validate?: (input: string) => Errors
  init?: string
}

export type Errors = string[] | string | Error[] | void
type CE = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
type KBE = React.KeyboardEvent

export interface IFieldStore {
  name: {
    title: string
    kebab: string
    camel: string
    snake: string
  }
  value: string
  errors: Errors
  touched: boolean
  reset: () => any
}


export type FieldStoreProps = FieldStorePropsObj | string | number
export const parseProps = (_props: FieldStoreProps): FieldStorePropsObj => {
  if (typeof _props === "string") {
    _props = {
      init: _props
    }
  } else if (typeof _props === "number") {
    _props = {
      init: _props + ""
    }
  }
  return _props
}
export class FieldStore implements IFieldStore {
  private _name = ""
  public validate = (val: string) => ""
  public init = ""
  public errors = ""
  private _value = ""
  public touched = false
  public reset = () => {
    this.touched = true
    this.value = this.init || ""
  }
  public name = (() => nameGetter(this))()

  set value(value: string) {
    this._value = value
    this.errors = this.validate(this._value)
  }
  get value() {
    return this._value
  }
  constructor(props: any) {
    this.init = props.init || this.init
    this._name = props.name || ""
    this.validate = props.validate || (() => "")
    this.value = props.init || ""
    makeAutoObservable(this)
  }
}

interface FCProps {
  className?: string
  children?: React.ReactNode
  onEnter?: (e: KBE) => void
  spellCheck?: boolean
  autoCorrect?: "on" | "off" | boolean
  autoCapitalize?: "on" | "off" | boolean
  autoComplete?: "on" | "off" | boolean
  onChange?: (e?: CE) => any
  onKeyDown?: (e?: CE) => any
  onBlur?: (e?: CE) => any
  onFocus?: (e?: CE) => any
  type?: string
  store: IFieldStore
  required?: boolean
}

const getClassName = (props: FCProps, addendum=""): string => {
  let className: string = props.className || ''
  if (!className) {
    className = 'fieldz-view' + addendum
    if (props.store.name) {
      className += ` ${className}-${props.store.name.kebab+addendum}`
    }
  }
  return className
}

const renderError = error => <div key={error.toString()} className={styles.error}>{error.toString()}</div>

const renderErrors = (errors: Errors) => {
  if (typeof errors === "undefined" || !errors.length) {
    return ""
  }
  // @ts-ignore
  errors = [].concat(errors) as string[]
  const resultErrors: string[] = []
  for (const error of errors) {
    const err = error as any
    if (err instanceof Error) {
      resultErrors.push(err.toString())
    } else if (typeof error === "string") {
      resultErrors.push(err)
    } else {
      console.error(`Error invalid. Errors must be of type string or Error`)
      console.error(err)
    }
  }
  return (
    <div className={`${styles.errors} fieldz-errors`}>
      {resultErrors.map(renderError)}
    </div>
  )
}

const normalizeOnOff = option => {
  if (typeof option === "boolean") {
    return option ? "on" : "off"
  }
  return option
}

export const FieldView: React.FC<FCProps> = observer(props => {
  const [isFocused, setIsFocused] = React.useState(false)
  const { store } = props
  let handleKeyDown;
  if (props.onEnter) {
    handleKeyDown = (e: KBE) => {
      if (e.key === "Enter") {
        props.onEnter!(e)
      }
    }
  }
  const handleChange = (e: CE) => {
    store.value = e.target.value
  }
  const handleBlur = (e: CE) => {
    store.touched = true
    setIsFocused(false)
    if (props.onBlur) {
      props.onBlur(e)
    }
  }
  const handleFocus = (e: CE) => {
    setIsFocused(true)
    if (props.onFocus) {
      props.onFocus(e)
    }
  }
  return (
    <label
      htmlFor={props.store.name.kebab}
      className={`${styles.textLabel} ${getClassName(props)} ${isFocused ? "focused" : "blurred"} ${props.store.errors.length ? "has-errors" : "valid"} ${props.store.touched ? "touched" : "untouched"} ${props.store.value.length ? "non-empty" : "empty"}`}>
      {typeof props.store.name === "undefined" ? "" : (
        <span className={`${styles.textActualLabel} ${getClassName(props, "-actual-label")}`}>
          {props.store.name.title}
        </span>
      )}
      <input
        id={(props.store.name) && props.store.name.kebab}
        className={`${styles.textInput} ${getClassName(props, "-input")}`}
        value={props.store.value}
        onChange={props.onChange || handleChange}
        onKeyDown={props.onKeyDown || handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
        spellCheck={props.spellCheck}
        autoCorrect={normalizeOnOff(props.autoCorrect)}
        autoCapitalize={normalizeOnOff(props.autoCapitalize)}
        autoComplete={normalizeOnOff(props.autoComplete)}
        required={props.required}
        type={props.type}
      />
      {props.store.touched && renderErrors(props.store.errors || [])}
    </label>
  )
})