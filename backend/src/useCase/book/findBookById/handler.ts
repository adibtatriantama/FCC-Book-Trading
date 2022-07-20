import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { EntityNotFoundError, UnexpectedError } from 'src/core/useCaseError';
import { notFoundResponse, okResponse, serverErrorResponse } from 'src/helper';
import { DynamoDbBookRepo } from 'src/repo/impl/dynamoDbBookRepo';
import { FindBookById, FindBookByIdRequest } from './findBookById';

const useCase = new FindBookById(new DynamoDbBookRepo());

export const main: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
) => {
  const { bookId } = event.pathParameters;

  const request: FindBookByIdRequest = {
    bookId,
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
