import "dotenv/config"; // dotenv/config is imported here because we want to load our environment variables when we start the app without starting our server at server.ts you're importing a module for its side effects only, without importing any bindings. In the case of dotenv/config, the side effect is that it immediately loads and initializes the environment variables from the .env file when the module is imported. This is a shorthand way to use dotenv without having to call dotenv.config() elsewhere in your code.
import express, { NextFunction, Request, Response } from "express";
import notesRoutes from "./routes/notes";
import morgan from "morgan";
import createHttpError, { isHttpError } from "http-errors"; // we could create our own HttpError, but we'll use the Http Errors provided by this package/dependency/module

// Default exports can be imported with import <name> from "<module-name>"; syntax, like import express from "express";
// Modules can also be imported just for their side effects, without importing any specific values or functions, using the import "<module-name>"; syntax, like import "dotenv/config";

// in app.ts we define our backend's endpoints

const app = express(); // the app constant is basically our server, this is where we add endpoints and everything

app.use(morgan("dev")); // this middleware is a logging library that helps us by logging requests and responses 

app.use(express.json()) // we tell express what type of data we want to accept as http message bodies to the server, and we do this by setting up this middleware, basically this tells our server that the requests' Content-Type header will be application/json

// this is like a puzzle that we have put together, we have this middleware that catches any requests that go through this endpoint, which then checks the notesRoutes endpoints we have in routes/notes.ts and look which one fits 
app.use("/api/notes", notesRoutes);
 

// to drive him the concept of middlewares, when we try to access an endpoint that doesn't exist, we get a default error message, but we could return our own error message instead 
// we can do this with a middleware, that captures all requests to go to an endpoint that we don't extra routes set up for it
// we will place this middleware below our endpoints because this middleware is a fallback, but we'll place it above our error handler middleware, because we want to forward errors to our error handler
// unlike app.get() app.post() http verbs etc we won't add a slash as the first arg (a specific endpoint) because we want to use this everywhere where we don't have an  endpoint set up for it
// we basically return an error that says "route not found" or "endpoint not found"
app.use((request, response, next) => {
    next(createHttpError(404, "endpoint not found")) // by passing createHttpError (method which returns HttpError instance) to next() with status 404 (resource not found), we're forwarding this to our handler below 
});

// this is express error handler, express error handler must take these four arguments with these exact types in order to work
// we can reuse this error handler by calling it in every endpoint's catch block while passing the error to the next() function
// these middlewares are checked in the order we define them in, so app.use() must be declared a the bottom, below app.get(), otherwise this middleware is the first one that would kick in, we only want to get to this middlware if we actually have an error 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: unknown, request: Request, response: Response, next: NextFunction) => {
    console.error(error);
    let errorMessage = "an unknown error occurred"; // let are variables we can reassign their values later, while const are constant values that can't be reassigned
    let errorStatus = 500 // returning 500 (internal server error) as a default fall-back value for errorStatus when we can't parse the received error because it isn't HttpError
    
    // we need to check if the error we received is actually an instance of HttpError, because error is of type `unknown` which means it can be anything! it can be any Error, or specifically an HttpError, or null, anything
    if (isHttpError(error)) {
        errorMessage = error.message
        errorStatus = error.status
    }

    response.status(errorStatus).json({ error: errorMessage});
});

export default app; // in order to use app.ts in our server, to call it and run it, we need to export it, this is a default export, which means we're only exporting one single thing from this file which is our express's app where we add all the endpoints 