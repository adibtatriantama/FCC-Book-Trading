import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { UnexpectedError } from 'src/core/useCaseError';
import {
  badRequestResponse,
  forbiddenResponse,
  okResponse,
  serverErrorResponse,
} from 'src/helper';
import { DynamoDbBookRepo } from 'src/repo/impl/dynamoDbBookRepo';
import { DynamoDbTradeRepo } from 'src/repo/impl/dynamoDbTradeRepo';
import { DynamoDbUserRepo } from 'src/repo/impl/dynamoDbUserRepo';
import {
  CreateTrade,
  CreateTradeRequest,
  InvalidBookError,
} from './createTrade';

const useCase = new CreateTrade(
  new DynamoDbTradeRepo(),
  new DynamoDbBookRepo(),
  new DynamoDbUserRepo(),
);

export const main: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
) => {
  if (!event.body) {
    return badRequestResponse(
      'Validation error: request body should be provided',
    );
  }

  const { sub: traderId } = event.requestContext.authorizer?.jwt.claims;

  const { ownerId, ownerBookIds, traderBookIds } = JSON.parse(event.body);

  if (!(ownerId && ownerBookIds && traderBookIds)) {
    return badRequestResponse(
      'Validation error: ownerId, ownerBookIds, traderBookIds is required',
    );
  }

  if (ownerBookIds.length < 1 || traderBookIds.length < 1) {
    return badRequestResponse(
      'Validation error: ownerBookIds and traderBookIds length should more than 1',
    );
  }

  const request: CreateTradeRequest = {
    traderId,
    ownerId,
    ownerBookIds,
    traderBookIds,
  };

  const response = await useCase.execute(request);

  if (response.isRight()) {
    return okResponse(response.value);
  } else {
    const useCaseError = response.value;
    const message = useCaseError.message;

    switch (useCaseError.constructor) {
      case InvalidBookError:
        return forbiddenResponse(message);
      case UnexpectedError:
      default:
        return serverErrorResponse(message);
    }
  }
};
