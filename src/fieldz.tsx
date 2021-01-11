import * as React from 'react'
import { camelToTitle, titleToKebab, kebabToSnake } from './util'
import styles from './fieldz.css'

export type HookPropsObj<T> = {
  name?: string
  validate?: (input: string) => Errors
  init?: T
}
export type Errors = string[] | string | Error[] | void

type CE = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
type KBE = React.KeyboardEvent

export type HookProps<T> = HookPropsObj<T> | string | number
export function useText(props: string): UseTextReturn<string>;
export function useText(props: number): UseTextReturn<number>;
export function useText(props: HookPropsObj<string>): UseTextReturn<string>;
export function useText(props: HookPropsObj<number>): UseTextReturn<number>;
export function useText(_props: any= {}): any {
  if (["string", "number"].includes(typeof _props)) {
    _props = {
      init: _props as string | number
    }
  }
  const props: HookPropsObj<string|number> = _props as HookPropsObj<string|number>
  const [state, setState] = React.useState<string|number>(props.init || "")
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


type FCProps<T> = {
  state: T
  setState: React.Dispatch<React.SetStateAction<T>>
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
export type UseTextReturn<T> = {
  [P in keyof FCProps<T>]-?: FCProps<T>[P]
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