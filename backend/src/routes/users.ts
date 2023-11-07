import * as UserControllers from "../controllers/users";
import express from "express";
import { requiresAuth } from "../middlewares/auth";

const router = express.Router();

// the order of our middlewares (request handlers / controllers) matters, we first want to check if the user is authenticated BEFORE we call our normal endpoint handlers  
router.get("/", requiresAuth, UserControllers.getAuthenticatedUser); // we use "/" to call this directly via the user endpoint "http//localhost:6000/api/users/"

router.post("/signup", UserControllers.signUp);

router.post("/login", UserControllers.login);

router.post("/logout", UserControllers.logout);

export default router;