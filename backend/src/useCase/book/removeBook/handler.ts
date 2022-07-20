import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { EntityNotFoundError, UnexpectedError } from 'src/core/useCaseError';
import {
  forbiddenResponse,
  notFoundResponse,
  okResponse,
  serverErrorResponse,
} from 'src/helper';
import { DynamoDbBookRepo } from 'src/repo/impl/dynamoDbBookRepo';
import { DynamoDbTradeRepo } from 'src/repo/impl/dynamoDbTradeRepo';
import {
  RemoveBook,
  RemoveBookRequest,
  UnableToRemoveBookError,
} from './removeBook';

const useCase = new RemoveBook(new DynamoDbBookRepo(), new DynamoDbTradeRepo());

export const main: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
) => {
  const { bookId } = event.pathParameters;
  const { sub: userId } = event.requestContext.authorizer?.jwt.claims;

  const request: RemoveBookRequest = {
    userId,
    bookId,
  };

  const response = await useCase.execute(request);

  if (response.isRight()) {
    return okResponse(response.value);
  } else {
    const useCaseError = response.value;
    const message = useCaseError.message;

    switch (useCaseError.constructor) {
      case UnableToRemoveBookError:
        return forbiddenResponse(message);
      case EntityNotFoundError:
        return notFoundResponse(message);
      case UnexpectedError:
      default:
        return serverErrorResponse(message);
    }
  }
};
