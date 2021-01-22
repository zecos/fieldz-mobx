import React, { useState } from 'react';
import { observer } from 'mobx-react-lite'
import { createText, Text, createForm } from 'fieldz-mobx'
import './App.scss';
import { observable } from 'mobx';
import { computed } from 'mobx';
import { HighlightSpanKind } from 'typescript';
import { extendObservable } from 'mobx';

const newTodo = createText({
  name: 'newTodo',
  validate: val => {
    if (val.length < 3) {
      return "Must be at least 3 characters long."
    }
  },
})


function App() {
  // const [todos, setTodos] = useState<string[]>([])
  // const userForm = createForm({
  //   fields: {
  //     username: {
  //       validate: val => {
  //         if (val.length < 3) {
  //           return "Must be at least 3 characters long."
  //         }
  //       }
  //     },
  //     password: "",
  //   },
  //   submit: ({values}) => {
  //     console.log(values)
  //   }
  // })
  const [state, setState] = useState(false)
  const refresh = () => setState(!state)
  return (
    <div className="App">
      <Text {...newTodo} />
      <button onClick={refresh}>
        refresh
      </button>

      {/* <Text {...newTodo}
        onEnter={() => {
          if (newTodo.errors) {
            newTodo.touched = true
            return
          }
          setTodos([
            ...todos,
            newTodo.value
          ])
          newTodo.touched = false
          newTodo.value = ""
        }}/>
      <ul>
        {todos.map((todo, i) => <li key={i}>{todo}</li>)}
      </ul>
      <form className="user-form">
        <Text {...userForm.fields.username} spellCheck={false} />
        <Text {...userForm.fields.password} />
        <button onClick={userForm.handleSubmit}>
          Submit
        </button>
      </form> */}
    </div>
  );
}

export default observer(App);
