import { RequestHandler } from "express";
import UserModel from "../models/user";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";

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
        
        response.status(201).json(newUser);
    } catch (error) {
        next(error);
    }

}