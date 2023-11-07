import { RequestHandler } from "express";
import UserModel from "../models/user";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";

// an endpoint where we can retreive the user data of the currently logged in user, when a session is expired or deleted, this endpoint will return not authorized
// this endpoint must/should be called the moment our frontend web app client is started, to check if there's a valid session so that we retreive the user data, and if the session is invalid, we don't return user data
// because we don't want the user to login EVERY TIME they open the website even though they've already logged in moments ago.
export const getAuthenticatedUser: RequestHandler = async (request, response, next) => {
    const authenticatedUserId = request.session.userId; // if there's a user currently logged in, then this will have the id of the user, and if there is no user logged in, this will return undefined and thus we'll know that there is no active login session right now
    // request.session could either return undefined because we didn't receive a cookie with a session that contains a userId, or because the express-session middlewar we set up in app.ts hit/queried the database to check if a session with this userId exists, but the session has either been deleted manually in the database or automatically deleted because it was expired, and thus it doesn't exist in the database and the express-session middleware returns undefined for us 
    try {
        // if there IS an authenticatedUserId (i.e. there is a session with a user id), we can return the user data
        const user = await UserModel.findById(authenticatedUserId).select("+email").exec(); // we can query the user data using findById() thanks to us storing the userId within the session in our sign up/login endpoints :) also, we don't need to return the password here because the user/frontend doesn't really need this data right now, we'll just return the username and email to show it in the user profile for example to give visual feedback to the user on what account they signed in with

        response.status(200).json(user);

    } catch(error) {
        next(error);
    }
};

interface CreateUserBody {
    username?: string,
    email?: string,
    password?: string,
}

export const signUp: RequestHandler<unknown, unknown, CreateUserBody, unknown> = async (request, response, next) => {
    const username = request.body.username;
    const email = request.body.email;
    const rawPassword = request.body.password; // for security reasons, you should never store passwords in plain-text in your database, we need to hash them first, and to make sure we don't accidentally save this raw password in our database, we name it rawPassword, so this makes it very explicit and less likely that we use instead of the hashedPassword

    try {

        if (!username || !email || !rawPassword) { // as usual, we do some input validation so that we get proper error messages instad of relying on the crypted error messages from the database
            throw createHttpError(400, "missing user data"); // we throw 400 for bad request
        }

        // we also wanna keep the usernames and emails unique, so that no two users with the same username or email address can sign up, we could skip these checks since our schema already enforces uniqueness on these fields, but we'll still handle them ourselves here because we want to throw our own errors instead of relying on mongoose default errors because we want to have better error messages and better status codes
        // findOne() returns us one single document if the filter fits (in noSQL no-relational dbs, document = row (record), collection = table, fields = columns)
        const existingUserName = await UserModel.findOne({ username: username }).exec();

        if (existingUserName) {
           throw createHttpError(409, "username already exists. Please choose a different one or login instead."); // 409 for conflict
        }

        const existingEmail = await UserModel.findOne({email: email}).exec();

        if (existingEmail) {
            throw createHttpError(409, "email already exists. Please choose a different one or login instead");
        }

        // we don't want to save the raw password to the database, because even if the database is locked with a password, there can always be something bad happening like an attack or a breach or a leak to the database, you don't want to risk leaking the raw passwords of all your users unless you don't care about your reputation
        // we will use a process called "hashing", which will turn this raw password into an unreadable string of chars, it makes it so that even if the database leaks, then no one can really do anything with the password because they're all gibberish. There's a very popular package/dependency we can use for that and it's called bcrypt.
        const hashedPassword = await bcrypt.hash(rawPassword, 10); // first arg is the raw password value, second arg is the salt value, salting is another security mechanism to make it harder to reverse-engineer these hashed passwords, because there's actually a way to figure out a real password from a hashed one through something called "rainbow tables", and salting is a security mechanism that makes this impossible basically 
        // we use a static salt in this demo app, but in prod, you must save each user's random salt value in the user's collection/table

        const newUser = await UserModel.create({
            username: username,
            email: email,
            password: hashedPassword,
        });

        // when a user signs up (creates an account) successfully, before we return a response, we want to establish a session, and this is really easy thanks to the express-session and connect-mongo packages we installed
        // we take our request object which will now have the session propety request.session thanks to the express-session package we installed, and within it we can store state/data/information, we want to store the id of the user that just signed up, because this way we can identify a user
        // in raw javascript just writing `request.session.userId = newUser._id` would've been enough, but because we're using typescript it'll complain and yell that it doesn't recongize the userId property on the session object.
        // this will require a bit of configuration, we create a @types directory in our backend directory outside the src directory, we put in that directory .d.ts files that contain our own type definitions that we sometimes need (like now for session.userId), and must not forget to use the express-session middleware in app.ts too.
        request.session.userId = newUser._id
        
        response.status(201).json(newUser);
    } catch (error) {
        next(error);
    }

}

