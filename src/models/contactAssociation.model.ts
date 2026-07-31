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
    type: {type:String, enum:Object.values(ContactType)},
    source: {type:String, enum:Object.values(ContactSource)},
    origin: {type:String, enum:Object.values(ContactOrigin)},
    contactId: {type:String},
    listingId: {type:String},
    brokerId: {type:String},
    firmId: {type:String}
},{
    timestamps:true,
    toJSON: {getters:true},
    toObject: {getters:true},    
});

export default mongoose.model("ContactAssociation", contactAssociationSchema);

