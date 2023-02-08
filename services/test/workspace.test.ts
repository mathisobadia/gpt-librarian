// import { Api } from "sst/node/api";
import { beforeAll, expect, it } from 'vitest'
import { generateClaims, setUpDynamo } from './test-utils'
import { User } from '@gpt-librarian/core/user'
import { Workspace } from '@gpt-librarian/core/workspace'
import { Organization } from '@gpt-librarian/core/organization'
import { createUser } from '@gpt-librarian/functions/auth/auth'
const claims = generateClaims()
beforeAll(async () => {
  await setUpDynamo()
})
it('creating a new user creates an organization, a workspace and a member', async () => {
  await createUser(claims)
  const user = await User.getByEmail(claims.email)
  expect(user?.email).toBe(claims.email)
  if (!user) throw new Error('user not found')
  const { members } = await Workspace.getUserCollection(user.userId)
  expect(members.length).toBe(1)
  const member = members[0]
  const { workspaces } = await Workspace.getWorkspaceCollection(member.workspaceId)
  expect(workspaces.length).toBe(1)
  const workspace = workspaces[0]
  expect(member.role).toBe('ADMIN')
  const org = await Organization.get(workspace.organizationId)
  expect(org?.name).not.toBe(undefined)
})
