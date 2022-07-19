import { NOT_FOUND } from 'src/constant';
import { Result } from 'src/core/result';
import { EntityNotFoundError, UnexpectedError } from 'src/core/useCaseError';
import { Book, BookProps } from 'src/domain/book';
import { Trade } from 'src/domain/trade';
import { UserDetails } from 'src/domain/userDetails';
import { TradeRepo } from 'src/repo/tradeRepo';
import {
  RejectTrade,
  RejectTradeRequest,
  UnableToRejectTradeError,
} from './rejectTrade';

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

let useCase: RejectTrade;
let mockTradeRepo: TradeRepo;

let dummyBook1: Book;
let dummyBook2: Book;
let dummyTrade: Trade;

let request: RejectTradeRequest;

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
    createdAt: new Date(),
  }).getValue();

  mockTradeRepo = buildMockTradeRepo({
    save: jest.fn().mockResolvedValue(Result.ok(dummyTrade)),
    findById: jest.fn().mockResolvedValue(Result.ok(dummyTrade)),
  });

  useCase = new RejectTrade(mockTradeRepo);

  request = {
    userId: 'ownerId',
    tradeId: 'tradeId',
  };
});

describe('Reject Trade', () => {
  it('should return dto', async () => {
    const response = await useCase.execute(request);

    expect(response.isRight()).toBe(true);
    expect(response.value).toBeDefined();
  });

  it('should save the rejected trade', async () => {
    const spy = jest.spyOn(mockTradeRepo, 'save');

    await useCase.execute(request);

    expect(mockTradeRepo.save).toHaveBeenCalled();
    expect(spy.mock.calls[0][0].status).toBe('rejected');
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

      useCase = new RejectTrade(mockTradeRepo);
    });

    it('should return UnableToRejectTradeError', async () => {
      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnableToRejectTradeError);
    });
  });

  describe('when trade not found', () => {
    beforeEach(() => {
      mockTradeRepo = buildMockTradeRepo({
        findById: jest.fn().mockResolvedValue(Result.fail(NOT_FOUND)),
      });

      useCase = new RejectTrade(mockTradeRepo);
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

      useCase = new RejectTrade(mockTradeRepo);
    });

    it('should return unexpected error', async () => {
      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnexpectedError);
    });
  });

  describe("when user isn't the books owner", () => {
    beforeEach(() => {
      dummyTrade = Trade.create({
        owner: somebodyElse,
        trader: dummyTrader,
        ownerBooks: [dummyBook1],
        traderBooks: [dummyBook2],
        status: 'pending',
        createdAt: new Date(),
      }).getValue();

      mockTradeRepo = buildMockTradeRepo({
        save: jest.fn().mockResolvedValue(Result.ok(dummyTrade)),
        findById: jest.fn().mockResolvedValue(Result.ok(dummyTrade)),
      });

      useCase = new RejectTrade(mockTradeRepo);
    });

    it('should return UnableToRejectTradeError', async () => {
      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnableToRejectTradeError);
    });
  });

  describe('when unable to save', () => {
    beforeEach(() => {
      mockTradeRepo = buildMockTradeRepo({
        findById: jest.fn().mockResolvedValue(Result.ok(dummyTrade)),
        save: jest.fn().mockResolvedValue(Result.fail('any')),
      });

      useCase = new RejectTrade(mockTradeRepo);
    });

    it('should return unexpected error', async () => {
      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnexpectedError);
    });
  });
});
