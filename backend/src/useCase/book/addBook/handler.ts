import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { UnexpectedError } from 'src/core/useCaseError';
import {
  badRequestResponse,
  okResponse,
  serverErrorResponse,
} from 'src/helper';
import { DynamoDbBookRepo } from 'src/repo/impl/dynamoDbBookRepo';
import { DynamoDbUserRepo } from 'src/repo/impl/dynamoDbUserRepo';
import { AddBook, AddBookRequest } from './addBook';

const useCase = new AddBook(new DynamoDbBookRepo(), new DynamoDbUserRepo());

export const main: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
) => {
  if (!event.body) {
    return badRequestResponse(
      'Validation error: request body should be provided',
    );
  }

  const { sub: ownerId } = event.requestContext.authorizer?.jwt.claims;

  const { title, author, description } = JSON.parse(event.body);

  if (!(title && author && description)) {
    return badRequestResponse(
      'Validation error: title, author, description is required',
    );
  }

  const request: AddBookRequest = {
    title,
    author,
    description,
    ownerId,
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
