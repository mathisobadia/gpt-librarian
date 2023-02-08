import { SignUpClaims } from 'functions/auth/auth'
import { ulid } from 'ulid'
import { spawn } from 'dynamo-db-local'
import { Table } from 'sst/node/table'
import { Dynamo } from '@gpt-librarian/core/dynamo'

export const setUpDynamo = async () => {
  const dynamoDbLocalProcess = await spawn({ port: 8000 })
  const testTableExists = await Dynamo.BaseClient.describeTable({
    TableName: Table.db.tableName
  }).catch(() => false)
  if (testTableExists) {
    return
  }
  await Dynamo.BaseClient.createTable({
    TableName: Table.db.tableName,
    AttributeDefinitions: [{
      AttributeName: 'pk',
      AttributeType: 'S'
    },
    {
      AttributeName: 'sk',
      AttributeType: 'S'
    },
    {
      AttributeName: 'gsi1pk',
      AttributeType: 'S'
    },
    {
      AttributeName: 'gsi1sk',
      AttributeType: 'S'
    },
    {
      AttributeName: 'gsi2pk',
      AttributeType: 'S'
    },
    {
      AttributeName: 'gsi2sk',
      AttributeType: 'S'
    }
    ],
    KeySchema: [{
      AttributeName: 'pk',
      KeyType: 'HASH'
    },
    {
      AttributeName: 'sk',
      KeyType: 'RANGE'
    }
    ],

    GlobalSecondaryIndexes: [{
      IndexName: 'gsi1',
      KeySchema: [{
        AttributeName: 'gsi1pk',
        KeyType: 'HASH'
      },
      {
        AttributeName: 'gsi1sk',
        KeyType: 'RANGE'
      }
      ],
      Projection: {
        ProjectionType: 'ALL'
      }
    },
    {
      IndexName: 'gsi2',
      KeySchema: [{
        AttributeName: 'gsi2pk',
        KeyType: 'HASH'
      },
      {
        AttributeName: 'gsi2sk',
        KeyType: 'RANGE'
      }
      ],
      Projection: {
        ProjectionType: 'ALL'
      }
    }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  })

  return async () => {
    await dynamoDbLocalProcess.kill()
  }
}

export const generateClaims: () => SignUpClaims = () => ({
  email: `${ulid()}@test.com`,
  name: 'Test User'
})
