import { beforeEach, describe, expect, it, vi } from "vitest";

const redisMock = vi.hoisted(() => ({
    getCache: vi.fn(),
    setCache: vi.fn(),
    deleteCache: vi.fn(),
}));

const modelMock = vi.hoisted(() => ({
    find: vi.fn(),
}));

vi.mock("../src/utils/redisHelper.js", () => redisMock);
vi.mock("../src/models/contactAssociation.model.js", () => ({
    default: modelMock,
}));

import contactAssociationService from "../src/services/contactAssociation.service.js";

describe("contact association service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns contact associations ordered by owner, contact_person, then tenant", async () => {
        redisMock.getCache.mockResolvedValueOnce(null);

        const docs = [
            { toObject: vi.fn(() => ({ _id: "previous-tenant-1", type: "previous_tenant" })) },
            { toObject: vi.fn(() => ({ _id: "tenant-1", type: "tenant" })) },
            { toObject: vi.fn(() => ({ _id: "owner-1", type: "owner" })) },
            { toObject: vi.fn(() => ({ _id: "contact-1", type: "contact_person" })) },
        ];

        const queryChain = {
            select: vi.fn().mockReturnThis(),
            sort: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue(docs),
        };

        modelMock.find.mockReturnValueOnce(queryChain);

        const result = await contactAssociationService.getContactAssociations("listing-123", "broker-123");

        expect(result.map((item) => item.type)).toEqual([
            "owner",
            "contact_person",
            "tenant",
            "previous_tenant",
        ]);
        expect(redisMock.setCache).toHaveBeenCalledWith("contact-associations:broker-123:listing-123", result);
    });
});
