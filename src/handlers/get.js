// @ts-nocheck
const {
  GetCommand,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");

const {
  docClient,
  TABLE_NAME,
  response,
  errorResponse,
} = require("./common");

exports.handler = async (event) => {
  const taskId = event.pathParameters?.id;
  const deviceId = event.queryStringParameters?.deviceId;

  try {
    // GET /todos/{id}?deviceId=xxx
    if (taskId) {
      if (!deviceId) {
        return errorResponse(400, "deviceId is required");
      }

      const result = await docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            deviceId,
            id: taskId,
          },
        })
      );

      if (!result.Item) {
        return errorResponse(
          404,
          `Task '${taskId}' not found`
        );
      }

      return response(200, result.Item);
    }

    // GET /todos?deviceId=xxx
    if (!deviceId) {
      return errorResponse(400, "deviceId is required");
    }

    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression:
          "deviceId = :deviceId",
        ExpressionAttributeValues: {
          ":deviceId": deviceId,
        },
      })
    );

    return response(200, {
      items: result.Items ?? [],
      count: result.Count ?? 0,
    });
  } catch (err) {
    console.error(err);
    return errorResponse(
      500,
      "Could not retrieve task(s)"
    );
  }
};