import * as UserControllers from "../controllers/users";
import express from "express";

const router = express.Router();

router.post("/signup", UserControllers.signUp);

export default router;