import { NOT_FOUND } from 'src/constant';
import { Result } from 'src/core/result';
import { EntityNotFoundError, UnexpectedError } from 'src/core/useCaseError';
import { Book, BookProps } from 'src/domain/book';
import { Trade } from 'src/domain/trade';
import { User } from 'src/domain/user';
import { TradeRepo } from 'src/repo/tradeRepo';
import {
  RemoveTrade,
  RemoveTradeRequest,
  UnableToRemoveTradeError,
} from './removeTrade';

const dummyOwner = User.create(
  { nickname: 'owner', email: 'owner@mail.com' },
  'ownerId',
).getValue();

const dummyTrader = User.create(
  { nickname: 'trader', email: 'trader@mail.com' },
  'traderId',
).getValue();

const somebodyElse = User.create(
  { nickname: 'unknown', email: 'unknown@mail.com' },
  'unknownId',
).getValue();

let useCase: RemoveTrade;
let mockTradeRepo: TradeRepo;

let dummyBook1: Book;
let dummyBook2: Book;
let dummyTrade: Trade;

let request: RemoveTradeRequest;

const buildMockTradeRepo = (params?: Partial<TradeRepo>) => {
  return {
    save: params?.save ?? jest.fn(),
    findById: params?.findById ?? jest.fn(),
    remove: params?.remove ?? jest.fn(),
    findTradeByOwnerId: params?.findTradeByOwnerId ?? jest.fn(),
    findTradeByTraderId: params?.findTradeByTraderId ?? jest.fn(),
    findTradeByBookId: params?.findTradeByBookId ?? jest.fn(),
    findPendingTradeCountByBookId:
      params?.findPendingTradeCountByBookId ?? jest.fn(),
  };
};

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
  }).getValue();

  mockTradeRepo = buildMockTradeRepo({
    findById: jest.fn().mockResolvedValue(Result.ok(dummyTrade)),
    remove: jest.fn().mockResolvedValue(Result.ok('any')),
  });

  useCase = new RemoveTrade(mockTradeRepo);

  request = {
    userId: 'ownerId',
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
        owner: somebodyElse,
        trader: dummyTrader,
        ownerBooks: [dummyBook1],
        traderBooks: [dummyBook2],
        status: 'pending',
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
