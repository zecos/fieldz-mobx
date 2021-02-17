// @ts-nocheck
export const camelToTitle = camelCase => camelCase
  .replace(/([A-Z])/g, match => ` ${match}`)
  .replace(/([0-9]+)/g, match => ` ${match}`)
  .replace(/^./g, match => match.toUpperCase())
  .trim()

export const camelToSnake = camelCase => camelCase
  .replace(/([A-Z])/g, match => `_${match.toLowerCase()}`)
  .replace(/([0-9]+)/g, match => `_${match.toLowerCase()}`)
  .trim()

export const camelToKebab = camelCase => camelCase
  .replace(/([A-Z])/g, match => `-${match.toLowerCase()}`)
  .replace(/([0-9]+)/g, match => `-${match.toLowerCase()}`)
  .trim()

export const camelToPascal = camelCase => camelCase
  .replace(/^./g, match => match.toUpperCase())
  .trim()

export const titleToKebab = title => title
  .replace(/ ([A-Z])/g, match => `-${match.trim()}`)
  .toLowerCase()

export const kebabToSnake = (kebab: string) => kebab.replace("-", "_")

export const nameGetter = (that: any) => {
  return {
    get camel() {
      return that._name
    },
    set camel(val: string) {
      that._name = val
    },
    get title() {
      return camelToTitle(that._name)
    },
    set title(val: string) {
      that._name = titleToCamel(val)
    },
    get kebab() {
      return camelToKebab(that._name)
    },
    set kebab(val: string) {
      that._name = kebabToCamel(val)
    },
    get snake() {
      return camelToSnake(that._name)
    },
    set snake(val: string) {
      that._name = kebabToSnake(val)
    },
  }
}

