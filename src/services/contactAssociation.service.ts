import ContactAssociation from "../models/contactAssociation.model.js";
import { ContactOrigin, ContactSource, ContactType } from "../constants/contactAssociation.js";
import { ApiError } from "../utils/ApiError.js";
import { hashMobile } from "../utils/phoneHelper.js";
import { deleteCache, getCache, setCache } from "../utils/redisHelper.js";

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
    contactId?: string | undefined;
    source: ContactSource;
}

interface CreatePayload {
    contacts: CreateContactItem[];
    origin: ContactOrigin;
    listingId: string;
}
interface UpdateContactAssociationData {
    contactName: string;
    contactMobile: string;
    type: ContactType;
    source: ContactSource;
    contactId?: string | undefined;
}

class ContactAssociationService {
    private getListingCacheKey(listingId: string, sub: string) {
        return `contact-associations:${sub}:${listingId}`;
    }

    private async invalidateListingCache(listingId?: string, sub?: string) {
        if (!listingId || !sub) {
            return;
        }

        await deleteCache(this.getListingCacheKey(listingId, sub));
    }

    private handleError(error: unknown): never {
        if (error instanceof ApiError) {
            throw error;
        }

        if (error instanceof Error) {
            const customError = error as Error & { statusCode?: number; code?: number };
            if (customError.code === 11000) {
                throw new ApiError(409, "This mobile already exists for this listingId and type !");
            }
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
                const hashedMobile = await hashMobile(contact.contactMobile);
                const duplicateQuery: any = {
                    listingId: payload.listingId,
                    type: contact.type,
                    hashMobile: hashedMobile,
                    $or: [{ sub: user.sub }, { sub: { $exists: false } }],
                };
                if (associationId) {
                    duplicateQuery._id = { $ne: associationId };
                }
                const existingMobile = await ContactAssociationModel.findOne(duplicateQuery);
                if (existingMobile) {
                    throw new ApiError(409, "This mobile already exists for this listingId and type !");
                }
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
                            hashMobile: hashedMobile,
                            type: contact.type,
                            source: contact.source,
                            contactId: contact.contactId,
                        },
                        { new: true, runValidators: true }
                    );
                    return updated ? updated.toObject({ getters: true }) : null;
                }
                const created = await ContactAssociationModel.create({
                    contactName: contact.contactName,
                    contactMobile: contact.contactMobile,
                    hashMobile: hashedMobile,
                    type: contact.type,
                    contactId: contact.contactId,
                    source: contact.source,
                    origin: payload.origin,
                    listingId: payload.listingId,
                    sub: user.sub,
                    firm_id: user.firm_id,
                });
                return (created as any).toObject({ getters: true });
            });

            try {
                return await Promise.all(operations);
            } finally {
                await this.invalidateListingCache(payload.listingId, user.sub);
            }
        } catch (err) {
            this.handleError(err);
        }
    }
    async getContactAssociations(listingId: string, sub: string) {
        try {
            const cacheKey = this.getListingCacheKey(listingId, sub);
            const cached = await getCache<any[]>(cacheKey);

            if (cached) {
                return cached;
            }

            const docs = await ContactAssociationModel.find({ listingId, sub }).select('-hashMobile').sort({createdAt:-1}).limit(10);
            const result = docs.map((doc: any) => doc.toObject({ getters: true }));

            await setCache(cacheKey, result);

            return result;
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

            const deleted = await ContactAssociationModel.findOneAndDelete({ _id: id, sub });
            await this.invalidateListingCache(existing.listingId, sub);

            return deleted;
        } catch (err) {
            this.handleError(err);
        }
    }
    async updateContactAssociationType(id: string,sub:string, type: ContactType) {
        try {
            const existing = await ContactAssociationModel.findOne({ _id: id, sub });
            if (!existing) {
                throw new ApiError(404, "Contact association not found");
            }
            const updatedDoc = await ContactAssociationModel.findOneAndUpdate(
                { _id: id, sub },
                { type },
                { new: true, runValidators: true }
            );

            await this.invalidateListingCache(existing.listingId, existing.sub);

            return updatedDoc ? updatedDoc.toObject({ getters: true }) : null;
        } catch (err) {
            this.handleError(err);
        }
    }
    async updateContactAssociationData(id: string,sub: string,
        // data: { contactName: string; contactMobile: string; type: ContactType; source: ContactSource; contactId?: string; }
        data: UpdateContactAssociationData
    ) {
        try {
            const existing = await ContactAssociationModel.findOne({ _id: id, sub });
            if (!existing) {
                throw new ApiError(404, "Contact association not found");
            }
            const hashedMobile = await hashMobile(data.contactMobile);
            const existingMobile = await ContactAssociationModel.findOne({
                listingId: existing.listingId,
                type: data.type,
                hashMobile: hashedMobile,
                _id: { $ne: id },
                $or: [{ sub }, { sub: { $exists: false } }],
            });
            if (existingMobile) {
                throw new ApiError(409, "This mobile already exists for this listingId and type !");
            }
            const updatedData = await ContactAssociationModel.findOneAndUpdate(
                { _id: id, sub },
                {...data, hashMobile:hashedMobile},
                { new: true, runValidators: true }
            );

            await this.invalidateListingCache(existing.listingId, sub);

            return updatedData ? updatedData.toObject({ getters: true }) : null;
        } catch (err) {
            this.handleError(err);
        }
    }
}

const contactAssociationService = new ContactAssociationService();
export default contactAssociationService;
