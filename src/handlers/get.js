// @ts-nocheck
const { GetCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { docClient, TABLE_NAME, response, errorResponse } = require("./common");

/**
 * Retrieve tasks.
 * - GET /todos       -> list all tasks
 * - GET /todos/{id}  -> get a single task
 */
exports.handler = async (event) => {
  const taskId = event.pathParameters && event.pathParameters.id;

  try {
    if (taskId) {
      const result = await docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { id: taskId },
        })
      );

      if (!result.Item) {
        return errorResponse(404, `Task '${taskId}' not found`);
      }
      return response(200, result.Item);
    }

    // No id supplied -> return all tasks (simple scan, fine for a small demo table)
    let items = [];
    let lastEvaluatedKey;

    do {
      const result = await docClient.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          ExclusiveStartKey: lastEvaluatedKey,
        })
      );
      items = items.concat(result.Items || []);
      lastEvaluatedKey = result.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    return response(200, { items, count: items.length });
  } catch (err) {
    console.error(err);
    return errorResponse(500, "Could not retrieve task(s)");
  }
};
