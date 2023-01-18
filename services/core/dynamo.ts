import { EntityConfiguration } from 'electrodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { Table } from '@serverless-stack/node/table'

export * as Dynamo from './dynamo'

export const Client = new DynamoDBClient({})

export const Configuration: EntityConfiguration = {
  table: (Table as any).db.tableName,
  client: Client
}
