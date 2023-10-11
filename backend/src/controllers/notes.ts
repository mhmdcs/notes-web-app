import { RequestHandler, response } from "express";
import NoteModel from "../models/notes";

// we export this function from our controllers to our routes (i.e. so that our routes can import it and use it)
// this is a different way of exporting modules than than `export default` which exports one module, when we omit the `default` keyword, we can export multiple things
export const getNotes: RequestHandler = async (request, response, next) => { // we use the async keyboard before the arrow function so that the code knows that this is an asynchronous function
    try {
        // throw Error("Boom!");
        const notes = await NoteModel.find().exec(); // await is syntactic sugar around Promises API, so instead of having to use then() and pass it a callback (arrow function), resulting in callback hell (ugly nesting), it makes us write like normal synchronous code which helps readability! and it's important to not forget the await keyword here because we want to return the value, not a Promise object
        // find().exec() operation is an asynchronous operation, meaning that it takes time, because we have to go into our database, look it up, and then return it, and this could take milliseconds, possibily even a second! so we must make this call asynchornous, we don't want to make the server have to wait just because we did this one database operation 
        response.status(200).json(notes); // we send a 200 OK HTTP response to the client, and we don't just return the response in the form of text, we return the response in the form of json so that the client can parse it    
    } catch (error) {
        // in every route we either send a response, like we did with the 200 above, or we call next() which forwards this request to the next middleware, middlewares are pieces of code that know how to handle a request on our express server, it's a concept from the express library, 
        // both app.get(), app.post(), app.use(), etc create such middlewares, the difference is that app.get(), app.post(), all of these HTTP verbs etc they create middlwares that create these endpoints that we can call, like / and /notes etc, while app.use() is an other type of middlware that we just use in our code to either prepare our response in a specific way, or handle it like with our error handler below, and the error handler is a very specific kind of middlware that basically kicks in whenever we have an error 
        next(error);
    }
}

export const getNote: RequestHandler = async (request, response, next) => {
    const noteId = request.params.noteId // we take the noteId we expect to be passed in the get params
    try {
        const note = await NoteModel.findById(noteId).exec(); // we await on the async result
        response.status(200).json(note);
    } catch (error) {
        next(error);
    }
}

export const createNote: RequestHandler = async (request, response, next) => { // we make this function (arrow function, callback, etc) an async function because it's doing a very slow database insert operation
    const title = request.body.title;
    const text = request.body.text;
    
    console.log("someone called createNote!")
    try {
        // we'll use mongose to create (insert) our note into the database, so that we can send it back to the client, we do this so that we can later update the UI with this new note, and it's also useful the data we created when we get the response back on the client side!
        const newNote = await NoteModel.create({
            title: title,
            text: text,
        });

        response.status(201).json(newNote); // we send 201 which is HTTP code for (new resource created) but we could also send 200, but it's better practice distinguish them properly 
    } catch (error) {
        next(error);
    }
} // now there's a problem when we want to test this, with the brower we can only send get requests to the server, so we'll have to use tools like postman or curl to send more intricate HTTP requests like post requests to test them against our server