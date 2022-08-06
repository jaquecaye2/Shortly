import { Router } from "express";
import { transformUrl, searchUrl, openUrl, deleteUrl, showMyUrls, showRanking} from "../controllers/urlsController.js";
import validateBody from "../middlewares/validateBodySchema.js";
import validateUser from "../middlewares/validateUser.js";
import urlSchema from "../schemas/urlSchema.js";

const router = Router();

router.post("/urls/shorten", validateUser, validateBody(urlSchema), transformUrl);

router.get("/urls/:id", searchUrl);

router.get("/urls/open/:shortUrl", openUrl);

router.delete("/urls/:id", validateUser, deleteUrl);

router.get("/users/me", validateUser, showMyUrls)

router.get("/ranking", showRanking)

export default router;
