import {z} from "zod";
import { ContactOrigin, ContactSource, ContactType } from "../constants/contactAssociation.js";
import { normalizedAndValidatePhone } from "../utils/phoneHelper.js";

//hexadecimal-24
const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

const phoneSchema = z
    .string()
    .trim()
    .min(1, "Contact Number is required !")
    .transform((val, ctx)=>{
        const normalized = normalizedAndValidatePhone(val,"IN");
        if(!normalized){
            ctx.addIssue({
                code : z.ZodIssueCode.custom,
                message: "Invalid mobile number format !",
            });
            return z.NEVER;
        }
        return normalized;
    });

const contactSchema = z.object({
    _id: z.string().min(1).optional(),
    id: z.string().min(1).optional(),
    contactName: z.string().min(1,"Contact name lenth is too short !").max(50).trim(),
    // contactMobile: z.string().min(1, "Contact mobile is required").refine(isValidInternationalPhoneNumber, {
    //     message: "Invalid mobile number",
    // }),
    contactMobile: phoneSchema,
    type: z.nativeEnum(ContactType),
    source: z.nativeEnum(ContactSource),
    contactId: objectIdSchema.optional(),
});

export const createContactAssociationSchema = z.object({
    body: z.object({
        // id: z.string().optional(),
        contacts: z.array(contactSchema).min(1, "At least one contact is required"),
        origin: z.nativeEnum(ContactOrigin),
        listingId: objectIdSchema,
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
        // contactMobile: z.string().min(1, "Contact mobile is required").refine(isValidInternationalPhoneNumber, {
        //     message: "Invalid mobile number",
        // }),
        contactMobile: phoneSchema,
        type: z.nativeEnum(ContactType),
        source: z.nativeEnum(ContactSource),
        contactId: z.string().optional()
    })
});
