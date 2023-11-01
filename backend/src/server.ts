// server.ts/server.js, usually called index.ts/index.js by default, but we renamed it
// index.js is the index of Node.js, it is the file that runs initially once the Node.js code is executed. It is responsible for your application's startup, routing, and other functions. Other modules, such as Express, Mongoose, Axios, and others, are used in adding functionalities to a Node.
import app from "./app";
import env from "./util/validateEnv"; // because validateEnv only has one default export, we could name `env` anything we want, we could name it `chocolate` even, this would be a diferent case if validateEnv contained different exports because the names would have to be correct. Thanks to the envalid package/dependency, env.port and env.MONGO_DB_CONNECTION are definitely typed, PORT is number and MONGO_DB_CONNECTION is string, which means they're guaranteed not to be undefined 
import mongoose from "mongoose";

const port = env.PORT // port is basically a connection point on the server, some ports are occupied already, while there are port numbers that we use by convention like 5000 or 8000, react for example uses port 3000 by default, but any random number would work

if (!port) { // checking if port is false (i.e. if port is undefined), then we do something
// this is certainly one way to handle accidently passing undefined variables, basically wrap our code in an if condition that checks if port is false (which is equal to checking if port is undefined) and here we would throw an error to crash our server right away, but this is a bit verbose, and kinda terrible code to read, a better way to handle this is to use a package/dependency/module called envalid, which helps us define how our environment variables should look, and enforce a schema so if one env variable is missing, then it actually throws an error and our server won't start 
}

mongoose.connect(env.MONGO_DB_CONNECTION) // because connect() returns a Promise, which is basically an asynchronous operation (an operation that takes time), we can call then() on Promises to define what we want to do after they are succeeded (fulfilled), later we'll use async/await which is syntactic sugar over Promises and then(), but we can't use async/await here on the top level of the file. 
    .then(() => { // this () => {} is an arrow function, which is basically a callback, also known as a lambda, a listener, an anonymous function, etc.
        console.log("mongoose connected")
        // here, after our connection to the database is successful, we should start our server. This is the correct place to start the server, because if the connection to db fails for some reason, we don't want to start the server because it wouldn't work properly without the database!
        // this is how we start our server using express' app, we pass our port and we pass an empty arrow function (callback) that doesn't take anything
        app.listen(port, () => {
            console.log("server running on port: ", port); // log to check if we actually started the server and that there was no crash or anything
        }); // then in the command line, to start this file (and thus start the server) we type `node name_of_the_file.ts` so we'll run `node server.ts`, but because node doesn't understand typescript and only understands javascript this won't work, so we compile (transpile) to javascript via `npx tsc` first then we run `node server.js` to start the server. alternatively, we could add a package.json `"start": "nodemon src/server.ts"` that uses nodemon's package to transpile ts to js for us and then start the server, so we then just type `npm start` in the terminal :)
    })
    .catch(console.error); // catch() is the "opposite" of then() for Promises, then() is called when the promise is successful, and catch() called when the promise fails, we pass console.error here, we don't call console.error() with the parenthesis because we don't want to call/invoke error() and pass whatever value it returns, what we only want to pass is the error function's reference, catch() takes an arrow function `onrejected` that takes any and returns void, so catch() will call this arrow function and then pass the argument that it gets, and this argument that it's gonna get is the error itself. btw, console.error() is like console.log() it's just that it's red text.

// Passing function referneces instaed of invoking functions is a common pattern in JavaScript, and it's a subtle but crucial distinction.
// When you do catch(console.error), you're passing a reference to the console.error function to catch. This means that if the Promise is rejected (i.e. an error occurs), catch will call the console.error function with the error as its argument.
// However, if you do catch(console.error()), you're actually invoking the console.error function right there and then, regardless of whether an error occurred or not. The result of this function call (which is undefined for console.error()) would be passed to catch instead of the function itself. This would not give you the desired behavior.
// So, to put it another way:
// catch(console.error) means "Hey, catch, if there's an error, call this console.error function for me with the error details."
// catch(console.error()) means "Hey, I'm calling console.error right now and giving you whatever it returns (which is undefined), to handle the error." Since console.error() doesn't return a function, this would result in a runtime error when catch tries to invoke its argument.
// The former is the correct usage when you want to pass a function to handle possible future errors.