// since our mongodb is connected, we have to start putting stuff in there, but mongoose requires us to define a model for the data we want to put in our database
// we need to define the schema here, and the schema defines what kind of data our notes should contain
import { InferSchemaType, model, Schema } from "mongoose";

const noteSchema = new Schema({ // we use curly braces because this is where we put configurations for the schema
    title: { type: String, required: true }, // this is a configuration that defines that each note has to have a title, otherwise mongodb will not accept it
    text: { type: String }, // we won't make text required because we want the note's text to be optional 
}, {
    timestamps: true // instead of creating a createdAt attribute to the db, we can declare a timestamps so that it will automatically add a timestamp field created and updated to the schema, rather than us managing it ourselves  
});


// to ensure type safety and use the full power of typescript, 
// we use the keyword `type` to add another type alias to typescript, i.e. to create another type, so to speak  
type Note = InferSchemaType<typeof noteSchema>;

// so now we export this schema type so that we can use it in our remaining codebase
export default model<Note>("Note", noteSchema); // this will create a collection in our mongo database that's named "Note", but it'll turn it into a plural, so by calling this Note, it'll later create a collection with the name "Notes"  