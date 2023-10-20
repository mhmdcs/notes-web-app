import * as NoteControllers from "../controllers/notes"; // the asterisk says "we want to import all functions from this module and have access to them through the `NoteControllers` alias"
// we could also alternatively replace the above with:
// import { getNotes } from "../controllers/notes"; // but this can get pretty ridiculous because there could be many functions inside the controller directory's note.ts module that we'd have to specify in the curly braces!  
import express from "express";

const router = express.Router(); // this is basically a way to set endpoints on a router, and then later set this router to our express' app to connect it all

// this is our first endpoint, first param is endpoint name, second param is an arrow function (callback), so we're passing the reference of an async arrow function called `getNotes` which resides in /controllers/notes.ts
router.get("/", NoteControllers.getNotes);

// our second endpoint, it'll use the same endpoint as our first endpoint, but no worries! they won't interfere with each other because both are different http verbs (one is get and the other one is post)
router.post("/", NoteControllers.createNote);

router.get("/:noteId", NoteControllers.getNote); // :noteId basically means that it represents a value (a string), :noteId is a URL param, whereas a URL query is a question mark ? in the URL

router.patch("/:noteId", NoteControllers.updateNote);

router.delete("/:noteId", NoteControllers.deleteNote);

export default router;