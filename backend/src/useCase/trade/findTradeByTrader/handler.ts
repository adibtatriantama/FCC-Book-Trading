import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { UnexpectedError } from 'src/core/useCaseError';
import { okResponse, serverErrorResponse } from 'src/helper';
import { DynamoDbTradeRepo } from 'src/repo/impl/dynamoDbTradeRepo';
import {
  FindTradeByTrader,
  FindTradeByTraderRequest,
} from './findTradeByTrader';

const useCase = new FindTradeByTrader(new DynamoDbTradeRepo());

export const main: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
) => {
  const { userId: traderId } = event.pathParameters;

  const request: FindTradeByTraderRequest = {
    traderId,
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
