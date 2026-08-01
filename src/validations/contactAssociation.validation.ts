import {z} from "zod";
import { ContactOrigin, ContactSource, ContactType } from "../constants/contactAssociation.js";

const contactSchema = z.object({
    _id: z.string().min(1).optional(),
    id: z.string().min(1).optional(),
    contactName: z.string().min(1,"Contact name lenth is too short !").max(50).trim(),
    contactMobile: z.string().regex(/^[6-9]\d{9}$/, "Invalid mobile number"),
    type: z.nativeEnum(ContactType)
});

export const createContactAssociationSchema = z.object({
    body: z.object({
        // id: z.string().optional(),
        contacts: z.array(contactSchema).min(1, "At least one contact is required"),
        source: z.nativeEnum(ContactSource),
        origin: z.nativeEnum(ContactOrigin),
        contactId: z.string().optional(),
        listingId: z.string().min(1)
    }),
});

export const deleteContactAssociationSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Contact id is required")
    })
});

export const updateContactAssociationTypeSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Contact id is required")
    }),
    body: z.object({
        type: z.nativeEnum(ContactType)
    })
});

export const updateContactAssociationDataSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Contact id is required")
    }),
    body: z.object({
        contactName: z.string().min(1, "Contact name length is too short!").max(50).trim(),
        contactMobile: z.string().regex(/^[6-9]\d{9}$/, "Invalid mobile number"),
        type: z.nativeEnum(ContactType),
        source: z.nativeEnum(ContactSource)
    })
});
