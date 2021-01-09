import React from 'react';
import { useText, Text } from 'fieldz'
import './App.scss';

function App() {
  const testField = useText({
    name: 'myTest',
  })
  return (
    <div className="App">
      <Text {...testField} />
      {testField.state}
    </div>
  );
}

export default App;
