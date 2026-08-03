import { Router } from "express";
import { Protect } from "../middlewares/authCheck.js";
import {
    createContactAssociation,
    deleteContactAssociation,
    getContactAssociations,
    updateContactAssociationData,
    updateContactAssociationType,
} from "../controllers/contactAssociation.controller.js";

const router = Router();
// const baseRoute = "/v1/contact-association";

// router.post(`${baseRoute}/`, Protect, createContactAssociation);
// router.get(`${baseRoute}/:listingId`, Protect, getContactAssociations);
// router.delete(`${baseRoute}/:id`, Protect, deleteContactAssociation);
// router.patch(`${baseRoute}/:id/type`, Protect, updateContactAssociationType);
// router.put(`${baseRoute}/:id/data`, Protect, updateContactAssociationData);

router.use(Protect);

router.route("/").post(createContactAssociation);
router.route("/:listingId").get(getContactAssociations);
router.route("/:id/type").patch(updateContactAssociationType);
router.route("/:id")
    .delete(deleteContactAssociation)
    .put(updateContactAssociationData);

// router.route("/:id/data").put(updateContactAssociationData)

export default router;
