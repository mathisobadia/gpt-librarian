# GPT Workspace Assistant

A Chat GPT assistant that knows all about your business

## How

Connect one of your knowledge bases to your workspace, once connected the chatbot will be able to answer questions with inputs from your content

### Available connectors:

- [**Notion**](https://notion.so) ✅
- [**Google Docs**](https://docs.google.com/) (coming soon)
- [**Confluence**](https://www.atlassian.com/software/confluence) (coming soon)

### Features

- Chat: Ask any question to the chatbot, it will answer the question and give you the sources that were used to answer it.
- Semantic search: Query your whole workspace with inteligent semantic search.

## Tech stack

[**SST.dev**](https://sst.dev) to define all AWS services, to deploy the stack you will need:

- [AWS](https://aws.amazon.com) account, aws-cli installed
- [Openai](https://openai.com/api/) account, set your api key as a token by running `npx sst secrets set OPENAI_API_KEY <YourToken>`
- [Pinecone](https://pinecone.io) account, set your api key as a token by running `npx sst secrets set PINECONE_TOKEN <YourToken>`

### Backend

#### AWS services

- dynamodb
- lambda
- API Gateway

#### Other APIs

- openai API
- notion API
- pinecone.io to host embeddings

### Frontend

solidjs with tanstack query, solid router

### Acknowlegments

Some prompts were used from the great [LangChain](https://github.com/hwchase17/langchain), but I wanted to keep this whole project in typescript so the package is not used directly.
