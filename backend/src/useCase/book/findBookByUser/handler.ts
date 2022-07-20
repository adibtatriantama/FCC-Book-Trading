import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { UnexpectedError } from 'src/core/useCaseError';
import { okResponse, serverErrorResponse } from 'src/helper';
import { DynamoDbBookRepo } from 'src/repo/impl/dynamoDbBookRepo';
import { FindBookByUser, FindBookByUserRequest } from './findBookByUser';

const useCase = new FindBookByUser(new DynamoDbBookRepo());

export const main: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
) => {
  const { userId } = event.pathParameters;

  const request: FindBookByUserRequest = {
    userId,
  };

  const response = await useCase.execute(request);

  if (response.isRight()) {
    return okResponse(response.value);
  } else {
    const useCaseError = response.value;
    const message = useCaseError.message;

    switch (useCaseError.constructor) {
      case UnexpectedError:
      default:
        return serverErrorResponse(message);
    }
  }
};

export const me: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
) => {
  const { sub: userId } = event.requestContext.authorizer?.jwt.claims;

  const request: FindBookByUserRequest = {
    userId,
  };

  const response = await useCase.execute(request);

  if (response.isRight()) {
    return okResponse(response.value);
  } else {
    const useCaseError = response.value;
    const message = useCaseError.message;

    switch (useCaseError.constructor) {
      case UnexpectedError:
      default:
        return serverErrorResponse(message);
    }
  }
};
