import React from 'react';
import { useText, Text } from 'fieldz'
import './App.scss';

function App() {
  const testField = useText({
    name: 'myTest',
  })
  const testField2 = useText({
    name: 'myTest2',
  })
  return (
    <div className="App">
      <Text {...testField} />
      <Text {...testField2} />
      {testField.state}
    </div>
  );
}

export default App;
