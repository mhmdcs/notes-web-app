import { InferSchemaType, Schema, model } from 'mongoose';


const userSchema = new Schema({
    username: {type: String, required: true, unique: true}, // unique: true makes sure that we can only ever insert a single user with that username or email address into the database, basically it prevents two users with the same username or email address from signing up 
    email: {type: String, required: true, select: false, unique: true}, 
    password: {type: String, required: true, select: false},
})
// this select: false configuration means that when retrieve a user from the database, the email and password will not be returned to us because they've been execluded from the select query, we have to request them explicitly, this makes sense because when you want to retrieve a user on a public profile, then you really don't want to return the email address and password, even though the password will be hashed, but you really don't want that stuff to be visible to the outside
// and even if you don't show the user data on the frontend, it might still be in the json response you get from the server, so if we just request a user from the database, it'll only contain the username, unless we request the email and password explicitly 

type User = InferSchemaType<typeof userSchema>;

export default model<User>("User", userSchema);