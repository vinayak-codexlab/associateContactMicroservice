import { Router } from "express";
import { Protect } from "../middlewares/authCheck.js";
import {
    createContactAssociation,
    getContactAssociations
} from "../controllers/contactAssociation.controller.js";

const router = Router();
const baseRoute = "/v1/contact-association";

router.post(`${baseRoute}/`, Protect, createContactAssociation);
router.get(`${baseRoute}/:listingId`, Protect, getContactAssociations);

export default router;