import { NOT_FOUND } from 'src/constant';
import { Result } from 'src/core/result';
import { EntityNotFoundError, UnexpectedError } from 'src/core/useCaseError';
import { Book } from 'src/domain/book';
import { Trade } from 'src/domain/trade';
import { UserDetails } from 'src/domain/userDetails';
import { TradeRepo } from 'src/repo/tradeRepo';
import { createMock } from 'ts-auto-mock';
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

const dummyOther = UserDetails.create({
  id: 'unknownId',
  nickname: 'unknown',
}).getValue();

let useCase: RemoveTrade;
let mockTradeRepo: TradeRepo;

let dummyBook1: Book;
let dummyBook2: Book;
let dummyTrade: Trade;

let request: RemoveTradeRequest;

beforeEach(() => {
  dummyBook1 = createMock<Book>({ owner: dummyOwner });
  dummyBook2 = createMock<Book>({ owner: dummyTrader });
  dummyTrade = Trade.create({
    owner: dummyOwner,
    trader: dummyTrader,
    ownerBooks: [dummyBook1],
    traderBooks: [dummyBook2],
    status: 'pending',
    createdAt: new Date(),
  }).getValue();

  mockTradeRepo = createMock<TradeRepo>({
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

      mockTradeRepo = createMock<TradeRepo>({
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
      mockTradeRepo = createMock<TradeRepo>({
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
      mockTradeRepo = createMock<TradeRepo>({
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
        trader: dummyOther,
        ownerBooks: [dummyBook1],
        traderBooks: [dummyBook2],
        status: 'pending',
        createdAt: new Date(),
      }).getValue();

      mockTradeRepo = createMock<TradeRepo>({
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
      mockTradeRepo = createMock<TradeRepo>({
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
