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