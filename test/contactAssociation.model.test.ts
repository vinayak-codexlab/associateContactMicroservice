import { describe, expect, it } from "vitest";
import ContactAssociation from "../src/models/contactAssociation.model.js";

describe("contact association model", () => {
    it("defines a unique compound index for listingId, type and hashMobile", () => {
        const indexes = ContactAssociation.schema.indexes();

        const duplicateIndex = indexes.find((index) => {
            const definition = Array.isArray(index) ? index[0] : index;
            const options = Array.isArray(index) ? index[1] : undefined;

            return (
                typeof definition === "object" &&
                definition !== null &&
                "listingId" in definition &&
                "type" in definition &&
                "hashMobile" in definition &&
                options?.unique === true
            );
        });

        expect(duplicateIndex).toBeDefined();
    });
});
