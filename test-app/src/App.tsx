import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite'
import { FieldView, FieldStore, FormStore, IFormStore } from 'fieldz-mobx'
import './App.scss';
import { toJS, toJSON } from 'mobx';

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
const submitStore:IFormStore = new FormStore({
  val1: {
    init: "",
    validate: () => "there was an error"
  },
  nestingval: {
    nested: "",
    nested2: "",
  },
  val2: "",
  x() {
    for (const key in toJS(submitStore.values.camel)) {
      console.log(key, toJS(submitStore.values.camel[key]))
    }
  },
  submit(e:any) {
    e.preventDefault()
    console.log("submitting")
  }
})
const {fields, actions} = submitStore



function App() {

  const [todos, setTodos] = useState<string[]>([])
  const submit = () => {}
  console.log(fields.val1.errors)
  actions.x()
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
      {<FieldView store={submitStore.fields.val1} />}
      <form className="user-form">
        <FieldView store={userFormStore.fields.username} spellCheck={false} />
        <FieldView store={userFormStore.fields.password} type="password" />
        <button onClick={actions.submit}>
          Submit
        </button>
      </form>
    </div>
  );
}

export default observer(App);
