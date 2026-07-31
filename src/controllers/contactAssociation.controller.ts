import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createContactAssociationSchema } from "../validations/contactAssociation.validation.js";
import {
    createContactAssociation as createContactAssociationService,
    getContactAssociations as getContactAssociationsService,
} from "../services/contactAssociation.service.js";

export const createContactAssociation = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = createContactAssociationSchema.parse({ body: req.body });
    const result = await createContactAssociationService(validatedData.body, req.user!);
    res.status(201).json({ success: true, message: "contact created successfully", data: result });
});

export const getContactAssociations = asyncHandler(async (req: Request, res: Response) => {
    const listingId = req.params.listingId as string;
    const result = await getContactAssociationsService(listingId, req.user!.brokerId);
    res.status(200).json({ success: true, data: result });
});