import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { EntityNotFoundError, UnexpectedError } from 'src/core/useCaseError';
import {
  badRequestResponse,
  notFoundResponse,
  okResponse,
  serverErrorResponse,
} from 'src/helper';
import { DynamoDbUserRepo } from 'src/repo/impl/dynamoDbUserRepo';
import { UpdateUser, UpdateUserRequest } from './updateUser';

const useCase = new UpdateUser(new DynamoDbUserRepo());

export const main: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
) => {
  if (!event.body) {
    return badRequestResponse(
      'Validation error: request body should be provided',
    );
  }

  const { sub: id } = event.requestContext.authorizer?.jwt.claims;

  const { address, nickname } = JSON.parse(event.body);

  if (!(address || nickname)) {
    return badRequestResponse(
      'Validation error: address or error should be provided',
    );
  }

  const request: UpdateUserRequest = {
    id,
    address,
    nickname,
  };

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
