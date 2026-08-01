import ContactAssociation from "../models/contactAssociation.model.js";
import { ContactOrigin, ContactSource, ContactType } from "../constants/contactAssociation.js";
import { ApiError } from "../utils/ApiError.js";

const ContactAssociationModel: any = ContactAssociation;

interface User {
    sub: string;
    firm_id: string;
}

interface CreateContactItem {
    _id?: string | undefined;
    id?: string | undefined;
    contactName: string;
    contactMobile: string;
    type: ContactType;
}

interface CreatePayload {
    contacts: CreateContactItem[];
    source: ContactSource;
    origin: ContactOrigin;
    contactId?: string | undefined;
    listingId: string;
}

class ContactAssociationService {
    private handleError(error: unknown): never {
        if (error instanceof Error) {
            const customError = error as Error & { statusCode?: number };
            customError.statusCode = customError.statusCode || 500;
            customError.message = customError.message || "Internal Server Error";
            throw customError;
        }
        const fallbackError = new Error("Internal Server Error") as Error & { statusCode?: number };
        fallbackError.statusCode = 500;
        throw fallbackError;
    }
    // my all services
    async createContactAssociation(payload: CreatePayload, user: User) {
        try {
            const operations = payload.contacts.map(async (contact) => {
                const associationId = contact._id || contact.id;
                if (associationId) {
                    const existing = await ContactAssociationModel.findOne({ _id: associationId, sub: user.sub });
                    if (!existing) {
                        throw new ApiError(404, "Contact association not found");
                    }
                    const updated = await ContactAssociationModel.findOneAndUpdate(
                        { _id: associationId, sub: user.sub },
                        {
                            contactName: contact.contactName,
                            contactMobile: contact.contactMobile,
                            type: contact.type,
                            source: payload.source,
                        },
                        { new: true, runValidators: true }
                    );
                    return updated ? updated.toObject({ getters: true }) : null;
                }
                const created = await ContactAssociationModel.create({
                    contactName: contact.contactName,
                    contactMobile: contact.contactMobile,
                    type: contact.type,
                    source: payload.source,
                    origin: payload.origin,
                    contactId: payload.contactId,
                    listingId: payload.listingId,
                    sub: user.sub,
                    firm_id: user.firm_id,
                });
                return (created as any).toObject({ getters: true });
            });
            return await Promise.all(operations);
        } catch (err) {
            this.handleError(err);
        }
    }
    async getContactAssociations(listingId: string, sub: string) {
        try {
            const docs = await ContactAssociationModel.find({ listingId, sub }).sort({createdAt:-1}).limit(10);
            return docs.map((doc: any) => doc.toObject({ getters: true }));
        } catch (err) {
            this.handleError(err);
        }
    }
    async deleteContactAssociation(id: string,sub: string) {
        try {
            const existing = await ContactAssociationModel.findOne({ _id: id, sub });
            if (!existing) {
                throw new ApiError(404, "Contact association not found");
            }
            return await ContactAssociationModel.findOneAndDelete({ _id: id, sub });
        } catch (err) {
            this.handleError(err);
        }
    }
    async updateContactAssociationType(id: string,type: string) {
        try {
            const existing = await ContactAssociationModel.findOne({ _id: id });
            if (!existing) {
                throw new ApiError(404, "Contact association not found");
            }
            const updatedDoc = await ContactAssociationModel.findOneAndUpdate(
                { _id: id },
                { type },
                { new: true, runValidators: true }
            );
            return updatedDoc ? updatedDoc.toObject({ getters: true }) : null;
        } catch (err) {
            this.handleError(err);
        }
    }
    async updateContactAssociationData(id: string,sub: string,
        data: { contactName: string; contactMobile: string; type: string; source: string }
    ) {
        try {
            const existing = await ContactAssociationModel.findOne({ _id: id, sub });
            if (!existing) {
                throw new ApiError(404, "Contact association not found");
            }
            const updatedData = await ContactAssociationModel.findOneAndUpdate(
                { _id: id, sub },
                data,
                { new: true, runValidators: true }
            );
            return updatedData ? updatedData.toObject({ getters: true }) : null;
        } catch (err) {
            this.handleError(err);
        }
    }
}

const contactAssociationService = new ContactAssociationService();
export default contactAssociationService;
