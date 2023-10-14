import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { Button } from 'react-bootstrap';

function App() {
  const [clickCount, setClickCount] = useState(0); // clickCount maintains the current count state, while setClickCount updates the state
  // because we need to notify react that it has to redraw the UI to display the new value, we need to create a state
  // useState() returns an array with two values, and so we destructure the array by using the `const [clickCount, setClickCount]` syntax, the first variable is the state itself, and the second variable is used to update the state 

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          This is Mohammed's app
        </p>
        <Button onClick={() => setClickCount(clickCount + 1)}>
          I've been clicked {clickCount} times!
        </Button>
      </header>
    </div>
  );
}

export default App;
