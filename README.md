# AWS Serverless To-Do CRUD API

A simple To-Do CRUD API built with **AWS Lambda**, **API Gateway**, and **DynamoDB**, deployed using the **AWS SAM CLI**.

## Architecture

- **DynamoDB table** — stores to-do items (`id` as partition key, on-demand billing)
- **4 Lambda functions** (Node.js 20.x, AWS SDK v3) — one per operation (create, read, update, delete)
- **API Gateway (REST API)** — exposes each Lambda function as an HTTP endpoint
- Infrastructure is defined as code in `template.yaml` (AWS SAM)

```
todo-crud-api/
├── template.yaml          # SAM template: DynamoDB table, Lambda functions, API Gateway routes
├── src/handlers/
│   ├── common.js          # Shared DynamoDB client + response helpers
│   ├── create.js          # POST /todos
│   ├── get.js             # GET /todos and GET /todos/{id}
│   ├── update.js          # PUT /todos/{id}
│   ├── delete.js          # DELETE /todos/{id}
│   └── package.json       # @aws-sdk/client-dynamodb, @aws-sdk/lib-dynamodb
├── events/                # Sample events for local testing with `sam local invoke`
└── README.md
```

## Prerequisites

- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) installed and configured (`aws configure`) with an IAM user/role that can create Lambda, API Gateway, DynamoDB, and IAM resources
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) installed
- Node.js 20.x and npm (SAM will run `npm install` automatically during `sam build`)
- Docker (optional, only needed for `sam local invoke` / `sam local start-api`)

## Deploy

1. **Build the application**

   ```bash
   sam build
   ```

2. **Deploy (guided, first time only)**

   ```bash
   sam deploy --guided
   ```

   You'll be prompted for:
   - **Stack Name** — e.g. `todo-crud-api`
   - **AWS Region** — e.g. `us-east-1`
   - **Confirm changes before deploy** — `Y`
   - **Allow SAM CLI IAM role creation** — `Y`
   - **Save arguments to samconfig.toml** — `Y` (so future deploys are just `sam deploy`)

   SAM will show a changeset, then create:
   - The DynamoDB table
   - 4 Lambda functions + their IAM execution roles
   - An API Gateway REST API with a `dev` stage

3. **Get your API URL**

   After deployment finishes, SAM prints the outputs, including:

   ```
   Key                 ApiBaseUrl
   Value               https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev
   ```

   You can also retrieve it later with:

   ```bash
   aws cloudformation describe-stacks \
     --stack-name todo-crud-api \
     --query "Stacks[0].Outputs" \
     --output table
   ```

## API Endpoints

Base URL: `https://{api-id}.execute-api.{region}.amazonaws.com/dev`

| Method | Path          | Description                  |
|--------|---------------|-------------------------------|
| POST   | `/todos`      | Create a new task             |
| GET    | `/todos`      | Retrieve all tasks            |
| GET    | `/todos/{id}` | Retrieve a single task by id  |
| PUT    | `/todos/{id}` | Update an existing task       |
| DELETE | `/todos/{id}` | Delete a task                 |

### Task object shape

```json
{
  "id": "generated-uuid",
  "title": "string (required on create)",
  "description": "string (optional)",
  "completed": false,
  "createdAt": "ISO-8601 timestamp",
  "updatedAt": "ISO-8601 timestamp"
}
```

## Testing the endpoints

Replace `$API_URL` with your deployed base URL, e.g.:

```bash
export API_URL="https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev"
```

**Create a task**
```bash
curl -X POST "$API_URL/todos" \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "description": "Milk, eggs, bread"}'
```

**Get all tasks**
```bash
curl "$API_URL/todos"
```

**Get a single task** (use an `id` returned from create)
```bash
curl "$API_URL/todos/<id>"
```

**Update a task**
```bash
curl -X PUT "$API_URL/todos/<id>" \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

**Delete a task**
```bash
curl -X DELETE "$API_URL/todos/<id>"
```

## Local testing (optional, requires Docker)

Start a local API Gateway + Lambda emulator:

```bash
sam local start-api
```

Then hit `http://127.0.0.1:3000/todos` with curl exactly as above. Note that local testing still requires a live DynamoDB table (or [DynamoDB Local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html)) since the sample events point at the real `TABLE_NAME` environment variable.

You can also invoke a single function directly against the sample events:

```bash
sam local invoke CreateTodoFunction --event events/create-event.json
```

## Cleanup

To avoid ongoing AWS charges, delete the stack when you're done:

```bash
sam delete
```

This removes the Lambda functions, API Gateway, IAM roles, and the DynamoDB table (and all its data).

## Notes

- The DynamoDB table uses **on-demand (PAY_PER_REQUEST) billing**, so there's no cost when idle.
- CORS is enabled on all routes (`Access-Control-Allow-Origin: *`) for easy testing from a browser or front-end app.
- IAM permissions for each Lambda are scoped narrowly via SAM's `DynamoDBCrudPolicy` / `DynamoDBReadPolicy` policy templates, rather than broad wildcard access.
- Handlers use **AWS SDK for JavaScript v3** (`@aws-sdk/client-dynamodb` + `@aws-sdk/lib-dynamodb`'s `DynamoDBDocumentClient`), which auto-marshals plain JS objects to/from DynamoDB's attribute-value format.
