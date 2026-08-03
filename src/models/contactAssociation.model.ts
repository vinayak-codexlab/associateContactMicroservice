import mongoose, {Schema} from "mongoose";
import { ContactOrigin, ContactSource, ContactType } from "../constants/contactAssociation.js";
import { encryptContact, decryptContact } from "../utils/phoneHelper.js";

const contactAssociationSchema = new Schema({
    contactName: {type:String, trim:true},
    contactMobile: {
        type:String,
        set(v : string){ return encryptContact(v)},
        get(v : string){return decryptContact(v)}
    },
    hashMobile:{type:String},
    type: {type:String, enum:Object.values(ContactType)},
    contactId: {type:String},
    source: {type:String, enum:Object.values(ContactSource)},
    origin: {type:String, enum:Object.values(ContactOrigin)},
    listingId: {type:String},
    sub: {type:String},  //sub is the brokerId here 
    firm_id: {type:String}
},{
    timestamps:true,
    toJSON: {getters:true},
    toObject: {getters:true},    
});

contactAssociationSchema.index({ listingId: 1, type: 1, hashMobile: 1 }, { unique: true, sparse: true });

export default mongoose.model("ContactAssociation", contactAssociationSchema);

