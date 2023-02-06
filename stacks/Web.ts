import { use, StackContext, StaticSite } from 'sst/constructs'
import { Api } from './Api'
import { ConfigStack } from './Config'

export function Web ({ stack }: StackContext): StaticSite {
  const { DOMAIN_NAME, BASE_DOMAIN } = use(ConfigStack)
  const { api } = use(Api)
  const site = new StaticSite(stack, 'site', {
    path: 'web',
    buildCommand: 'pnpm run build',
    buildOutput: 'dist',
    environment: {
      VITE_REST_URL: api.url
    },
    customDomain: {
      domainName: DOMAIN_NAME.value,
      hostedZone: BASE_DOMAIN.value
    }
  })

  stack.addOutputs({
    SITE: site.url ?? 'http://localhost:3000'
  })
  return site
}
