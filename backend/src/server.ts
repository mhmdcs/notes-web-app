import express from "express";
const app = express(); // the app constant is basically our server, this is where we add endpoints and everything
const port = 4242; // port is basically a connection point on the server, some ports are occupied already, we there are port numbers that we use by convention like 5000 or 8000, react for example uses port 3000 by default,  but any random number would work

// this is our first endpoint, the second param is an arrow function (callback)
app.get("/", (request, response) => {
    response.send("hello world!");
});

// this is how we start our server, we pass our port and we pass an empty arrow function (callback) that doesn't take anything,
app.listen(port, () => {
    console.log("server running on port: ", port); // log to check if we actually started the server and there was no crash or anything
}); // then in the command line, to start the file we type `node name_of_the_file.ts` so we'll run `node server.ts`, but because node doesn't understand typescript and only understands javascript this won't work, so we compile (transpile) to javascript via `npx tsc` first then we run `node server.js` to start the server