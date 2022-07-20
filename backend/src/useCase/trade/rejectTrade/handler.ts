import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { EntityNotFoundError, UnexpectedError } from 'src/core/useCaseError';
import {
  forbiddenResponse,
  notFoundResponse,
  okResponse,
  serverErrorResponse,
} from 'src/helper';
import { DynamoDbTradeRepo } from 'src/repo/impl/dynamoDbTradeRepo';
import {
  RejectTrade,
  RejectTradeRequest,
  UnableToRejectTradeError,
} from './rejectTrade';

const useCase = new RejectTrade(new DynamoDbTradeRepo());

export const main: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
) => {
  const { sub: userId } = event.requestContext.authorizer?.jwt.claims;
  const { tradeId } = event.pathParameters;

  const request: RejectTradeRequest = {
    tradeId,
    userId,
  };

  const response = await useCase.execute(request);

  if (response.isRight()) {
    return okResponse(response.value);
  } else {
    const useCaseError = response.value;
    const message = useCaseError.message;

    switch (useCaseError.constructor) {
      case UnableToRejectTradeError:
        return forbiddenResponse(message);
      case EntityNotFoundError:
        return notFoundResponse(message);
      case UnexpectedError:
      default:
        return serverErrorResponse(message);
    }
  }
};
