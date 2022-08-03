import { Router } from "express";
import { signIn, signUp, teste, teste2 } from "../controllers/authController.js";
import validateBody from "../middlewares/validateBodySchema.js";
import signInSchema from "../schemas/signInSchema.js";
import signUpSchema from "../schemas/signUpSchema.js";

const router = Router();

router.post("/signup", validateBody(signUpSchema), signUp);

router.post("/signin", validateBody(signInSchema), signIn);

router.get("/signup", teste)

router.get("/signin", teste2)

export default router;
