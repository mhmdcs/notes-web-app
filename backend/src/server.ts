import app from "./app";
import env from "./util/validateEnv"; // because validateEnv only has one default export, we could name `env` anything we want, we could name it `chocolate` even, this would be a diferent case if validateEnv contained different exports. anyway, now env.port and env.MONGO_DB_CONNECTION are definitely typed, PORT is number and MONGO_DB_CONNECTION is string, which means they're garuenteed to not be undefined 
import mongoose from "mongoose";

const port = env.PORT // port is basically a connection point on the server, some ports are occupied already, we there are port numbers that we use by convention like 5000 or 8000, react for example uses port 3000 by default,  but any random number would work

if (!port) { // checking if port is false (i.e. if port is undefined), then we do something
// one way to handle accidently passing undefined variables is to wrap our code in if condition that checks if port is false (which is equal to checking if port is undefined) and here we would throw an error to crash our server right away, but this is a bit verbose and kinda terrible code to read, a better way to handle this is to use a package/dependency/module called envalid, which helps us define how our environment variable should look, and enforce this schema so if one is missing it actually throws an error and our server won't start 
}

mongoose.connect(env.MONGO_DB_CONNECTION) // because connect() returns a Promise, which is basically an asynchronous operation (an operation that takes time), and we can call then() on Promises to define what we want to do after they are succeeded, later we'll use async/await which is syntactic sugar over Promises and then(), but we can't use async/await here on the top level of the file. 
    .then(() => {
        console.log("mongoose connected")
        // here, after our connection to the database is successful, we should start our server, because if the connection to db fails for some reason, we don't want to start the server because it wouldn't work properly without the database!

        // this is how we start our server, we pass our port and we pass an empty arrow function (callback) that doesn't take anything,
        app.listen(port, () => {
            console.log("server running on port: ", port); // log to check if we actually started the server and there was no crash or anything
        }); // then in the command line, to start the file we type `node name_of_the_file.ts` so we'll run `node server.ts`, but because node doesn't understand typescript and only understands javascript this won't work, so we compile (transpile) to javascript via `npx tsc` first then we run `node server.js` to start the server
    })
    .catch(console.error); // catch() is the "opposite" of then() for Promises, then() is called when the promise is successful and catch() called when the promise fails, we pass console.error here, we don't call console.error() with the parenthesis because we don't want to call/invoke error(), we only want to pass its reference, catch() takes an arrow function onrejected that takes any and returns void, so catch() will call this arrow function and then pass the argument that it gets, and this argument that it's gonna get is the error itself. console.error() is like console.log() it's just that it's red text.

