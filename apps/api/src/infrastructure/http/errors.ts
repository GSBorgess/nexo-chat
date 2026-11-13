const apiErrorDefinitions = {
  VALIDATION_ERROR: {
    statusCode: 400,
    message: 'A solicitação contém dados inválidos.',
  },
  UNAUTHORIZED: {
    statusCode: 401,
    message: 'Autenticação necessária.',
  },
  FORBIDDEN: {
    statusCode: 403,
    message: 'Você não tem permissão para esta ação.',
  },
  NOT_FOUND: {
    statusCode: 404,
    message: 'O recurso solicitado não foi encontrado.',
  },
  CONFLICT: {
    statusCode: 409,
    message: 'A solicitação não pode ser concluída devido a um conflito.',
  },
} as const

export type ApiErrorCode = keyof typeof apiErrorDefinitions

export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly statusCode: (typeof apiErrorDefinitions)[ApiErrorCode]['statusCode']

  constructor(code: ApiErrorCode) {
    super(apiErrorDefinitions[code].message)
    this.name = 'ApiError'
    this.code = code
    this.statusCode = apiErrorDefinitions[code].statusCode
  }
}

export interface PublicErrorResponse {
  statusCode: number
  body: {
    code: string
    message: string
  }
}

interface ErrorLike {
  code?: unknown
  statusCode?: unknown
  validation?: unknown
}

const internalErrorResponse: PublicErrorResponse = {
  statusCode: 500,
  body: {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Ocorreu um erro interno.',
  },
}

function isErrorLike(error: unknown): error is ErrorLike {
  return typeof error === 'object' && error !== null
}

function getClientErrorResponse(statusCode: number): PublicErrorResponse {
  switch (statusCode) {
    case 400:
      return {
        statusCode,
        body: {
          code: 'VALIDATION_ERROR',
          message: apiErrorDefinitions.VALIDATION_ERROR.message,
        },
      }
    case 401:
      return {
        statusCode,
        body: {
          code: 'UNAUTHORIZED',
          message: apiErrorDefinitions.UNAUTHORIZED.message,
        },
      }
    case 403:
      return {
        statusCode,
        body: {
          code: 'FORBIDDEN',
          message: apiErrorDefinitions.FORBIDDEN.message,
        },
      }
    case 404:
      return {
        statusCode,
        body: {
          code: 'NOT_FOUND',
          message: apiErrorDefinitions.NOT_FOUND.message,
        },
      }
    case 409:
      return {
        statusCode,
        body: {
          code: 'CONFLICT',
          message: apiErrorDefinitions.CONFLICT.message,
        },
      }
    default:
      return {
        statusCode,
        body: {
          code: 'REQUEST_ERROR',
          message: 'A solicitação não pôde ser processada.',
        },
      }
  }
}

export function toPublicErrorResponse(error: unknown): PublicErrorResponse {
  if (error instanceof ApiError) {
    return getClientErrorResponse(error.statusCode)
  }

  if (!isErrorLike(error)) {
    return internalErrorResponse
  }

  if (
    error.code === 'FST_ERR_VALIDATION' ||
    (error.statusCode === 400 && Array.isArray(error.validation))
  ) {
    return getClientErrorResponse(400)
  }

  if (
    typeof error.statusCode === 'number' &&
    error.statusCode >= 400 &&
    error.statusCode < 500
  ) {
    return getClientErrorResponse(error.statusCode)
  }

  return internalErrorResponse
}
