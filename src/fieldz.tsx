import * as React from 'react'
import { camelToTitle, titleToKebab, kebabToSnake } from './util'
import styles from './fieldz.css'
import { observable } from 'mobx'

export type CreateTextPropsObj = {
  name?: string
  validate?: (input: string) => Errors
  init?: string
}

export type Errors = string[] | string | Error[] | void
type CE = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
type KBE = React.KeyboardEvent

type PropsBase = {
  value: string
  handleChange: (e:CE) => void
  name?: {
    title: string
    kebab: string
    camel: string
    snake: string
  }
  errors?: Errors
  touched?: boolean
}

export type CreateTextReturn = {
  [P in keyof PropsBase]-?: PropsBase[P]
} & {errors?: Errors}

export type CreateTextProps = CreateTextPropsObj | string | number
export const parseProps = (_props: CreateTextProps): CreateTextPropsObj => {
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
export function createText(_props: CreateTextProps = {}): CreateTextReturn {
  const props: CreateTextProps = parseProps(_props)
  const value = props.init || ""
  const errors = (() => {
    if (props.validate) {
      return props.validate(value)
    }
    return []
  })() || ''
  const touched = false
  const result = observable({
    value,
    errors,
    touched,
  })

  const setValue = (value: string) => {
    if (props.validate) {
      result.errors = props.validate(value) || ''
    }
    result.value = result.value + value
  }

  const reset = () => {
    result.touched = true
    result.value = props.init || ""
    result.errors = (() => {
      if (props.validate) {
        return props.validate(value)
      }
      return []
    })() || ""
  }

  let title = ''
  let kebab = ''
  let snake = ''
  let camel = ''
  if (props.name) {
    camel = props.name
    title = camelToTitle(camel)
    kebab = titleToKebab(title)
    snake = kebabToSnake(kebab)
  }
  return {
    name: {
      camel,
      title,
      kebab,
      snake,
    },
    setValue,
    reset,
    ...result,
  }
}


interface FCProps extends PropsBase {
  className?: string
  children?: React.ReactNode
  onEnter?: (e: KBE) => void
  spellCheck?: boolean
  autoCorrect?: "on" | "off"
  autoCapitalize?: "on" | "off"
  autoComplete?: "on" | "off"
  type?: string
}

const getClassName = (props: FCProps, addendum=""): string => {
  let className: string = props.className || ''
  if (!className) {
    className = 'fieldz-input' + addendum
    if (props.name) {
      className += ` ${className}-${props.name.kebab+addendum}`
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

export const Text: React.FC<FCProps> = props => {
  let handleKeyDown;
  if (props.onEnter) {
    handleKeyDown = (e: KBE) => {
      if (e.keyCode === 13) {
        props.onEnter!(e)
      }
    }
  }
  const handleBlur = () => {
    console.log(props)
    console.log('blurring')
    // (props as any).x = true
  }
  return (
    <div className={`${styles.container} ${getClassName(props)}`}>
      {!props.name ? "" : (
        <>
          <label
            htmlFor={props.name.kebab}
            className={`${styles.textLabel} ${getClassName(props, "-label")}`}>
            {props.name.title}
          </label>
          <br />
        </>
      )}
      <input
        id={(props.name) && props.name.kebab}
        className={`${styles.textInput} ${getClassName(props, "-input")}`}
        value={props.value}
        onChange={props.handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        spellCheck={props.spellCheck}
        autoCorrect={props.autoCorrect}
        autoCapitalize={props.autoCapitalize}
        autoComplete={props.autoComplete}
        type={props.type}
      />
      {props.touched && renderErrors(props.errors || [])}
    </div>
  )
}