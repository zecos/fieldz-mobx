import * as React from 'react'
import { camelToTitle, titleToKebab, kebabToSnake } from './util'
import styles from './fieldz.css'
import { extendObservable, computed } from 'mobx'

export type FieldStorePropsObj = {
  name?: string
  validate?: (input: string) => Errors
  init?: string
}

export type Errors = string[] | string | Error[] | void
type CE = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
type KBE = React.KeyboardEvent

interface IFieldStore {
  name: {
    title: string
    kebab: string
    camel: string
    snake: string
  }
  value: string
  errors: Errors
  touched: boolean
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
  set value(value: string) {
    this._value = value
    this.errors = this.validate(this._value)
  }
  get value() {
    return this._value
  }
  public name = {
    camel: "",
    title: "",
    kebab: "",
    snake: "",
  }
  constructor(_props: FieldStoreProps) {
    const props = parseProps(_props)
    extendObservable(this, {
      _name: props.name,
      validate: props.validate,
      name: computed(() => {
        const camel = this._name
        const title = camelToTitle(camel)
        const kebab = titleToKebab(title)
        const snake = kebabToSnake(kebab)
        return {
          camel,
          kebab,
          title,
          snake,
        }
      }),
      _value: props.init || "",
      setValue: (value: string) => {
        this.errors = this.validate(value)
        this.value = value
      },
      reset: () => {
        this.touched = true
        this.value = props.init || ""
      }
    })
  }
}


interface FCProps {
  className?: string
  children?: React.ReactNode
  onEnter?: (e: KBE) => void
  spellCheck?: boolean
  autoCorrect?: "on" | "off"
  autoCapitalize?: "on" | "off"
  autoComplete?: "on" | "off"
  handleChange?: (e: CE) => any
  handleKeyDown?: (e: CE) => any
  type?: string
  store: IFieldStore
}

const getClassName = (props: FCProps, addendum=""): string => {
  let className: string = props.className || ''
  if (!className) {
    className = 'fieldz-input' + addendum
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
    <div className={styles.errors}>
      {resultErrors.map(renderError)}
    </div>
  )
}

export const Field: React.FC<FCProps> = props => {
  const { store } = props
  let handleKeyDown;
  if (props.onEnter) {
    handleKeyDown = (e: KBE) => {
      if (e.keyCode === 13) {
        props.onEnter!(e)
      }
    }
  }
  const handleChange = (e: CE) => {
    store.value = e.target.value
  }
  const handleBlur = () => {
    store.touched = true
  }
  return (
    <div className={`${styles.container} ${getClassName(props)}`}>
      {!props.store.name ? "" : (
        <>
          <label
            htmlFor={props.store.name.kebab}
            className={`${styles.textLabel} ${getClassName(props, "-label")}`}>
            {props.store.name.title}
          </label>
          <br />
        </>
      )}
      <input
        id={(props.store.name) && props.store.name.kebab}
        className={`${styles.textInput} ${getClassName(props, "-input")}`}
        value={props.store.value}
        onChange={props.handleChange || handleChange}
        onKeyDown={props.handleKeyDown || handleKeyDown}
        onBlur={handleBlur}
        spellCheck={props.spellCheck}
        autoCorrect={props.autoCorrect}
        autoCapitalize={props.autoCapitalize}
        autoComplete={props.autoComplete}
        type={props.type}
      />
      {props.store.touched && renderErrors(props.store.errors || [])}
    </div>
  )
}