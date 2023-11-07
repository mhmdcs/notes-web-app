import "dotenv/config"; // dotenv/config is imported here because we want to load our environment variables when we start the app without starting our server at server.ts, you're importing a module for its side effects only, without importing any bindings. In the case of dotenv/config, the side effect is that it immediately loads and initializes the environment variables from the .env file when the module is imported. BTW, this is a shorthand way to use dotenv without having to call dotenv.config() elsewhere in your code.
import express, { NextFunction, Request, Response } from "express";
import notesRoutes from "./routes/notes";
import userRoutes from "./routes/users";
import morgan from "morgan";
import createHttpError, { isHttpError } from "http-errors"; // we could create our own Http error classes and objects, but we'll use the HTTP errors provided by the http-errors package/dependency/module
import session from "express-session";
import env from "./util/validateEnv";
import MongoStore from "connect-mongo";
import { requiresAuth } from "./middlewares/auth";

// Default exports can be imported with `import <name> from "<module-name>";` syntax, like `import express from "express";`
// Modules can also be imported just for their side effects, without importing any specific values or functions by using the `import "<module-name>";` syntax, like `import "dotenv/config";`

// in app.ts we define our backend's app object, and pass to our app object the endpoints (the paths) and our routes (which also contain sub pathes/endpoints), and the routes call the controllers, which contain the logic that "controls" how responses should behave.

const app = express(); // the app constant is basically our server, this is where we add endpoints and everything

app.use(morgan("dev")); // morgan is a middleware which is a logging library that helps us by logging requests and responses in the console

app.use(express.json()) // we tell express what type of data we want to accept as http message bodies to the server, and we do this by setting up this middleware, basically this tells our server that the requests' Content-Type header we're gonna get will be application/json

app.use(session({ // express-session is yet another middleware we have to register to our express app, but its placing/ordering is important, we want to register them before our endpoint routes, but after we read the json body, so this is the perfect place
    // we call the express-session session() function we imported and then we start curly braces because we want to pass in a configuration (json / javascript object literal)
    secret: env.SESSION_SECRET, // this secret is used to sign the cookie that the user receives on the frontend client, so this is basically their key to identify their own user session. Each session will have its own entry in the database, but in the browser/frontend client it'll also have a cookie with a secret key stored in the client-side within the browser, this secret key should be a random string. As usual we don't want to hardcode sensitive data (like our session secret key) into our code, we want to put them into the .env file which is not part of the VCS and is ignored by git via .gitignore
    resave: false, // We make sure that the session is never saved back to the session store by setting this to false. Also, setting this to true couldcreate race conditions where a client makes two parallel requests to your server and changes made to the session in one request may get overwritten when the other request ends, even if it made no changes (this behavior also depends on what store you're using).
    saveUninitialized: false, // We make sure that a session that is "uninitialized" is NOT saved to the store by setting this to false. A session is uninitialized when it is new but not modified. Choosing false is useful for implementing login sessions, reducing server storage usage, or complying with laws that require permission before setting a cookie. Choosing false will also help with race conditions where a client makes multiple parallel requests without a session.
    cookie: { // we configure the cookie that will be stored on the frontend client-side user's browser
        maxAge: 60 * 60 * 1000, // this is up to you, the age of the cookie can be long-lived because we can easily invalidate the session from the server-side, even if the cookie hasn't expired yet, so we set the cookie maximum age to 1 hour (60*60*1000 ms)
    },
    rolling: true, // setting rolling to true means that as long as the user is using our website, this cookie will be refreshed automatically, in other words if the user clicks on anything in the app that hits an endpoint, the cookie will be refreshed and its maxAge will be reset EVERY TIME, so they can be logged in for far more than a single hour actually if they keep engaging the website.
    store: MongoStore.create({ // if we never pass any store here, the session data will be stored in memory within our server application computer, so it'll work until we have to restart our server and then our sessions will be gone :) this is ok for development, but definitely not for production, but also for development it's good actually store the session data somewhere, so we'll use the mongo store from the connect-mongo package
        mongoUrl: env.MONGO_DB_CONNECTION, // we use the same url that we use for our database connection
    }), 
}));

// it's like a puzzle that we have put together, we have this middleware that catches any requests that go through this endpoint, which then checks the notesRoutes endpoints we have in routes/notes.ts and forwards the api call to the endpoint with the appropriate http verb (get, post, etc), and then our routes internally call the controllers which handle the logic of responses 
app.use("/api/users", userRoutes);
app.use("/api/notes", requiresAuth, notesRoutes); // the order of our middlewares (request handlers / controllers) matters, we first want to check if the user is authenticated BEFORE we call our normal endpoint handlers  
 

// to drive home the concept of middlewares, when we try to access an endpoint that doesn't exist, we get a default error message, but we could return our own error message instead 
// we can do this with a middleware, that captures all requests that go to an endpoint that we didn't set up extra routes for it
// we will place this middleware below our endpoints because this middleware is a fallback for them, but we'll also place it above our error handler middleware, because we still want to forward errors to our error handler
// unlike app.get(), app.post(), http verbs etc, we won't add a slash as the first arg (implying a specific endpoint) and so we aren't passing any endpoints, because we want to use this everywhere where we don't have an endpoint set up for it
// we basically return an error that says "route not found" or "endpoint not found"
app.use((request, response, next) => {
    next(createHttpError(404, "endpoint not found")) // by passing createHttpError (method which returns HttpError instance) to next() with status 404 (resource not found), we're forwarding this to our handler below 
}); //  Each middleware function typically has access to the req (request), res (response), and next (a callback) objects. Calling the next() function inside a middleware tells Express to move on to the next middleware or route handler.

// this is express error handler, express error handler must take these four arguments with these exact types in order to work
// we can reuse this error handler by calling it in every endpoint's catch block while passing the error to the next() function
// all of these app.use() middlewares are checked in the order we define them in, so this app.use() error handler must be declared at the absolute bottom, below the logger middleware, json-only parser middleware, the endpoints middleware, and the invalid endpoint middleware, otherwise this error-handler middleware would be the first one that would kick in; we only want to get to this middlware if we actually have an error 
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

export default app; // in order to use app.ts in our server (to be able to call it and run it), we need to export it, this is a default export, which means we're only exporting one single thing from this file/module which is our express's app where we add all the middlewares 