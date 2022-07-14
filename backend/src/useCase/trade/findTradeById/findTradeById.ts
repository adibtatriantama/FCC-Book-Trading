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

export type FindTradeByIdRequest = {
  tradeId: string;
};

export type FindTradeByIdResponse = Either<UseCaseError, TradeDto>;

export class FindTradeById
  implements UseCase<FindTradeByIdRequest, FindTradeByIdResponse>
{
  constructor(private readonly tradeRepo: TradeRepo) {}

  async execute(request: FindTradeByIdRequest): Promise<FindTradeByIdResponse> {
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

    return right(TradeMapper.toDto(trade));
  }
}
