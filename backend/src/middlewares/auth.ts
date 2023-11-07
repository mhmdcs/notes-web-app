

// instead of repeating code that handles unauthenticated requests at every endpoint, we will instead create our own middleware that handles unauthenticated requests and forwards them appropraitely, a middleware is just like any other controller, it's just an object of type RequestHandler

import { RequestHandler } from "express";
import createHttpError from "http-errors";

export const requiresAuth: RequestHandler = (request, response, next) => {
    // if there's a user currently logged in, then request.session.userId will have the id of the user, and if there is no user logged in, this will return undefined and thus we'll know that there is no active login session right now
    // request.session could either return undefined because we didn't receive a cookie with a session that contains a userId, or because the express-session middlewar we set up in app.ts hit/queried the database to check if a session with this userId exists, but the session has either been deleted manually in the database or automatically deleted because it was expired, and thus it doesn't exist in the database and the express-session middleware returns undefined for us 
    if (request.session.userId) {
        next(); // next() without any errors will simply just calls the next middleware, so it forwards the request and the response objects to the next middleware in the route, which will then be the endpoint itself 
    } else {
        throw createHttpError(401, "User not authenticated"); // next() in the case of an error (be it in a try-catch block or an if-else statement), will forward the request and response objects to the next middleware that handles errors
    }
};