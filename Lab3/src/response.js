function createSuccessResponse (data) {
  // According to the lab criteria, a success response is:
  // { status: 'ok', ...data }
  // If no data is provided, only status is returned.
  return {
    status: 'ok',
    ...(data || {})
  };
}

function createErrorResponse (code = 500, message = 'internal server error', details) {
  // According to the lab criteria, an error response is:
  // { status: 'error', error: { code, message } }
  const error = {
    status: 'error',
    error: {
      code,
      message
    }
  };

  if (details) {
    error.error.details = details;
  }

  return error;
}

module.exports = {
  createSuccessResponse,
  createErrorResponse
};
