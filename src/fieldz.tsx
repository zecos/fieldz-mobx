import * as React from 'react'
import { camelToTitle, titleToKebab, kebabToSnake } from './util'
import styles from './fieldz.css'

type HookProps = {
  name?: string
}

type CE = React.ChangeEvent<HTMLInputElement>

export const useText = (props: HookProps = {}): FCProps => {
  const [state, setState] = React.useState<string>("")
  const handleChange = (e: CE) => setState(e.target.value)
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
    }
  }
}

type FCProps = {
  state: string
  setState: React.Dispatch<React.SetStateAction<string>>
  handleChange: (e:CE) => void
  name?: {
    title: string
    kebab: string
    camel: string
    snake: string
  }
  className?: string
  children?: React.ReactNode
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

export const Text: React.FC<FCProps> = props => {
  return (
    <div className={`${styles.css} ${getClassName(props)}`}>
      {!props.name ? "" : (
        <>
          <label className={getClassName(props, "-label")}>
            {props.name.title}
          </label>
          <br />
        </>
      )}
      <input
        className={props.className}
        value={props.state}
        onChange={props.handleChange}
      />
    </div>
  )
}