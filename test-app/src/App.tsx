import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite'
import { FieldView, FieldStore, FormStore } from 'fieldz-mobx'
import './App.scss';
import { extendObservable } from 'mobx';
import { computed, makeObservable } from 'mobx';
import { camelToTitle, kebabToSnake, titleToKebab } from './util';
import { makeAutoObservable } from 'mobx';

const newTodoStore = new FieldStore({
  name: 'newTodo',
  init: "mytodo",
  validate: (val: any) => {
    if (val.length < 3) {
      return "Must be at least 3 characters long."
    }
  },
})
newTodoStore.value = "hello"

const userFormStore = new FormStore({
  username: {
    validate: (val:any) => {
      if (val.length < 3) {
        return "Must be at least 3 characters long."
      }
    }
  },
  password: "",
})


function App() {
  const _userFormStore:any = userFormStore
  const [todos, setTodos] = useState<string[]>([])
  console.log(userFormStore.values.camel)
  const submit = () => {}
  return (
    <div className="App">
      <button onClick={() => {
        userFormStore.values.kebab = {
          username: "zane"
        }
      }}>
        Click Me
      </button>
      {/* <FieldView store={newTodoStore} />
      {newTodoStore.value}
      <button onClick={() => newTodoStore.value = "second"}>
        Change
      </button>
      <button onClick={newTodoStore.reset}>
        Reset Todo
      </button>
      <button onClick={userFormStore.reset}>
        Reset User
      </button>

      <FieldView store={newTodoStore}
        onEnter={() => {
          if (newTodoStore.errors) {
            newTodoStore.touched = true
            return
          }
          setTodos([
            ...todos,
            newTodoStore.value
          ])
          newTodoStore.reset()
        }}/>
      <ul>
        {todos.map((todo, i) => <li key={i}>{todo}</li>)}
      </ul> */}
      <form className="user-form">
        <FieldView store={_userFormStore.fields.username} spellCheck={false} />
        <FieldView store={_userFormStore.fields.password} />
        <button onClick={submit}>
          Submit
        </button>
      </form>
    </div>
  );
}

export default observer(App);
