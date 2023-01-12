# GPT Workspace Assistant

A Chat GPT assistant that knows all about your business

## How

Connect one of your knowledge bases to your workspace, once connected the chatbot will be able to answer questions with inputs from your content

### Available connectors:

- [**Notion**](https://notion.so) ✅
- [**Google Docs**](https://docs.google.com/) (coming soon)
- [**Github**](https://github.com/) (coming soon)
- [**Confluence**](https://www.atlassian.com/software/confluence) (coming soon)

Let me know what integration you would like to see included by opening a new issue!

### Features

- Chat: Ask any question to the chatbot, it will answer the question and give you the sources that were used to answer it ✅
- Semantic search: Query your whole workspace with inteligent semantic search ✅
- Ask a question directly from slack or discord (coming soon)

## Tech stack

[**SST.dev**](https://sst.dev) to define and orchestrate all AWS services

### Backend

#### AWS services

- dynamodb for all persisted data
- lambda for all compute
- API Gateway for the API
- Cloudfront CDN
- AWS SSM to store secrets
- ...

#### Other APIs

- [openai](https://openai.com/api/) API for computing embeddings, checking moderation compliance, and creating completions
- [pinecone.io](pinecone.io) to host and query embeddings

### Frontend

solidjs with tanstack query, solid router. Plannig on migrating to solidstart as soon as it is available on SST

## Host it yourself

Worried about your data or want to customize this project? Host this full stack yourself

To deploy the stack you will need to have:

- [AWS](https://aws.amazon.com) account, aws-cli installed
- [Openai](https://openai.com/api/) account, set your api key as a token by running `npx sst secrets set OPENAI_API_KEY <YourToken>`
- [Pinecone](https://pinecone.io) account, set your api key as a token by running `npx sst secrets set PINECONE_TOKEN <YourToken>`
- Domain name settings: Change the domain name value form app.gpt-worskapce.com to your custom domain name, create a route53 hosted zone for that domain name, and a ACM certificate with wildcard for that same domain name.

In the future I might make hosting this easier by having one click deploy on vercel to avoid domain config

### Acknowlegments

Some prompts were used from the great [LangChain](https://github.com/hwchase17/langchain), but I wanted to keep this whole project in typescript so the package is not used directly.

Another Project that has a similar scope but was not used directly is [GPT Index](https://github.com/jerryjliu/gpt_index)

### License

Inspired by [Dub.sh](dub.sh), gpt-librarian is open-source under the GNU Affero General Public License Version 3 (AGPLv3) or any later version. You can find it here.
