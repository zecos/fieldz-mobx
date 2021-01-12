import React, { useState } from 'react';
import { useText, Text, useForm } from 'fieldz'
import './App.scss';

function App() {
  const newTodo = useText({
    name: 'newTodo',
    validate: val => {
      if (val.length < 3) {
        return "Must be at least 3 characters long."
      }
    },
  })
  const [todos, setTodos] = useState<string[]>([])
  const userForm = useForm({
    fields: {
      username: {
        validate: val => {
          if (val.length < 3) {
            return "Must be at least 3 characters long."
          }
        }
      },
      password: "",
    },
    submit: ({values}) => {
      console.log(values)
    }
  })
  return (
    <div className="App">
      <Text {...newTodo}
        onEnter={() => {
          if (newTodo.errors) {
            newTodo.setTouched(true)
            return
          }
          setTodos([
            ...todos,
            newTodo.state
          ])
          newTodo.setTouched(false)
          newTodo.setState('')
        }}/>
      <ul>
        {todos.map((todo, i) => <li key={i}>{todo}</li>)}
      </ul>
      <form className="user-form">
        <Text {...userForm.fields.username} />
        <Text {...userForm.fields.password} />
        <button onClick={userForm.handleSubmit}>
          Submit
        </button>
      </form>
    </div>
  );
}

export default App;
