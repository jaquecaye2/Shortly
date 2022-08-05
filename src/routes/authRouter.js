import { Router } from "express";
import { signIn, signUp } from "../controllers/authController.js";
import validateBody from "../middlewares/validateBodySchema.js";
import signInSchema from "../schemas/signInSchema.js";
import signUpSchema from "../schemas/signUpSchema.js";

const router = Router();

router.post("/signup", validateBody(signUpSchema), signUp);

router.post("/signin", validateBody(signInSchema), signIn);

export default router;
