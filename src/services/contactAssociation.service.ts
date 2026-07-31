import ContactAssociation from "../models/contactAssociation.model.js";

interface User {
    sub: string;
    firm_id: string;
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

    async createContactAssociation(payload: any, user: User) {
        try {
            const documents = payload.contacts.map((contact: any) => ({
                contactName: contact.contactName,
                contactMobile: contact.contactMobile,
                type: contact.type,
                source: payload.source,
                origin: payload.origin,
                contactId: payload.contactId,
                listingId: payload.listingId,
                sub: user.sub,
                firm_id: user.firm_id,
            }));

            return await ContactAssociation.insertMany(documents);
        } catch (err) {
            this.handleError(err);
        }
    }
    async getContactAssociations(listingId: string, sub: string) {
        try {
            const docs = await ContactAssociation.find({ listingId, sub });
            return docs.map((doc) => doc.toObject({ getters: true }));
        } catch (err) {
            this.handleError(err);
        }
    }
    async deleteContactAssociation(id: string,sub: string) {
        try {
            return await ContactAssociation.findOneAndDelete({ _id: id, sub });
        } catch (err) {
            this.handleError(err);
        }
    }
    async updateContactAssociationType(id: string,type: string) {
        try {
            const updatedDoc = await ContactAssociation.findOneAndUpdate(
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
            const updatedData = await ContactAssociation.findOneAndUpdate(
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
