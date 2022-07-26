import { NOT_FOUND } from 'src/constant';
import { Result } from 'src/core/result';
import { EntityNotFoundError, UnexpectedError } from 'src/core/useCaseError';
import { Book } from 'src/domain/book';
import { Trade } from 'src/domain/trade';
import { UserDetails } from 'src/domain/userDetails';
import { TradeRepo } from 'src/repo/tradeRepo';
import { createMock } from 'ts-auto-mock';
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

const dummyOther = UserDetails.create({
  id: 'unknownId',
  nickname: 'unknown',
}).getValue();

let useCase: RejectTrade;
let mockTradeRepo: TradeRepo;

let dummyBook1: Book;
let dummyBook2: Book;
let dummyTrade: Trade;

let request: RejectTradeRequest;

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

      mockTradeRepo = createMock<TradeRepo>({
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
      mockTradeRepo = createMock<TradeRepo>({
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
      mockTradeRepo = createMock<TradeRepo>({
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
        owner: dummyOther,
        trader: dummyTrader,
        ownerBooks: [dummyBook1],
        traderBooks: [dummyBook2],
        status: 'pending',
        createdAt: new Date(),
      }).getValue();

      mockTradeRepo = createMock<TradeRepo>({
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
      mockTradeRepo = createMock<TradeRepo>({
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
