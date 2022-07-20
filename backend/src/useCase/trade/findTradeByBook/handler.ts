import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { UnexpectedError } from 'src/core/useCaseError';
import { okResponse, serverErrorResponse } from 'src/helper';
import { DynamoDbTradeRepo } from 'src/repo/impl/dynamoDbTradeRepo';
import { FindTradeByBook, FindTradeByBookRequest } from './findTradeByBook';

const useCase = new FindTradeByBook(new DynamoDbTradeRepo());

export const main: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
) => {
  const { bookId } = event.pathParameters;

  const request: FindTradeByBookRequest = {
    bookId,
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
