import { Note } from "../models/notes";
import { User } from "../models/user";

// this .ts module contains the lower-level fetch code logic, so that App.tsx is only concerned and only cares about displaying the data

// because javascript's fetch() function does not throw errors upon 400-500 responses, we need to create a wrapper for it that explicitly throws errors upon non-ok (non-200s i.e. 400-500) responses, and call that instead
async function fetchData(input: RequestInfo, init: RequestInit) {
        const response = await fetch(input, init);
        if (response.ok) {
            return response;
        } else {
            const errorBody = await response.json();
            const errorMessage = errorBody.error; // since in the backend we always return a json object with 400-500 that contains a json key named `error` with the value error string, we call `errorBody.error`
            throw Error(errorMessage);
        }
}

export async function getLoggedInUser(): Promise<User> {
    const response = await fetchData("/api/users/", { method: "GET" }) // since the frontnd and backend are on the same domain/ip address (that is, localhost currently), this will actually send the cookie in the header to the backend automatically, so we won't have to do anything special here to send the cookies, if they were on different domains/ip addresses, then we'll have to include the credentials explicitly in the fetch() function configurations (second parameter)
    return response.json(); // we will either get the logged in user object, or we'll get a 401 response if we aren't
}

export interface SignUpCredentials {
    username: string,
    email: string,
    password: string,
}

export async function signup(credentials: SignUpCredentials): Promise<User> {
    const response = await fetchData("/api/users/signup", 
    { 
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
    })
    return response.json();
}

export interface LoginCredentials {
    username: string,
    password: string,
}

export async function login(credentials: LoginCredentials): Promise<User> {
    const response = await fetchData("/api/users/login", { 
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
    })
    return response.json();
}

export async function logout() {
    // logout() doesn't take any arguments, doesn't return anything, we know that it went successful if fetchData() doesn't throw
    await fetchData("/api/users/logout", { method: "POST" }) // again, since the frontnd and backend are on the same domain/ip address (that is, localhost currently), this will actually send the cookie in the header to the backend automatically, so we won't have to do anything special here to send the cookies, if they were on different domains/ip addresses, then we'll have to include the credentials explicitly in the fetch() function configurations (second parameter) 
}

// we use await on the fetch() function call because this is an asynchronous operation; we have to load data from the backend and it could take a while
// first param is the endpoint entire url, second param is a javascript object literal (json) because this is how we configure this api call to be a GET http verb
export async function fetchNotes(): Promise<Note[]> {
    const response = await fetchData("/api/notes", { method: "GET" }); 
    return response.json(); // remember, response.json() is an async op that returns a promise, so when fetchNotes()'s caller uses it, they have to await on its result
}

// we create a type for the note input because we don't want to use title and text separately all the time, it's good practice to make good use of types as much as you can in typescript
export interface NoteInput {
    title: string,
    text?: string,
}

export async function createNote(note: NoteInput): Promise<Note> {
    const response = await fetchData("/api/notes/", { 
        method: "POST",
        headers: { // add headers to our request to indicate what kind of data we're sending 
            "Content-Type": "application/json", // this tells our backend what kind of format the data we're sending will be, and of course, it'll be json
        },
        body: JSON.stringify(note), // since we can only send bytes back and forth between our frontend and our backend, we want to stringify (serialize) the note object we're gonna pass, because the note object is only understandable by javascript, and while our backend is also written in javascript, the communication protocol we use (HTTP) does not, HTTP only understands bytes, thus we stringify our javascript objects, which means turning them into json represented as a string.
    });
    return response.json(); // the json returned from the response to our create note request will return the json representation of the note
}

export async function removeNote(noteId: string) {
    // we could've also written it like fetch("/api/notes/" + noteId), but backticks `` allow us to string interpolate/template literal a variable into a string
    await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
}

export async function updateNote(noteId: string, note: NoteInput): Promise<Note> {
    const response = await fetchData(`/api/notes/${noteId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(note)
    });

    return response.json();
}

/*
JSON.stringify():
- `JSON.stringify()` is a method provided by the Web APIs for JavaScript environments and it is available in both browser and Node.js environments.
- It converts a JavaScript object into a JSON string. This process is called serialization. The JSON string is a textual representation of the data, which can be transmitted over a network and understood by various programming environments, not just JavaScript.

response.status().json():
- In Node.js, specifically with Express.js (a web application framework for Node.js), `response.status().json()` sets the HTTP status for the response and then sends a JSON response. This method does two things: it serializes the JavaScript object passed to it into a JSON string (like `JSON.stringify()`), and it also sets the appropriate `Content-Type` header (`application/json`), indicating to the client that the data format is JSON.

Data Transfer in HTTP:
- When you send data from a client to a server or vice versa, you are indeed sending a sequence of bytes. HTTP doesn't have a built-in understanding of JavaScript objects; it deals with streams of bytes. Strings in JavaScript are serialized into bytes for transmission. When we talk about HTTP "understanding" strings, we really mean that HTTP is a protocol that can transmit textual data (among other kinds of data), which it does by sending bytes over a network.
- When you send a JSON string, it is encoded into bytes using a character encoding (typically UTF-8) and transmitted over the network. The receiving end then decodes the bytes back into a string, and if it's JSON, it can be parsed back into an object or data structure by the recipient's programming environment (this is called deserialization).

So, in summary, you serialize JavaScript objects into JSON strings because JSON is a text-based data interchange format that is language-independent. The text can be transmitted over the network as a sequence of bytes and then parsed into native data structures in whatever programming language is being used on the other end.
*/