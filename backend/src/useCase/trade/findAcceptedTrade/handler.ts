import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { UnexpectedError } from 'src/core/useCaseError';
import { okResponse, serverErrorResponse } from 'src/helper';
import { DynamoDbTradeRepo } from 'src/repo/impl/dynamoDbTradeRepo';
import { FindAcceptedTrade } from './findAcceptedTrade';

const useCase = new FindAcceptedTrade(new DynamoDbTradeRepo());

export const main: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
) => {
  const response = await useCase.execute();

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
