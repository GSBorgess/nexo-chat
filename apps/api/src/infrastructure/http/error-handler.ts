import type { FastifyInstance } from 'fastify'

import { toPublicErrorResponse } from './errors.js'

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error, request, reply) => {
    const response = toPublicErrorResponse(error)
    const logContext = {
      requestId: request.id,
      method: request.method,
      statusCode: response.statusCode,
      code: response.body.code,
    }

    if (response.statusCode >= 500) {
      request.log.error(
        {
          ...logContext,
          errorName: error instanceof Error ? error.name : typeof error,
        },
        'Unhandled API error',
      )
    } else {
      request.log.warn(logContext, 'API request rejected')
    }

    return reply.status(response.statusCode).send(response.body)
  })
}
