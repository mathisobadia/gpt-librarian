// import { Api } from "sst/node/api";
import { expect, it } from 'vitest'
import { Config } from 'sst/node/config'

it('can access api url', async () => {
  const apiUrl = Config.API_URL
  expect(apiUrl).not.toBe(undefined)
})
