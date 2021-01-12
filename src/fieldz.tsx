import * as React from 'react'
import { camelToTitle, titleToKebab, kebabToSnake } from './util'
import styles from './fieldz.css'

export type UseTextPropsObj = {
  name?: string
  validate?: (input: string) => Errors
  init?: string
}
export type Errors = string[] | string | Error[] | void

type CE = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
type KBE = React.KeyboardEvent

type PropsBase = {
  state: string
  setState: React.Dispatch<React.SetStateAction<string>>
  handleChange: (e:CE) => void
  name?: {
    title: string
    kebab: string
    camel: string
    snake: string
  }
  errors?: Errors
  setErrors?: React.Dispatch<React.SetStateAction<Errors>>
  touched?: boolean
  setTouched?: React.Dispatch<React.SetStateAction<boolean>>
}

export type UseTextReturn = {
  [P in keyof PropsBase]-?: PropsBase[P]
} & {errors?: Errors}

export type UseTextProps = UseTextPropsObj | string | number
export const parseProps = (_props: UseTextProps): UseTextPropsObj => {
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
export function useText(_props: UseTextProps = {}): UseTextReturn {
  const props: UseTextProps = parseProps(_props)
  const [state, setState] = React.useState<string>(props.init || "")
  const [errors, setErrors] = React.useState<Errors>(() => {
    if (props.validate) {
      return props.validate(state)
    }
    return ""
  })
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
    errors: errors || '',
    setErrors,
    touched,
    setTouched,
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
        spellCheck={props.spellCheck}
        autoCorrect={props.autoCorrect}
        autoCapitalize={props.autoCapitalize}
        autoComplete={props.autoComplete}
      />
      {props.touched && renderErrors(props.errors || [])}
    </div>
  )
}