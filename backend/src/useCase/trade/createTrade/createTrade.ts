import { Either, left, right } from 'src/core/either';
import { UseCase } from 'src/core/useCase';
import { UnexpectedError, UseCaseError } from 'src/core/useCaseError';
import { Trade } from 'src/domain/trade';
import { TradeDto } from 'src/dto/tradeDto';
import { TradeMapper } from 'src/mapper/tradeMapper';
import { UserMapper } from 'src/mapper/userMapper';
import { BookRepo } from 'src/repo/bookRepo';
import { TradeRepo } from 'src/repo/tradeRepo';
import { UserRepo } from 'src/repo/userRepo';

export type CreateTradeRequest = {
  ownerId: string;
  traderId: string;
  ownerBookIds: string[];
  traderBookIds: string[];
};

export class UnableToCreateTradeError extends UseCaseError {
  constructor(message: string) {
    super(`Unable to create trade: ${message}`);
  }
}

export class InvalidBookError extends UseCaseError {
  constructor() {
    super('The books you are requesting are no longer valid');
  }
}

export type CreateTradeResponse = Either<UseCaseError, TradeDto>;

export class CreateTrade
  implements UseCase<CreateTradeRequest, CreateTradeResponse>
{
  constructor(
    private readonly tradeRepo: TradeRepo,
    private readonly bookRepo: BookRepo,
    private readonly userRepo: UserRepo,
  ) {}

  async execute(request: CreateTradeRequest): Promise<CreateTradeResponse> {
    if (request.ownerId === request.traderId) {
      return left(new UnableToCreateTradeError("Can't trade with same person"));
    }
    const batchFindUserPromise = this.userRepo.batchFindById([
      request.ownerId,
      request.traderId,
    ]);
    const batchFindOwnerBooksPromise = await this.bookRepo.batchFindById([
      ...request.ownerBookIds,
    ]);
    const batchFindTraderBooksPromise = await this.bookRepo.batchFindById([
      ...request.traderBookIds,
    ]);

    const [
      batchFindUserResult,
      batchFindOwnerBooksResult,
      batchFindTraderBooksResult,
    ] = await Promise.all([
      batchFindUserPromise,
      batchFindOwnerBooksPromise,
      batchFindTraderBooksPromise,
    ]);

    if (
      batchFindUserResult.isFailure ||
      batchFindOwnerBooksResult.isFailure ||
      batchFindTraderBooksResult.isFailure
    ) {
      return left(new UnexpectedError());
    }

    const [owner, trader] = batchFindUserResult.getValue();
    const ownerBooks = batchFindOwnerBooksResult.getValue();
    const traderBooks = batchFindTraderBooksResult.getValue();

    for (const ownerBook of ownerBooks) {
      if (ownerBook.owner.id !== owner.id) {
        return left(new InvalidBookError());
      }
    }

    for (const traderBook of traderBooks) {
      if (traderBook.owner.id !== trader.id) {
        return left(new InvalidBookError());
      }
    }

    const trade = Trade.create({
      owner: UserMapper.toDetails(owner),
      trader: UserMapper.toDetails(trader),
      createdAt: new Date(),
      ownerBooks,
      traderBooks,
    }).getValue();

    const saveResult = await this.tradeRepo.save(trade);

    if (saveResult.isFailure) {
      return left(new UnexpectedError());
    }

    const savedTrade = saveResult.getValue();

    return right(TradeMapper.toDto(savedTrade));
  }
}
