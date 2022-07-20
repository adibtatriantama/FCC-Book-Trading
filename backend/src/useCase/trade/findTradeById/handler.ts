import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { EntityNotFoundError, UnexpectedError } from 'src/core/useCaseError';
import { notFoundResponse, okResponse, serverErrorResponse } from 'src/helper';
import { DynamoDbTradeRepo } from 'src/repo/impl/dynamoDbTradeRepo';
import { FindTradeById, FindTradeByIdRequest } from './findTradeById';

const useCase = new FindTradeById(new DynamoDbTradeRepo());

export const main: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
) => {
  const { tradeId } = event.pathParameters;

  const request: FindTradeByIdRequest = {
    tradeId,
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
