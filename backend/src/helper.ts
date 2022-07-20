export const okResponse = (body) => {
  return {
    statusCode: 200,
    body: JSON.stringify(body),
  };
};

export const badRequestResponse = (message: string) => {
  return {
    statusCode: 400,
    body: JSON.stringify({
      message,
    }),
  };
};

export const forbiddenResponse = (message: string) => {
  return {
    statusCode: 403,
    body: JSON.stringify({
      message,
    }),
  };
};

export const notFoundResponse = (message: string) => {
  return {
    statusCode: 404,
    body: JSON.stringify({
      message,
    }),
  };
};

export const serverErrorResponse = (message: string) => {
  return {
    statusCode: 500,
    body: JSON.stringify({
      message,
    }),
  };
};
