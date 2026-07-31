import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    createContactAssociationSchema,
    deleteContactAssociationSchema,
    updateContactAssociationDataSchema,
    updateContactAssociationTypeSchema,
} from "../validations/contactAssociation.validation.js";
import contactAssociationService from "../services/contactAssociation.service.js";

export const createContactAssociation = asyncHandler(async(req: Request, res: Response) => {
    const validatedData = createContactAssociationSchema.parse({ body: req.body });
    const result = await contactAssociationService.createContactAssociation(validatedData.body, req.user!);
    res.status(201).json({ success: true, message: "contact created successfully", data: result });
});
export const getContactAssociations = asyncHandler(async(req: Request, res: Response) => {
    const listingId = req.params.listingId as string;
    const result = await contactAssociationService.getContactAssociations(listingId, req.user!.brokerId);
    res.status(200).json({ success: true, data: result });
});
export const deleteContactAssociation = asyncHandler(async(req: Request, res: Response) => {
    const validatedData = deleteContactAssociationSchema.parse({ params: req.params });
    const result = await contactAssociationService.deleteContactAssociation(validatedData.params.id, req.user!.brokerId);
    res.status(200).json({ success: true, message: "contact deleted successfully"});
});
export const updateContactAssociationType = asyncHandler(async(req: Request, res: Response) => {
    const validatedData = updateContactAssociationTypeSchema.parse({ body: req.body, params: req.params });
    const result = await contactAssociationService.updateContactAssociationType(
        validatedData.params.id,
        validatedData.body.type
    );
    res.status(200).json({ success: true, message: "contact type updated successfully", data: result });
});

export const updateContactAssociationData = asyncHandler(async(req: Request, res: Response) => {
    const validatedData = updateContactAssociationDataSchema.parse({ body: req.body, params: req.params });
    const result = await contactAssociationService.updateContactAssociationData(
        validatedData.params.id,
        req.user!.brokerId,
        validatedData.body
    );
    res.status(200).json({ success: true, message: "contact details updated successfully", data: result });
});
