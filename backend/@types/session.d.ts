// we create a @types directory in our backend directory outside the src directory, we put in that directory .d.ts files that contain our own type definitions that we sometimes need (like now for session.userId), and must not forget to use the express-session middleware in app.ts too.
// these .d.ts files are our type definition files (the d stands for definitions), which help typescript recognize that variables are of certain types
// whenever we install @types/some-package-name through npm, it installs .d.ts type definition files for them inside the node_modules directoy

// we import mongoose because we want to use the ObjectId type which is a mongoose type
import mongoose from "mongoose";

declare module "express-session" { // we declare the express-session module, we use the same module name of the package we want to add a new type to
    interface SessionData { // we call the interface type SessionData and we have to use this exact name because this is what the type SessionData in express-session is named
        userId: mongoose.Types.ObjectId; // we declare the moongoose ObjectId as the type of a newly created property named userId within express-session's SessionData
    }
} 

// we will also need to make a change to our tsconfig.json file as well to make typescript's compiler aware of our new type