// import { Api } from "@serverless-stack/node/api";
import { expect, it } from 'vitest'
import { Config } from '@serverless-stack/node/config'

it('can access api url', async () => {
  const apiUrl = Config.API_URL
  expect(apiUrl).not.toBe(undefined)
})
