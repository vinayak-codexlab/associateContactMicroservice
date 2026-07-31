import ContactAssociation from "../models/contactAssociation.model.js";

interface User {
    brokerId: string;
    firmId: string;
}

export const createContactAssociation = async (payload: any, user: User) => {
    const documents = payload.contacts.map((contact: any) => ({
        contactName: contact.contactName,
        contactMobile: contact.contactMobile,
        type: contact.type,
        source: payload.source,
        origin: payload.origin,
        contactId: payload.contactId,
        listingId: payload.listingId,
        brokerId: user.brokerId,
        firmId: user.firmId,
    }));

    return await ContactAssociation.insertMany(documents);
};

export const getContactAssociations = async (listingId: string, brokerId: string) => {
    return await ContactAssociation.find({listingId,brokerId}).lean();
};
