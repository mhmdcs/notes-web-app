import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { Button } from 'react-bootstrap';
import { Note } from './models/notes';

function App() {
  const [notes, setNotes] = useState<Note[]>([]); // we initialize the state using the useState() react hook function, we pass in an empty array as the initial state, because when the website is first opened, there are no notes yet, we have to retrieve them from the backend first
  // now the question is, where do we load these notes from the backend? we can't just pull them directly inside this App function body
  // because react basically redraws this whole component whenever something in it changes, and it does this by executing the App function again
  // this is what side effects are: so now when we do something inside the App function body, something that doesn't relate to the rendering itself, but something that happens in our normal app flow (like loading the notes), and then we do it here directly inside the App function body, then react will execute it on every render; every time the App function is called, this is called a side-effect, which is of course not what we want, because this is way too often and frequent  
  // instead, we want to load our notes one single time, when the app starts for the first time, so we'll use the useEffect() react hook function, which is a function that takes another function as an argument, and we'll put that logic inside the passed-in arrow function callback
  // with useEffect() we can execute side effects outside of the rendering of the component itself, inside the arrow function passed to useEffect(), we have control over when it executes, and how often

  useEffect(() => {
    async function loadNotes() {
      // we use await on the fetch() function call because this is an asynchronous operation; we have to load data from the backend and it could take a while
      // first param is the endpoint entire url, second param is a javascript object literal (json) because this is how we configure this api call
      try {
        const response = await fetch("/api/notes", { method: "GET" });
        const notes = await response.json(); // we use await here as well because parsing the json out of the response is also an async operation
        setNotes(notes); // we call setNotes which is our state function that we destructured from the array returned by useState(), this way we update the state, and wherever in the the UI we use notes returned by useState(), it'll be the updated notes fetched from the backend
      } catch (error) {
        console.error(error);
        alert(error); // alert functions opens a little pop-up dialog window in the browser, not every beautiful and not a great user expereience, but it'll make do for now until we write better error-handling 
      }
    }

    loadNotes();
  }, []); // we also need to pass a dependency array to useEffect() as a second argument, inside the square bracket we can pass variables that whenver they're changed, they're gonna execute this useEffect() function again, if we pass an empty array, then useEffect() will only execute one time only at the beginning, which is exactly what we want, however, if we didn't pass an empty array at all i.e. we didn't pass anything to useEffect() second arg, then useEffect() will execute on every single render! and this is never what we want, that'd be like if we didn't use useEffect() at all and we put that loading notes code inside the App function body directly 

  // const [clickCount, setClickCount] = useState(0); // clickCount maintains the current count state, while setClickCount is a function that updates the state
  // because we need to notify react that it has to redraw the UI to display the new value, we need to create a state
  // useState() returns an array with two values, and so we destructure the array by using the `const [clickCount, setClickCount]` syntax, the first variable is the state itself, and the second variable is used to update the state 

  return (
    <div className="App">
      {JSON.stringify(notes)}
    </div>
  );
}

export default App;
