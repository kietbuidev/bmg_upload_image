const productionUrl =
  process.env.PUBLIC_API_BASE_URL ||
  (process.env.RAILWAY_PUBLIC_DOMAIN
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : undefined);

const servers: Array<{ url: string; description: string }> = [];
if (productionUrl) {
  servers.push({ url: productionUrl, description: "Production" });
}
servers.push({
  url: process.env.SWAGGER_LOCAL_URL || "http://localhost:8080",
  description: "Local development"
});

const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Cloudinary Upload API",
    version: "1.0.0",
    description:
      "REST API for uploading, listing, and deleting assets on Cloudinary. Use the demo form served at the root path or send HTTP requests documented here.",
    contact: {
      name: "BMG Upload Image",
      url: "https://railway.app"
    }
  },
  servers,
  tags: [
    { name: "Health", description: "Service status" },
    { name: "Uploads", description: "Image upload endpoints" },
    { name: "Assets", description: "Asset maintenance endpoints" }
  ],
  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Service health check",
        responses: {
          "200": {
            description: "Service is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ok: { type: "boolean", example: true },
                    service: {
                      type: "string",
                      example: "cloudinary-express-railway"
                    }
                  },
                  required: ["ok", "service"]
                }
              }
            }
          }
        }
      }
    },
    "/api/upload": {
      post: {
        tags: ["Uploads"],
        summary: "Upload a single image",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  image: {
                    type: "string",
                    format: "binary",
                    description: "Image file to upload"
                  }
                },
                required: ["image"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Upload succeeded",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SingleUploadResponse" }
              }
            }
          },
          "400": {
            description: "No file uploaded",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          "500": {
            description: "Server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/api/uploads": {
      post: {
        tags: ["Uploads"],
        summary: "Upload multiple images",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  images: {
                    type: "array",
                    items: { type: "string", format: "binary" },
                    minItems: 1
                  }
                },
                required: ["images"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Upload succeeded",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MultiUploadResponse" }
              }
            }
          },
          "400": {
            description: "No files uploaded",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          "500": {
            description: "Server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/api/delete/{publicId}": {
      delete: {
        tags: ["Assets"],
        summary: "Delete an asset by Cloudinary public_id",
        parameters: [
          {
            in: "path",
            name: "publicId",
            schema: { type: "string" },
            required: true,
            description: "Cloudinary public_id for the asset"
          }
        ],
        responses: {
          "200": {
            description: "Deletion succeeded",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DeleteResponse" }
              }
            }
          },
          "400": {
            description: "Missing publicId parameter",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          "500": {
            description: "Server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      UploadResult: {
        type: "object",
        properties: {
          public_id: { type: "string", example: "samples/my-upload" },
          url: {
            type: "string",
            example: "https://res.cloudinary.com/demo/image/upload/v1700000000/samples/my-upload.jpg"
          },
          width: { type: "integer", example: 1024 },
          height: { type: "integer", example: 768 },
          format: { type: "string", example: "jpg" },
          bytes: { type: "integer", example: 245000 }
        },
        required: ["public_id", "url", "width", "height", "format", "bytes"]
      },
      SingleUploadResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Uploaded" },
          data: { $ref: "#/components/schemas/UploadResult" }
        },
        required: ["message", "data"]
      },
      MultiUploadResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Uploaded" },
          count: { type: "integer", example: 2 },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/UploadResult" }
          }
        },
        required: ["message", "count", "data"]
      },
      DeleteResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Deleted" },
          result: {
            type: "object",
            additionalProperties: true,
            example: { result: "ok" }
          }
        },
        required: ["message", "result"]
      },
      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Upload failed" },
          error: { type: "string", example: "Cloudinary error message" }
        },
        required: ["message"]
      }
    }
  }
};

export default swaggerSpec;
