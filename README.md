# 🚀 AWS Serverless To-Do CRUD API

A fully serverless RESTful To-Do API built using **AWS Lambda**, **Amazon API Gateway**, **Amazon DynamoDB**, and **AWS SAM**. This project demonstrates how to build, deploy, and test a CRUD application using Infrastructure as Code (IaC) with AWS.

---

## ✨ Features

- ✅ Create a new to-do task
- ✅ Retrieve all tasks
- ✅ Retrieve a task by ID
- ✅ Update an existing task
- ✅ Delete a task
- ✅ Serverless architecture
- ✅ Infrastructure managed with AWS SAM
- ✅ Local testing using AWS SAM CLI

---

## 🏗️ Architecture

```
                Client (Postman / Browser)
                          │
                          ▼
                 Amazon API Gateway
                          │
                          ▼
                  AWS Lambda Functions
                          │
                          ▼
                 Amazon DynamoDB Table
```

---

## 🛠️ Tech Stack

- Node.js 24.x
- AWS Lambda
- Amazon API Gateway (REST API)
- Amazon DynamoDB
- AWS SAM CLI
- AWS SDK for JavaScript v3

---

## 📁 Project Structure

```
todo-crud-api/
│
├── template.yaml
├── events/
├── src/
│   ├── handlers/
│   │   ├── common.js
│   │   ├── create.js
│   │   ├── get.js
│   │   ├── update.js
│   │   ├── delete.js
│   │   └── package.json
│
├── env.example.json
└── README.md
```

---

## 📋 Prerequisites

Before running this project, install:

- AWS CLI
- AWS SAM CLI
- Docker Desktop (for local testing)
- Node.js 24.x

Configure AWS credentials:

```bash
aws configure
```

Your IAM user should have permission to create:

- AWS Lambda
- API Gateway
- DynamoDB
- IAM Roles
- CloudFormation resources

---

## 🚀 Deployment

Build the project:

```bash
sam build
```

Deploy for the first time:

```bash
sam deploy --guided
```

After the first deployment, future deployments are simply:

```bash
sam deploy
```

---

## 🌐 API Endpoint

```
https://rvbduferug.execute-api.ap-southeast-1.amazonaws.com/Stage
```

---

## 📌 API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/todos` | Create a new task |
| GET | `/todos` | Get all tasks |
| GET | `/todos/{id}` | Get a task by ID |
| PUT | `/todos/{id}` | Update a task |
| DELETE | `/todos/{id}` | Delete a task |

---

## 📝 Example Request

### Create Task

**POST**

```http
POST /todos
```

Request Body

```json
{
    "title": "Learn AWS SAM"
}
```

Example Response

```json
{
    "message": "Task created successfully",
    "task": {
        "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "title": "Learn AWS SAM",
        "completed": false
    }
}
```

---

## 🧪 Local Testing

Build the application:

```bash
sam build
```

Start the local API:

```bash
sam local start-api --env-vars env.json
```

Local endpoint:

```
http://127.0.0.1:3000/todos
```

### Local Environment Variables

Create an `env.json` file in the project root:

```json
{
    "CreateTaskFunction": {
        "TABLE_NAME": "YOUR_DYNAMODB_TABLE_NAME"
    }
}
```

Replace `YOUR_DYNAMODB_TABLE_NAME` with the DynamoDB table name created after deployment.

> **Note**
>
> The Lambda function runs locally using Docker, but it connects to the DynamoDB table deployed in AWS. Therefore, deploy the stack first and update `env.json` with the correct table name before local testing.

An example configuration is included in:

```
env.example.json
```

---

## 🧹 Clean Up

Delete all deployed AWS resources:

```bash
sam delete
```

---

## 📚 What I Learned

This project helped me gain hands-on experience with:

- AWS Lambda
- Amazon API Gateway
- Amazon DynamoDB
- AWS SAM CLI
- AWS CloudFormation
- IAM Roles & Policies
- Local Lambda testing using Docker
- Infrastructure as Code (IaC)

---

## 👨‍💻 Author

**Tharusha**

Software Engineering Undergraduate
