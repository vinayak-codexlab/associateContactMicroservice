import type { Application, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";

export const swaggerSpec = {
    openapi: "3.0.3",
    info: {
        title: "Contact Association Service API",
        version: "1.0.0",
        description: "Swagger documentation for the contact association endpoints. Use Try it out to execute requests directly from the browser. Click Authorize and paste a Bearer token, or keep using the accessToken cookie.",
    },
    servers: [{ url: "/", description: "Local server" }],
    tags: [{ name: "Contact Associations", description: "Manage broker contact associations" }],
    paths: {
        "/v1/user/listing/": {
            post: {
                tags: ["Contact Associations"],
                summary: "Create a contact association",
                security: [{ bearerAuth: [] }, { cookieAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/CreateContactAssociationRequest" },
                            example: {
                                contacts: [
                                    {
                                        contactName: "Ada Lovelace",
                                        contactMobile: "9876543210",
                                        type: "owner",
                                    },
                                ],
                                source: "manual",
                                origin: "app",
                                contactId: "contact-123",
                                listingId: "listing-123",
                            },
                        },
                    },
                },
                responses: {
                    201: { description: "Contact association created successfully", content: { "application/json": { schema: { $ref: "#/components/schemas/CreateContactAssociationResponse" } } } },
                    401: { description: "Authentication failed", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
                },
            },
        },
        "/v1/user/listing/{listingId}": {
            get: {
                tags: ["Contact Associations"],
                summary: "Get contact associations by listing ID",
                security: [{ bearerAuth: [] }, { cookieAuth: [] }],
                parameters: [{ name: "listingId", in: "path", required: true, schema: { type: "string" } }],
                responses: {
                    200: { description: "List of contact associations", content: { "application/json": { schema: { $ref: "#/components/schemas/ListContactAssociationsResponse" } } } },
                    401: { description: "Authentication failed", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
                },
            },
        },
        "/v1/user/listing/{id}": {
            delete: {
                tags: ["Contact Associations"],
                summary: "Delete a contact association",
                security: [{ bearerAuth: [] }, { cookieAuth: [] }],
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                responses: {
                    200: { description: "Contact association deleted successfully", content: { "application/json": { schema: { $ref: "#/components/schemas/DeleteContactAssociationResponse" } } } },
                    401: { description: "Authentication failed", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
                },
            },
        },
        "/v1/user/listing/{id}/type": {
            patch: {
                tags: ["Contact Associations"],
                summary: "Update the contact association type",
                security: [{ bearerAuth: [] }, { cookieAuth: [] }],
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/UpdateContactTypeRequest" },
                            example: {
                                type: "tenant",
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Contact type updated successfully", content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateContactTypeResponse" } } } },
                    401: { description: "Authentication failed", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
                },
            },
        },
        "/v1/user/listing/{id}/data": {
            put: {
                tags: ["Contact Associations"],
                summary: "Update contact association details",
                security: [{ bearerAuth: [] }, { cookieAuth: [] }],
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/UpdateContactDataRequest" },
                            example: {
                                contactName: "Grace Hopper",
                                contactMobile: "9123456789",
                                type: "contact_person",
                                source: "import",
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Contact details updated successfully", content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateContactDataResponse" } } } },
                    401: { description: "Authentication failed", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
                },
            },
        },
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
            cookieAuth: {
                type: "apiKey",
                in: "cookie",
                name: "accessToken",
            },
        },
        schemas: {
            ContactAssociation: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    contactName: { type: "string" },
                    contactMobile: { type: "string" },
                    type: { type: "string", enum: ["owner", "previous_owner", "contact_person", "tenant", "previous_tenant"] },
                    source: { type: "string", enum: ["manual", "import", "resideContact"] },
                    origin: { type: "string", enum: ["app", "web"] },
                    listingId: { type: "string" },
                },
                required: ["contactName", "contactMobile", "type"],
            },
            CreateContactAssociationRequest: {
                type: "object",
                required: ["contacts", "source", "origin", "listingId"],
                properties: {
                    contacts: {
                        type: "array",
                        items: { $ref: "#/components/schemas/ContactAssociation" },
                    },
                    source: { type: "string", enum: ["manual", "import", "resideContact"] },
                    origin: { type: "string", enum: ["app", "web"] },
                    contactId: { type: "string" },
                    listingId: { type: "string" },
                },
            },
            CreateContactAssociationResponse: {
                type: "object",
                properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "contact created successfully" },
                    data: { type: "array", items: { $ref: "#/components/schemas/ContactAssociation" } },
                },
            },
            ListContactAssociationsResponse: {
                type: "object",
                properties: {
                    success: { type: "boolean", example: true },
                    data: { type: "array", items: { $ref: "#/components/schemas/ContactAssociation" } },
                },
            },
            DeleteContactAssociationResponse: {
                type: "object",
                properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "contact deleted successfully" },
                },
            },
            UpdateContactTypeRequest: {
                type: "object",
                required: ["type"],
                properties: {
                    type: { type: "string", enum: ["owner", "previous_owner", "contact_person", "tenant", "previous_tenant"] },
                },
            },
            UpdateContactTypeResponse: {
                type: "object",
                properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "contact type updated successfully" },
                    data: { $ref: "#/components/schemas/ContactAssociation" },
                },
            },
            UpdateContactDataRequest: {
                type: "object",
                required: ["contactName", "contactMobile", "type", "source"],
                properties: {
                    contactName: { type: "string" },
                    contactMobile: { type: "string" },
                    type: { type: "string", enum: ["owner", "previous_owner", "contact_person", "tenant", "previous_tenant"] },
                    source: { type: "string", enum: ["manual", "import", "resideContact"] },
                },
            },
            UpdateContactDataResponse: {
                type: "object",
                properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "contact details updated successfully" },
                    data: { $ref: "#/components/schemas/ContactAssociation" },
                },
            },
            ErrorResponse: {
                type: "object",
                properties: {
                    success: { type: "boolean", example: false },
                    message: { type: "string" },
                },
            },
        },
    },
};

export const registerSwaggerDocs = (app: Application) => {
    app.get("/api-docs.json", (_req: Request, res: Response) => {
        res.json(swaggerSpec);
    });

    app.use(
        "/api-docs",
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, {
            explorer: true,
            swaggerOptions: {
                docExpansion: "none",
                persistAuthorization: true,
            },
        }),
    );
};
