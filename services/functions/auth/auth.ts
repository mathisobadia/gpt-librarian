/*
Auth handler from [SST Auth](https://docs.sst.dev/auth)
this handles the auth flow for the app, including the login page, the callback page, and the logout page
**/
import { AuthHandler, LinkAdapter, Session } from 'sst/node/auth'
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
import { respond } from '../utils'
import { User } from '@gpt-librarian/core/user'
import { Organization } from '@gpt-librarian/core/organization'
import { Member } from '@gpt-librarian/core/member'
import { Workspace } from '@gpt-librarian/core/workspace'
import { Config } from 'sst/node/config'

const client = new SESClient({ region: 'us-east-1' })
export const handler = AuthHandler({
  providers: {
    link: LinkAdapter({
      onLink: async (link, claims) => {
        console.log('LINK', link, claims)
        return await sendLink(link, claims)
      },
      onSuccess: async (claims) => {
        // TODO: include zod to validate claims
        if (claims.email) {
          return await onSuccess({ email: claims.email, name: claims.name })
        }
        return respond.error('missing email')
      },
      onError: async () => {
        console.log('ERROR')
        return respond.error('error')
      }
    })
  }
})

export type LoginClaims = {
  email: string
}

export const onSuccess = async (claims: SignUpClaims | LoginClaims) => {
  const domainName = Config.DOMAIN_NAME
  let user = await User.getByEmail(claims.email)
  if (!user) {
    const res = await createUser(claims)
    user = res.user
  }
  const redirect = process.env.IS_LOCAL
    ? 'http://localhost:3000'
    : `https://${domainName}`
  return Session.parameter({
    redirect,
    type: 'user',
    properties: {
      userId: user.userId,
      email: user.email,
      name: user.name
    }
  })
}

export type SignUpClaims = {
  email: string
  name?: string
}

export const createUser = async (claims: SignUpClaims) => {
  const { email, name } = claims
  const organization = await Organization.create()
  const user = await User.create({ email, name })
  const workspace = await Workspace.create(
    organization.organizationId,
    `${name ?? 'Default'} Workspace`
  )
  const member = await Member.create({
    workspaceId: workspace.workspaceId,
    userId: user.userId,
    role: 'ADMIN'
  })
  return { user, organization, member }
}

export const sendLink = async (link: string, claims: Record<string, any>) => {
  const { email: address } = claims
  const subject = 'Login to GPT Librarian'
  await client.send(
    new SendEmailCommand({
      // TODO: check if we need this
      Destination: {
        ToAddresses: [address]
      },
      Message: {
        Subject: {
          Data: subject
        },
        Body: {
          Text: {
            Data: `Login to GPT Librarian ${link}`
          },
          Html: {
            Data: html({ url: link, email: address })
          }
        }
      },
      SourceArn: Config.SES_IDENTITY_ARN,
      Source: 'no-reply@gpt-librarian.com'
    })
  )
  return respond.redirectClearSession('/log-in?emailsent=true')
}

const html = ({ url, email }: { url: string, email: string }) => {
  // Insert invisible space into domains and email address to prevent both the
  // email address and the domain from being turned into a hyperlink by email
  // clients like Outlook and Apple mail, as this is confusing because it seems
  // like they are supposed to click on their email address to sign in.
  const escapedEmail = `${email.replace(/\./g, '&#8203;.')}`
  const escapedSite = 'GPT Librarian'

  // Some simple styling options
  const backgroundColor = '#f9f9f9'
  const textColor = '#444444'
  const mainBackgroundColor = '#ffffff'
  const buttonBackgroundColor = '#346df1'
  const buttonBorderColor = '#346df1'
  const buttonTextColor = '#ffffff'
  return `
  <body style="background: ${backgroundColor};">
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center" style="padding: 10px 0px 20px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
          <strong>${escapedSite}</strong>
        </td>
      </tr>
    </table>
    <table width="100%" border="0" cellspacing="20" cellpadding="0" style="background: ${mainBackgroundColor}; max-width: 600px; margin: auto; border-radius: 10px;">
      <tr>
        <td align="center" style="padding: 10px 0px 0px 0px; font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
          Log in as <strong>${escapedEmail}</strong>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 20px 0;">
          <table border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center" style="border-radius: 5px;" bgcolor="${buttonBackgroundColor}"><a href="${url}" target="_blank" style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${buttonTextColor}; text-decoration: none; text-decoration: none;border-radius: 5px; padding: 10px 20px; border: 1px solid ${buttonBorderColor}; display: inline-block; font-weight: bold;">Log in</a></td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
          If you did not request this email you can safely ignore it.
        </td>
      </tr>
    </table>
  </body>
  `
}

declare module 'sst/node/auth' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  export interface SessionTypes {
    user: {
      userId: string
      email: string
      name?: string
    }
  }
}
