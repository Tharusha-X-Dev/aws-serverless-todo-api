// @ts-nocheck
const { randomUUID } = require("crypto");
const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const { docClient, TABLE_NAME, response, errorResponse } = require("./common");

/**
 * Create a new to-do task. Triggered by POST /todos
 */
exports.handler = async (event) => {
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (err) {
    return errorResponse(400, "Request body must be valid JSON");
  }

  const { title, deviceId, description, completed } = body;

  if (!title || !deviceId || typeof title !== "string" || typeof deviceId !== "string") {
    return errorResponse(400, "Fields 'title' (string) and 'deviceId' (string) are required");
  }

  const now = new Date().toISOString();
  const item = {
    id: randomUUID(),
    deviceId,
    title,
    description: description || "",
    completed: Boolean(completed) ?? false,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      })
    );
    return response(201, item);
  } catch (err) {
    console.error(err);
    return errorResponse(500, "Could not create task");
  }
};
