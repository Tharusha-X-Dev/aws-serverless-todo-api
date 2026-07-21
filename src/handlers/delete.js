// @ts-nocheck
const { DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const {
  docClient,
  TABLE_NAME,
  response,
  errorResponse,
} = require("./common");

/**
 * Delete a task.
 * Triggered by DELETE /todos/{id}
 */
exports.handler = async (event) => {
  const taskId = event.pathParameters?.id;
  const deviceId = event.queryStringParameters?.deviceId;

  if (!taskId) {
    return errorResponse(400, "Task id is required in the path");
  }

  if (!deviceId) {
    return errorResponse(400, "deviceId is required");
  }

  try {
    await docClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          deviceId,
          id: taskId,
        },
        ConditionExpression:
          "attribute_exists(deviceId) AND attribute_exists(id)",
      })
    );

    return response(200, {
      message: `Task '${taskId}' deleted`,
    });
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") {
      return errorResponse(
        404,
        `Task '${taskId}' not found`
      );
    }

    console.error(err);

    return errorResponse(
      500,
      "Could not delete task"
    );
  }
};