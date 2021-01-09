### Example

```
yarn add fieldz
```

or

```
npm i --save fieldz
```

add to your app:


```tsx
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
    }
  })
  const [todos, setTodos] = useState<string[]>([])
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
```

Any of the properties passed to the `Text` component can be overridden, like normally. This means you can do stuff like create a custom `handleChange` handler.

For instance, you could have a custom handler that parse the value into an integer if it is able to:

```ts
<Text {...newTodo}
  handleChange={e => {
    const {value} = e.target
    if (!isNaN(parseInt(value)) {
      newTodo.setState(parseInt(value))
    }
  }}
/>
```

But that is just an example...this is a really good feature, because it means this whole thing is basically infinitely flexible, which can come in handy for corner cases.



### Contributing

To Test

```
yarn
yarn link
cd test-app
yarn link fieldz
yarn start
```