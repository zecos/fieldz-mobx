import React, { useState } from 'react';
import { useText, Text } from 'fieldz'
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
  const [todos, setTodos] = useState<(string | number)[]>([])
  return (
    <div className="App">
      <Text {...newTodo}
        onEnter={() => {
          setTodos([
            ...todos,
            newTodo.state
          ])
          newTodo.setState('')
        }}/>
      <ul>
        {todos.map((todo, i) => <li key={i}>{todo}</li>)}
      </ul>
    </div>
  );
}

export default App;
