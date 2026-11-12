import { config } from 'dotenv'
import { z } from 'zod'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const apiDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
config({ path: resolve(apiDirectory, '.env') })

const auth0DomainSchema = z
  .string()
  .trim()
  .min(1)
  .transform((value) => (value.includes('://') ? value : `https://${value}`))
  .pipe(z.string().url())
  .refine((value) => {
    const url = new URL(value)
    return (
      url.protocol === 'https:' &&
      url.hostname.length > 0 &&
      url.pathname === '/' &&
      !url.search &&
      !url.hash &&
      !url.username &&
      !url.password
    )
  }, 'must be a valid HTTPS Auth0 domain')
  .transform((value) => new URL(value).host)

const webOriginSchema = z
  .string()
  .trim()
  .min(1)
  .pipe(z.string().url())
  .refine((value) => {
    const url = new URL(value)
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      url.pathname === '/' &&
      !url.search &&
      !url.hash &&
      !url.username &&
      !url.password
    )
  }, 'must be an HTTP(S) origin without a path, query, or fragment')
  .transform((value) => new URL(value).origin)

const envSchema = z
  .object({
    AUTH0_DOMAIN: auth0DomainSchema,
    AUTH0_AUDIENCE: z.string().trim().min(1),
    WEB_ORIGIN: webOriginSchema,
  })
  .transform(({ AUTH0_DOMAIN, AUTH0_AUDIENCE, WEB_ORIGIN }) => ({
    auth0Domain: AUTH0_DOMAIN,
    auth0Issuer: `https://${AUTH0_DOMAIN}/`,
    auth0Audience: AUTH0_AUDIENCE,
    webOrigin: WEB_ORIGIN,
  }))

const result = envSchema.safeParse(process.env)

if (!result.success) {
  const issues = result.error.issues
    .map((issue) => `${issue.path.join('.') || 'environment'}: ${issue.message}`)
    .join('; ')

  throw new Error(`Invalid API environment configuration: ${issues}`)
}

export const env = result.data
export type ApiEnvironment = z.output<typeof envSchema>
