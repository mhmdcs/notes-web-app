import * as UserControllers from "../controllers/users";
import express from "express";

const router = express.Router();

router.get("/", UserControllers.getAuthenticatedUser); // we use "/" to call this directly via the user endpoint "http//localhost:6000/api/users/"

router.post("/signup", UserControllers.signUp);

router.post("/login", UserControllers.login);

router.post("/logout", UserControllers.logout);

export default router;