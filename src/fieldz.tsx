import * as React from 'react'
import { camelToTitle, titleToKebab, kebabToSnake } from './util'
import styles from './fieldz.css'

type HookProps = {
  name?: string
  validate?: (input: string) => Errors
  init?: string | number
}
type Errors = string[] | string | void

type CE = React.ChangeEvent<HTMLInputElement>
type KBE = React.KeyboardEvent

export const useText = (_props: HookProps | string | number): FCProps => {
  if (["string", "number"].includes(typeof _props)) {
    _props = {
      init: _props as string
    }
  }
  const props: HookProps = _props as HookProps

  const [state, setState] = React.useState<any>(props.init || "")
  const [errors, setErrors] = React.useState<Errors>([])
  const [touched, setTouched] = React.useState<boolean>(false)
  const handleChange = (e: CE) => {
    if (props.validate) {
      setErrors(props.validate(e.target.value))
    }
    setState(e.target.value)
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
    state,
    setState,
    handleChange,
    name: {
      camel,
      title,
      kebab,
      snake,
    },
    errors,
    setErrors,
    touched,
    setTouched,
  }
}


type FCProps = {
  state: any
  setState: React.Dispatch<React.SetStateAction<any>>
  handleChange: (e:CE) => void
  name?: {
    title: string
    kebab: string
    camel: string
    snake: string
  }
  className?: string
  children?: React.ReactNode
  onEnter?: (e: KBE) => void
  errors?: Errors
  setErrors?: React.Dispatch<React.SetStateAction<Errors>>
  touched?: boolean
  setTouched?: React.Dispatch<React.SetStateAction<boolean>>
}

const getClassName = (props: FCProps, addendum=""): string => {
  let className: string = props.className || ''
  if (!className) {
    className = 'fieldz-input' + addendum
    if (props.name) {
      className += `${className}-${props.name.kebab+addendum}`
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
  return (
    <div className={styles.errors}>
      {errors.map(renderError)}
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
    if (!props.touched && props.setTouched) {
      props.setTouched(true)
    }
  }
  return (
    <div className={`${styles.container} ${getClassName(props)}`}>
      {!props.name ? "" : (
        <>
          <label className={`${styles.textLabel} ${getClassName(props, "-label")}`}>
            {props.name.title}
          </label>
          <br />
        </>
      )}
      <input
        className={`${styles.textInput} ${getClassName(props, "-input")}`}
        value={props.state}
        onChange={props.handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />
      {props.touched && renderErrors(props.errors || [])}
    </div>
  )
}