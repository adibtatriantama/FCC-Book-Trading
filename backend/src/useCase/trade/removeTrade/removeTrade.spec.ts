import { NOT_FOUND } from 'src/constant';
import { Result } from 'src/core/result';
import { EntityNotFoundError, UnexpectedError } from 'src/core/useCaseError';
import { Book, BookProps } from 'src/domain/book';
import { Trade } from 'src/domain/trade';
import { UserDetails } from 'src/domain/userDetails';
import { TradeRepo } from 'src/repo/tradeRepo';
import { buildMockTradeRepo } from 'src/test/helper';
import {
  RemoveTrade,
  RemoveTradeRequest,
  UnableToRemoveTradeError,
} from './removeTrade';

const dummyOwner = UserDetails.create({
  id: 'ownerId',
  nickname: 'owner',
}).getValue();

const dummyTrader = UserDetails.create({
  id: 'traderId',
  nickname: 'trader',
}).getValue();

const somebodyElse = UserDetails.create({
  id: 'unknownId',
  nickname: 'unknown',
}).getValue();

let useCase: RemoveTrade;
let mockTradeRepo: TradeRepo;

let dummyBook1: Book;
let dummyBook2: Book;
let dummyTrade: Trade;

let request: RemoveTradeRequest;

const buildBook = (params?: Partial<BookProps>, id?: string) => {
  return Book.create(
    {
      title: params.title ?? 'title',
      author: params.author ?? 'author',
      description: params.description ?? 'descr',
      owner: params.owner ?? dummyOwner,
    },
    id,
  ).getValue();
};

beforeEach(() => {
  dummyBook1 = buildBook({ title: 'dummyBook 1', owner: dummyOwner }, 'book1');
  dummyBook2 = buildBook({ title: 'dummyBook 2', owner: dummyTrader }, 'book2');
  dummyTrade = Trade.create({
    owner: dummyOwner,
    trader: dummyTrader,
    ownerBooks: [dummyBook1],
    traderBooks: [dummyBook2],
    status: 'pending',
    createdAt: new Date(),
  }).getValue();

  mockTradeRepo = buildMockTradeRepo({
    findById: jest.fn().mockResolvedValue(Result.ok(dummyTrade)),
    remove: jest.fn().mockResolvedValue(Result.ok('any')),
  });

  useCase = new RemoveTrade(mockTradeRepo);

  request = {
    userId: 'traderId',
    tradeId: 'tradeId',
  };
});

describe('Remove Trade', () => {
  it('should return ok result', async () => {
    const response = await useCase.execute(request);

    expect(response.isRight()).toBe(true);
  });

  it('should remove the trade', async () => {
    await useCase.execute(request);

    expect(mockTradeRepo.remove).toHaveBeenCalled();
  });

  describe("when requested trade status isn't pending", () => {
    beforeEach(() => {
      dummyTrade = Trade.create({
        owner: dummyOwner,
        trader: dummyTrader,
        ownerBooks: [dummyBook1],
        traderBooks: [dummyBook2],
        status: 'rejected',
        createdAt: new Date(),
      }).getValue();

      mockTradeRepo = buildMockTradeRepo({
        save: jest.fn().mockResolvedValue(Result.ok(dummyTrade)),
        findById: jest.fn().mockResolvedValue(Result.ok(dummyTrade)),
      });

      useCase = new RemoveTrade(mockTradeRepo);
    });

    it('should return UnableToRemoveTradeError', async () => {
      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnableToRemoveTradeError);
    });
  });

  describe('when trade not found', () => {
    beforeEach(() => {
      mockTradeRepo = buildMockTradeRepo({
        findById: jest.fn().mockResolvedValue(Result.fail(NOT_FOUND)),
      });

      useCase = new RemoveTrade(mockTradeRepo);
    });

    it('should return EntityNotFoundError', async () => {
      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(EntityNotFoundError);
    });
  });

  describe('when unable to find trade', () => {
    beforeEach(() => {
      mockTradeRepo = buildMockTradeRepo({
        findById: jest.fn().mockResolvedValue(Result.fail('any')),
      });

      useCase = new RemoveTrade(mockTradeRepo);
    });

    it('should return unexpected error', async () => {
      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnexpectedError);
    });
  });

  describe("when user isn't the trade requester", () => {
    beforeEach(() => {
      dummyTrade = Trade.create({
        owner: dummyOwner,
        trader: somebodyElse,
        ownerBooks: [dummyBook1],
        traderBooks: [dummyBook2],
        status: 'pending',
        createdAt: new Date(),
      }).getValue();

      mockTradeRepo = buildMockTradeRepo({
        save: jest.fn().mockResolvedValue(Result.ok(dummyTrade)),
        findById: jest.fn().mockResolvedValue(Result.ok(dummyTrade)),
      });

      useCase = new RemoveTrade(mockTradeRepo);
    });

    it('should return UnableToRemoveTradeError', async () => {
      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnableToRemoveTradeError);
    });
  });

  describe('when unable to remove', () => {
    beforeEach(() => {
      mockTradeRepo = buildMockTradeRepo({
        findById: jest.fn().mockResolvedValue(Result.ok(dummyTrade)),
        remove: jest.fn().mockResolvedValue(Result.fail('any')),
      });

      useCase = new RemoveTrade(mockTradeRepo);
    });

    it('should return unexpected error', async () => {
      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnexpectedError);
    });
  });
});
