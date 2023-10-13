import { RequestHandler } from "express";
import NoteModel from "../models/notes";
import createHttpError from "http-errors";
import mongoose from "mongoose";

// we export this function from our controllers to our routes (i.e. so that our routes can import it and use it)
// this is a different way of exporting modules than `export default` which exports one module, when we omit the `default` keyword, we can export multiple things
export const getNotes: RequestHandler = async (request, response, next) => { // we use the async keyword before the arrow function because we want this to be an asynchronous function, and because we can only use the `await` keyword inside functions declared with the `async` keyword
    try {
        // throw Error("Boom!");
        const notes = await NoteModel.find().exec(); // await is syntactic sugar around Promises API, so instead of having to use then() and passing it a callback (arrow function) and resulting in callback hell (ugly nesting), async/await makes us write asynchronous code like normal synchronous code which helps readability! and it's important to not forget the await keyword here because we want to return the value, not a Promise object
        // find().exec() operation is an asynchronous operation, meaning that it takes time to execute, but will return immediately with a Promise (which we can `await` on), ind().exec() operation is an asynchronous long-running operation because we have to go into our database, look up the value, and then return it, and this could take milliseconds, possibily even a whole second! so we must make this call asynchornous, we don't want to force the server to wait and block just because we did this one database operation, actually, we *never* want to make the server block
        response.status(200).json(notes); // we send a 200 OK HTTP response to the client. We DON'T just return the response in the form of text, instead, we return the response in the form of json so that the client can parse it    
    } catch (error) {
        // in every route we either send a response, like we did with the 200 above, or we call next() which forwards this request to the next middleware, middlewares are pieces of code that know how to handle a request on our express server, it's a concept from the express library, 
        // both app.get(), app.post(), app.use(), etc create such middlewares, the difference is that app.get(), app.post(), all of these HTTP verbs etc, they create middlwares that create these endpoints that we can call, like / and /notes etc, while app.use() is an other type of middlware that we just use in our code to either prepare our response in a specific way, or handle it like with our error handler below, and the error handler is a very specific kind of middlware that basically kicks in whenever we have an error 
        next(error);
    }
}

export const getNote: RequestHandler = async (request, response, next) => {
    const noteId = request.params.noteId; // we take the noteId we expect to be passed in the http get params
    try {

        if (!mongoose.isValidObjectId(noteId)) { // here we check if someone passed us an invalid noteId (e.g. it's length is incorrect or has invalid chars, etc), then we throw 400 bad request 
            throw createHttpError(400, "invalid noteId");
        }

        const note = await NoteModel.findById(noteId).exec(); // we await on the async op

        if (!note) { // check if we fail to find the note in the db
            throw createHttpError(404, "Note not found");
        }

        response.status(200).json(note);
    } catch (error) {
        next(error);
    }
}

// `interface` is very similar to `type` in typescript, the difference between interfaces and types is that generally you want to use interfaces whenever possible because they're more flexible, and there are certain siutations where you can't use intefaces so you use types instead 
interface CreateNoteBody {
    title?: string, // we set the title as optional with the ? operator even though it's a mandatory field, why? because whenever someone sends a request to this endpoint, we can't be sure that they actually sent this data, so even though the title is required in the database, it still might be missing from the request, in which case we would want to respond to the request with a decline 
    text?: string, // since text is an optional field, we make it an optional by adding a ? operator to it, which means it either has a proper value or not, so it could be undefined too.
} // we use the CreateNoteBody interface by passing it as a generic type argument to the RequestHandler function below

