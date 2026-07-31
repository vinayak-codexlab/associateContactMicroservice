import {z} from "zod";
import { ContactOrigin, ContactSource, ContactType } from "../constants/contactAssociation.js";

const contactSchema = z.object({
    contactName: z.string().min(1,"Contact name lenth is too short !").max(50).trim(),
    contactMobile: z.string().regex(/^[6-9]\d{9}$/, "Invalid mobile number"),
    type: z.nativeEnum(ContactType)
});
export const createContactAssociationSchema = z.object({
    body: z.object({
        contacts: z.array(contactSchema).min(1, "At least one contact is required"),
        source: z.nativeEnum(ContactSource),
        origin: z.nativeEnum(ContactOrigin),
        contactId: z.string().optional(),
        listingId: z.string().min(1)
    }),
});