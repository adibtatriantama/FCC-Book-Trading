import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { EntityNotFoundError, UnexpectedError } from 'src/core/useCaseError';
import { notFoundResponse, okResponse, serverErrorResponse } from 'src/helper';
import { DynamoDbUserRepo } from 'src/repo/impl/dynamoDbUserRepo';
import { FindUserById } from './findUserById';

const useCase = new FindUserById(new DynamoDbUserRepo());

export const main: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
) => {
  const { userId: request } = event.pathParameters;

  const response = await useCase.execute(request);

  if (response.isRight()) {
    return okResponse(response.value);
  } else {
    const useCaseError = response.value;
    const message = useCaseError.message;

    switch (useCaseError.constructor) {
      case EntityNotFoundError:
        return notFoundResponse(message);
      case UnexpectedError:
      default:
        return serverErrorResponse(message);
    }
  }
};

export const me: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
) => {
  const { sub: request } = event.requestContext.authorizer?.jwt.claims;

  const response = await useCase.execute(request);

  if (response.isRight()) {
    return okResponse(response.value);
  } else {
    const useCaseError = response.value;
    const message = useCaseError.message;

    switch (useCaseError.constructor) {
      case EntityNotFoundError:
        return notFoundResponse(message);
      case UnexpectedError:
      default:
        return serverErrorResponse(message);
    }
  }
};
