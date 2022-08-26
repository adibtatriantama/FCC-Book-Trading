import { NOT_FOUND } from 'src/constant';
import { Either, left, right } from 'src/core/either';
import { UseCase } from 'src/core/useCase';
import {
  EntityNotFoundError,
  UnexpectedError,
  UseCaseError,
} from 'src/core/useCaseError';
import { TradeDto } from 'src/dto/tradeDto';
import { TradeMapper } from 'src/mapper/tradeMapper';
import { TradeRepo } from 'src/repo/tradeRepo';

export type AcceptTradeRequest = {
  userId: string;
  tradeId: string;
};

export class UnableToAcceptTradeError extends UseCaseError {
  constructor(message: string) {
    super('Unable to accept trade, ' + message);
  }
}

export type AcceptTradeResponse = Either<UseCaseError, TradeDto>;

export class AcceptTrade
  implements UseCase<AcceptTradeRequest, AcceptTradeResponse>
{
  constructor(private readonly tradeRepo: TradeRepo) {}

  async execute(request: AcceptTradeRequest): Promise<AcceptTradeResponse> {
    const getTradeResult = await this.tradeRepo.findById(request.tradeId);

    if (getTradeResult.isFailure) {
      switch (getTradeResult.getErrorValue()) {
        case NOT_FOUND:
          return left(new EntityNotFoundError());
        default:
          return left(new UnexpectedError());
      }
    }

    const trade = getTradeResult.getValue();

    if (trade.decider.id !== request.userId) {
      return left(
        new UnableToAcceptTradeError('You are not the owner of the books'),
      );
    }

    const acceptResult = trade.accept();

    if (acceptResult.isFailure) {
      return left(new UnableToAcceptTradeError(acceptResult.getErrorValue()));
    }

    const saveResult = await this.tradeRepo.save(trade);

    if (saveResult.isFailure) {
      return left(new UnexpectedError());
    }

    const savedTrades = saveResult.getValue();

    return right(TradeMapper.toDto(savedTrades));
  }
}
