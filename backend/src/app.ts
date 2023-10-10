import "dotenv/config"; // dotenv/config is imported here because we want to load our environment variables when we start the app without starting our server at server.ts
import express from "express";

// in app.ts we define our backend's endpoints

const app = express(); // the app constant is basically our server, this is where we add endpoints and everything

// this is our first endpoint, the second param is an arrow function (callback)
app.get("/", (request, response) => {
    response.send("hello world"); 
});

export default app; // in order to use app.ts in our server, to call it and run it, we need to export it, this is a default export, which means we're only exporting one single thing from this file which is our express's app where we add all the endpoints 