// interface RequestHandler has four type arguments, P = core.ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = qs.ParsedQs.
// we have to declare the four different type arguments, because this is all or nothing, either we declare no type (`unknown` type), or all, and by all i mean the bodies (ResBody and ReqBody), the URL params (P), the URL queries (ReqQuery)
// we'll pass our CreateNoteBody interface as a type to the third generic type argument (ReqBody), for the rest, we will leave them untouched by passing `unknown`, so why do we pass `unknown` instead of `any`? because `any` is unsafe, `any` basically allows us to call anything on these variables, while `unknown` is much more restrictive and thus safer
export const createNote: RequestHandler<unknown, unknown, CreateNoteBody, unknown> = async (request, response, next) => { // we make this function (arrow function, callback, etc) an async function because it's doing a very slow database insert operation
    const title = request.body.title; // before passing our CreateNoteBody type, title was of type `any`, after passing CreateNoteBody, `title` became of type `string`, and when we made title optional in the CreateNoteBody interface, title's type became either "string" or "undefined", undefined is a possible type for title because we can't guarantee that whoever sends these reqeusts actually sent a title
    const text = request.body.text;
    // because title and text are of type `any`, meaning that typescript doesn't know their types, it means that their type could be anything, from strings to numbers, so we have to make an CreateNoteBody interface to make them typed to tell typescript what types we should expect

    console.log("someone called createNote!")
    // when a client tries to create a note without a title, which is mandatory, mongoose throws its own default error message, and it doesn't have an http status code associated with it, so it falls back to our middleware's error-handler's 500 default code
    // for this reason instead of relying on mongoose to check the title and throw an error for us, we need to check it ourselves, this gives us more control over the status code and error message, and the default error message from mongoose will remain a fallback in case we miss up our handling somehow
    // but the first line of defense for errors will be our own endpoint's request handler code here
    try {
        // we'll do our internal custom error handling in the try block because we're gonna play around with arrows, and whenever we use arrow functions we have to catch their errors so that the server doesn't crash and we lose our job!
        if (!title) { // this checks if title is false i.e. if title is undefined 
            throw createHttpError(400, "Note must have a title"); // if title is undefined, then we throw an HttpError with 400 (bad request), which will then get caught in the catch block below, and then next() will forward it to our error-handler middleware
        }
        // we'll use mongose to create (insert) our note into the database, so that we can send it back to the client, we do this so that we can later update the UI with this new note, and it's also efficient to return the data we created so that the client doesn't have to make two requests!
        const newNote = await NoteModel.create({ // we pass in a javascript object literal (aka json)
            title: title,
            text: text,
        });

        response.status(201).json(newNote); // we send 201 which is HTTP code for (new resource created), while we could also send 200 (or anything really), it's better practice distinguish them properly and to always return the correct status code
    } catch (error) {
        next(error);
    }
} // now there's a problem when we want to test this, with the brower we can only send get requests to the server, so we'll have to use tools like postman or curl to send more intricate HTTP requests like post requests to test them against our server, assuming our client hasn't been built yet 

// earlier, we didn't define a type for when we fetched the noteId from the endpoint's URL params in getNote, because we didn't specify any generic types to RequestHandler
// but now, since we're updating a note and thus we're passing a type to the third parameter (reqBody), we're forced to either declare the rest of the generic types as either unknown (a type that's like any, but the difference is that we can't perform aribtrary operations on `unknown`s), or to declare a proper type for the request params
// and because of those unknown generic types, if we tried to use `request.params.noteId` it wouldn't work because `params` is of type `unknown`, and thus, we'll have to create a type for the NoteId and pass it to the first generic type parameter

interface UpdateNoteParams {
    noteId: string
}

interface UpdateNoteBody {
    title?: string,
    text?: string,
}

export const updateNote: RequestHandler<UpdateNoteParams, unknown, UpdateNoteBody, unknown> = async (request, response, next) => {

    const noteId = request.params.noteId;
    const updatedTitle = request.body.title;
    const updatedText = request.body.text;

    try {

        if (!mongoose.isValidObjectId(noteId)) { // here we check if someone passed us an invalid noteId (e.g. it's length is incorrect or has invalid chars, etc), then we throw 400 bad request 
            throw createHttpError(400, "invalid noteId");
        }

        if (!updatedTitle) { // this checks if title is false i.e. if title is undefined 
            throw createHttpError(400, "Note must have a title"); // if title is undefined, then we throw an HttpError with 400 (bad request), which will then get caught in the catch block below, and then next() will forward it to our error-handler middleware
        }

        const note = await NoteModel.findById(noteId).exec();

        if (!note) { // check if we fail to find the note in the db
            throw createHttpError(404, "Note not found");
        }

        // set the note to have the updated title and text from the request's params
        note.title = updatedTitle;
        note.text = updatedText;

        const updatedNote = await note.save(); // save the updated note to the db

        response.status(200).json(updatedNote);
    } catch (error) {
        next(error); // call the error handler in case there's an error 
    }
};

export const deleteNote: RequestHandler = async (request, response, next) => {

    const noteId = request.params.noteId;

    try {
        if (!mongoose.isValidObjectId(noteId)) { // here we check if someone passed us an invalid noteId (e.g. it's length is incorrect or has invalid chars, etc), then we throw 400 bad request 
            throw createHttpError(400, "invalid noteId");
        }

        const note = await NoteModel.findById(noteId).exec();

        if (!note) { // check if we fail to find the note in the db
            throw createHttpError(404, "Note not found");
        }

        await note.remove();

        response.sendStatus(204); // we send 204 success code which is the code for a successful deletion. Notice that we called sendStatus() instead of status() like in the above controllers, this is because in the above controllers, json() is the method that actually sends the response

    } catch (error) {
        next(error);
    }
}