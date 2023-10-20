import { Note } from "../models/notes";

// this .ts module contains the lower-level fetch code logic, so that App.tsx only cares about displaying the data

// because javascript's fetch() function does not throw errors upon 400-500 responses, we need to create a wrapper for it that explicitly throws errors upon non-ok (non-200 i.e. 400-500) responses, and call that instead
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
        body: JSON.stringify(note), // since we can only send string back and forth between our frontend and our backend, we want to stringify the note object we're gonna pass
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