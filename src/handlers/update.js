// @ts-nocheck
const { UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const {
  docClient,
  TABLE_NAME,
  response,
  errorResponse,
} = require("./common");

const ALLOWED_FIELDS = ["title", "description", "completed"];

/**
 * Update an existing task.
 * Triggered by PATCH /todos/{id}
 */
exports.handler = async (event) => {
  const taskId = event.pathParameters?.id;

  if (!taskId) {
    return errorResponse(400, "Task id is required in the path");
  }

  let body;

  try {
    body = JSON.parse(event.body || "{}");
  } catch (err) {
    return errorResponse(400, "Request body must be valid JSON");
  }

  const { deviceId } = body;

  if (!deviceId) {
    return errorResponse(400, "deviceId is required");
  }

  const fieldsToUpdate = Object.keys(body)
    .filter((key) => ALLOWED_FIELDS.includes(key))
    .reduce((acc, key) => ({ ...acc, [key]: body[key] }), {});

  if (Object.keys(fieldsToUpdate).length === 0) {
    return errorResponse(
      400,
      `No valid fields to update. Allowed fields: ${JSON.stringify(
        ALLOWED_FIELDS
      )}`
    );
  }

  fieldsToUpdate.updatedAt = new Date().toISOString();

  const expressionAttributeNames = {};
  const expressionAttributeValues = {};
  const updateExpressionParts = [];

  for (const [key, value] of Object.entries(fieldsToUpdate)) {
    const namePlaceholder = `#${key}`;
    const valuePlaceholder = `:${key}`;

    updateExpressionParts.push(
      `${namePlaceholder} = ${valuePlaceholder}`
    );

    expressionAttributeNames[namePlaceholder] = key;
    expressionAttributeValues[valuePlaceholder] = value;
  }

  try {
    const result = await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          deviceId,
          id: taskId,
        },
        UpdateExpression: "SET " + updateExpressionParts.join(", "),
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ConditionExpression:
          "attribute_exists(deviceId) AND attribute_exists(id)",
        ReturnValues: "ALL_NEW",
      })
    );

    return response(200, result.Attributes);
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") {
      return errorResponse(
        404,
        `Task '${taskId}' not found`
      );
    }

    console.error(err);
    return errorResponse(500, "Could not update task");
  }
};