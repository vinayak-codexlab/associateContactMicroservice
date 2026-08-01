import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../src/utils/ApiError.js";

const serviceMock = vi.hoisted(() => ({
    createContactAssociation: vi.fn(),
    getContactAssociations: vi.fn(),
    deleteContactAssociation: vi.fn(),
    updateContactAssociationType: vi.fn(),
    updateContactAssociationData: vi.fn(),
}));

vi.mock("../src/services/contactAssociation.service.js", () => ({
    default: serviceMock,
}));

import app from "../src/app.js";

const baseUrl = "/v1/user/listing";
const user = { sub: "broker-123", firm_id: "firm-456" };

const authCookie = () =>
    `accessToken=${jwt.sign(user, process.env.JWT_SECRET as string)}`;

const createPayload = {
    contacts: [
        { contactName: "Ada Lovelace", contactMobile: "9876543210", type: "owner" },
    ],
    source: "manual",
    origin: "app",
    contactId: "contact-123",
    listingId: "listing-123",
};

describe("contact association endpoints", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("rejects requests that do not include an access-token cookie", async () => {
        const response = await request(app).get(`${baseUrl}/listing-123`);

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ success: false, message: "Authentication Failed !" });
        expect(serviceMock.getContactAssociations).not.toHaveBeenCalled();
    });

    it("accepts bearer tokens from Swagger UI authorization", async () => {
        const contacts = [{ _id: "association-123", listingId: "listing-123" }];
        serviceMock.getContactAssociations.mockResolvedValue(contacts);

        const response = await request(app)
            .get(`${baseUrl}/listing-123`)
            .set("Authorization", `Bearer ${jwt.sign(user, process.env.JWT_SECRET as string)}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ success: true, data: contacts });
    });

    it("serves swagger documentation for the contact-association endpoints", async () => {
        const response = await request(app).get("/api-docs.json");

        expect(response.status).toBe(200);
        expect(response.body.openapi).toBe("3.0.3");
        expect(response.body.paths).toHaveProperty("/v1/user/listing/");
        expect(response.body.paths).toHaveProperty("/v1/user/listing/{listingId}");
    });

    it("serves the interactive swagger ui page", async () => {
        const response = await request(app).get("/api-docs/");

        expect(response.status).toBe(200);
        expect(response.text).toContain("Swagger UI");
        expect(response.text).toContain("swagger-ui-bundle.js");
    });

    it("POST / creates contact associations for the authenticated broker", async () => {
        const createdContacts = [{ _id: "association-123", ...createPayload.contacts[0] }];
        serviceMock.createContactAssociation.mockResolvedValue(createdContacts);

        const response = await request(app)
            .post(`${baseUrl}/`)
            .set("Cookie", authCookie())
            .send(createPayload);

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            success: true,
            message: "contact created successfully",
            data: createdContacts,
        });
        expect(serviceMock.createContactAssociation).toHaveBeenCalledWith(
            createPayload,
            expect.objectContaining(user),
        );
    });

    it("returns a conflict when a duplicate contact is submitted for the same listing and type", async () => {
        serviceMock.createContactAssociation.mockRejectedValueOnce(
            new ApiError(409, "This mobile already exists for this listingId and type !"),
        );

        const response = await request(app)
            .post(`${baseUrl}/`)
            .set("Cookie", authCookie())
            .send(createPayload);

        expect(response.status).toBe(409);
        expect(response.body).toEqual({
            success: false,
            message: "This mobile already exists for this listingId and type !",
        });
    });

    it("GET /:listingId returns the authenticated broker's contacts", async () => {
        const contacts = [{ _id: "association-123", listingId: "listing-123" }];
        serviceMock.getContactAssociations.mockResolvedValue(contacts);

        const response = await request(app)
            .get(`${baseUrl}/listing-123`)
            .set("Cookie", authCookie());

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ success: true, data: contacts });
        expect(serviceMock.getContactAssociations).toHaveBeenCalledWith("listing-123", user.sub);
    });

    it("DELETE /:id deletes an association owned by the authenticated broker", async () => {
        serviceMock.deleteContactAssociation.mockResolvedValue({ _id: "association-123" });

        const response = await request(app)
            .delete(`${baseUrl}/association-123`)
            .set("Cookie", authCookie());

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ success: true, message: "contact deleted successfully" });
        expect(serviceMock.deleteContactAssociation).toHaveBeenCalledWith("association-123", user.sub);
    });

    it("PATCH /:id/type changes the contact type", async () => {
        const updatedContact = { _id: "association-123", type: "tenant" };
        serviceMock.updateContactAssociationType.mockResolvedValue(updatedContact);

        const response = await request(app)
            .patch(`${baseUrl}/association-123/type`)
            .set("Cookie", authCookie())
            .send({ type: "tenant" });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            message: "contact type updated successfully",
            data: updatedContact,
        });
        expect(serviceMock.updateContactAssociationType).toHaveBeenCalledWith("association-123", "tenant");
    });

    it("returns a conflict when updating a contact would duplicate an existing listing/type/mobile", async () => {
        const updatePayload = {
            contactName: "Grace Hopper",
            contactMobile: "9123456789",
            type: "contact_person",
            source: "import",
        };
        serviceMock.updateContactAssociationData.mockRejectedValueOnce(
            new ApiError(409, "This mobile already exists for this listingId and type !"),
        );

        const response = await request(app)
            .put(`${baseUrl}/association-123/data`)
            .set("Cookie", authCookie())
            .send(updatePayload);

        expect(response.status).toBe(409);
        expect(response.body).toEqual({
            success: false,
            message: "This mobile already exists for this listingId and type !",
        });
    });

    it("PUT /:id/data updates contact details for the authenticated broker", async () => {
        const updatePayload = {
            contactName: "Grace Hopper",
            contactMobile: "9123456789",
            type: "contact_person",
            source: "import",
        };
        const updatedContact = { _id: "association-123", ...updatePayload };
        serviceMock.updateContactAssociationData.mockResolvedValue(updatedContact);

        const response = await request(app)
            .put(`${baseUrl}/association-123/data`)
            .set("Cookie", authCookie())
            .send(updatePayload);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            message: "contact details updated successfully",
            data: updatedContact,
        });
        expect(serviceMock.updateContactAssociationData).toHaveBeenCalledWith(
            "association-123",
            user.sub,
            updatePayload,
        );
    });
});
