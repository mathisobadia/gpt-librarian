import { EntityConfiguration } from 'electrodb'
import { Table } from 'sst/node/table'
import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
export * as Dynamo from './dynamo'

const isTest = process.env.JEST_WORKER_ID
const config = {
  ...(isTest && {
    endpoint: 'http://127.0.0.1:8000',
    region: 'eu-central-1',
    tls: false,
    credentials: {
      accessKeyId: 'foo',
      secretAccessKey: 'bar'
    }
  })
}
export const Client = DynamoDBDocument.from(new DynamoDB(config), {
  marshallOptions: {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true
  }
})

export const Configuration: EntityConfiguration = {
  table: (Table as any).db.tableName,
  client: Client
}
