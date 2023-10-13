import { cleanEnv } from "envalid"; 
import { port, str } from "envalid/dist/validators"; 
// we use curly braces to import because it depends on how this cleanEnv is exported inside this package, in simple terms, sometimes there's a single default export (like when we imported mongoose and express), 
// and sometimes there are multiple things that exported from a module, like in this where we can list them in curly braces {} and seprate them by commas, we will see an example of this right now because we will do a default export ourselves, because from this file we want to export one single thing which is the sanitized version of our environment variables

// we want to export the same cleanEnv that we imported in this file, keep in mind that we don't export cleanEnv function reference, we're actually calling it cleanEnv() so we're actually exporting its return value actually 
export default cleanEnv(process.env, { // this actually a json object that we pass in this curly braces, more accurately this is a JavaScript/TypeScript "object literal" but it's also technically the JSON format
    MONGO_DB_CONNECTION: str(), // this basically says that MONGO_DB_CONNECTION should be of type string
    PORT: port() // this basically says that PORT should be of type port, we could also use type number or type string, but type port is better because it probably internally checks for the type's validity (no chars, not exceeding port length, etc)
}); // and since we export this cleanEnv call here, we can import it in another file, and this will give us our cleaned up & sanitized environment variables. 