// there are basically two popular ways to keep a user logged in, either using sessions or using JWT tokens, JWT is used in a lot of tutorials and real-life projects, but they are "hard to use" for beginners because JWT tokens are self-contained, which means that once a user has one, they can *always* login, there's no way to invalidate an existing JWT.
// invalidating a session after a user signs in is important, for example when they want to change their password, then they should be logged out in all the other places (local machines) they've logged in before, because maybe their password has been compromised, this is a problem that these self-contained tokens like JWT bring
// and the usual way to handle this is to keep these JWT tokens very short-lived, usually 30 minutes or 1 hour, and then they have to be refreshed before they can be used again, this way when a user changes the password, the user can only remain logged in elsewhere for the rest of that hour until the JWT token expires, but then you'll also have to implement a refresher mechanism on both the backend and frontend, which can be quite complicated
// or another way to handle this is to keep the JWT token long lived, but implement some information by storing JWT state in your database, some kind of blacklist where you enter JWT tokens that have been expired, but then you'd be basically just rebuilding what sessions are in a sub-optimal way.
// but what you must NEVER do is giving a user JWT token that lives for like a week or a month, because then you'd have no power to invalidate it, that's a security issue. If you have your own server that can store data and state, then it's preferred to just use sessions instead, because they're much easier to use and be reasoned with.

// a session works so that a user has some kind of a key stored in a cookie, and there's a corresponding entry on your own database on your server for each session, and then when you need to invalidate a session for a particular user, then it's just a matter of deleting this database entry and that's it, these session cookies are not self-contained, as opposed to JWT tokens.
// we'll be using the package/dependency/module express-session here, we install it via npm i express-session, and install its TypeScript types via npm i -D @types/express-session, and because our session state needs to be stored somewhere, and ther eare different database adapters that could be used for that, we'll use connect-mongo via npm install connect-mongo,
// but in a real project you should store your session state (session inforamtion) in something like redis (via npm i connect-redis), because our mongodb database is a remote database, it's not actually on our server (local machine) directly, it resides on the cloud on Atlas's computer/server/machine, this means that it takes a moment (milliseconds, sometimes even a second!) to store this information/state in the database
// if you want something that's *really* fast you should install and use redis database on your own server instead, redis is fast because it's a key-value database that resides in memory (RAM) of your server computer machine, but setting up redis for development is complicated and is outside the scope of this demo project, so for the ease of this demo project we'll store our session state in mongodb via connect-mongo.


interface LoginBody {
    username?: string,
    password?: string,
} // we don't want to add an email to the request body because we're not creating an account, we're just logging in an already existing user.

export const login:  RequestHandler<unknown, unknown, LoginBody, unknown> = async (request, response, next) => {
    const username = request.body.username;
    const rawPassword = request.body.password;
    
    try {

        if (!username || !rawPassword) {
            throw createHttpError(400, "Missing parameters");
        }

        // before we check if the sent password matches the locally persisted (saved) password, we first check if there's actually a user with these credentials; with this username
        // since the user is signing in, we want to send them their data, including their own email address, and remember that we set SELECT to false for the email (and password) database user select query, so they will not be included when we call findOne(), but we can include them explicitly by adding .select() and using + to include specific fields in this find/select command
        const user = await UserModel.findOne({username: username}).select(("+password +email")).exec();

        if (!user) {
            throw createHttpError(401, "Invalid credentials"); // 401 unauthorized, we could've used a more detailed error mesage like "This user does not exist", but we keep it generic on purpose for security reasons; don't tell whoever is trying to login that this user doesn't exist because it makes brute force attempts easier, this way when the user tries to type in a username that doesn't exist, they don't actually know if the user doesn't exist or if the password is just wrong 
        }

        // now we can compare the passwords using bcrypt's compare(), we pass in the raw password from the request and the hashed password from the database, even though one is raw and one is hashed, bcrypt knows how to compare the two and tells us whether they match or not, this is the beauty of abstraction and having libraries hide all the complexities from you.
        const passwordMatch = await bcrypt.compare(rawPassword, user.password);

        if (!passwordMatch) {
            throw createHttpError(401, "Invalid credentials");
        }

        // if our code reached this line, it means everything went well, we got the proper request parameters, the user exists, and the password is correct, now we can establish a session
        request.session.userId = user._id;

        response.status(201).json(user); // return the user json to the frontend 

    } catch (error) {
        next(error);
    }
};


export const logout: RequestHandler = async (request, response, next) => {
    // we have a built-in destroy function that deletes the user's session from the session store (mongodb)
    // destroy() is an asynchronous function (a function that returns immediately but it takes time in the background to do its job)
    // but unfortunately it's not not an async function; it's not declared with the `async` keyword and thus it does not return a Promise
    // so we cannot await on it, we'll have to do some good 'ol callback nesting instead :)
    request.session.destroy(error => { // destroy() attemps to destroy the session and gives us a callback with an error to check if something has gone wrong or not, if an error exists then something went wrong, if it doesn't exist then it's all good
        if (error) {
            next(error);
        } else {
            response.sendStatus(200); 
        }
    });
};