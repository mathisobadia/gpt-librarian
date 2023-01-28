import { SSTConfig } from 'sst'
import { Api } from './stacks/Api.js'
import { ConfigStack } from './stacks/Config.js'
import { Database } from './stacks/Database.js'
import { Web } from './stacks/Web.js'

export default {
  config (input) {
    return {
      name: 'gpt-librarian',
      region: 'us-west-2'
    }
  },
  stacks (app) {
    app.setDefaultFunctionProps({
      runtime: 'nodejs16.x',
      nodejs: {
        format: 'esm'
      }
    })
    app.stack(ConfigStack).stack(Database).stack(Api).stack(Web)
  }
} satisfies SSTConfig
