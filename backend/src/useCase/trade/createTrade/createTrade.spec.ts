import { Result } from 'src/core/result';
import { UnexpectedError } from 'src/core/useCaseError';
import { Book } from 'src/domain/book';
import { Trade } from 'src/domain/trade';
import { UserDetails } from 'src/domain/userDetails';
import { BookRepo } from 'src/repo/bookRepo';
import { TradeRepo } from 'src/repo/tradeRepo';
import { UserRepo } from 'src/repo/userRepo';
import { createMock } from 'ts-auto-mock';
import {
  CreateTrade,
  CreateTradeRequest,
  InvalidBookError,
  UnableToCreateTradeError,
} from './createTrade';

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

let useCase: CreateTrade;
let mockTradeRepo: TradeRepo;
let mockBookRepo: BookRepo;
let mockUserRepo: UserRepo;

let dummyBook1: Book;
let dummyBook2: Book;

let request: CreateTradeRequest;

beforeEach(() => {
  dummyBook1 = createMock<Book>({ owner: dummyOwner });
  dummyBook2 = createMock<Book>({ owner: dummyTrader });
  const dummyTrade = Trade.create({
    decider: dummyOwner,
    requester: dummyTrader,
    deciderBooks: [dummyBook1],
    requesterBook: [dummyBook2],
    status: 'accepted',
    createdAt: new Date(),
    updatedAt: new Date(),
  }).getValue();

  mockTradeRepo = createMock<TradeRepo>({
    save: jest.fn().mockResolvedValue(Result.ok(dummyTrade)),
  });
  mockBookRepo = createMock<BookRepo>({
    batchFindById: jest
      .fn()
      .mockResolvedValueOnce(Result.ok([dummyBook1]))
      .mockResolvedValueOnce(Result.ok([dummyBook2])),
  });
  mockUserRepo = createMock<UserRepo>({
    batchFindById: jest
      .fn()
      .mockResolvedValue(Result.ok([dummyOwner, dummyTrader])),
  });

  useCase = new CreateTrade(mockTradeRepo, mockBookRepo, mockUserRepo);

  request = {
    ownerId: 'ownerId',
    traderId: 'traderId',
    ownerBookIds: ['book1'],
    traderBookIds: ['book2'],
  };
});

describe('CreateTrade', () => {
  it('should return dto', async () => {
    const response = await useCase.execute(request);

    expect(response.isRight()).toBe(true);
    expect(response.value).toBeDefined();
  });

  it('should save the trade', async () => {
    await useCase.execute(request);

    expect(mockTradeRepo.save).toHaveBeenCalled();
  });

  describe('when unable to find user', () => {
    beforeEach(() => {
      mockUserRepo = createMock<UserRepo>({
        batchFindById: jest.fn().mockResolvedValue(Result.fail('any')),
      });

      useCase = new CreateTrade(mockTradeRepo, mockBookRepo, mockUserRepo);
    });

    it('should return unexpected error', async () => {
      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnexpectedError);
    });
  });

  describe('when unable to find book', () => {
    beforeEach(() => {
      mockBookRepo = createMock<BookRepo>({
        batchFindById: jest.fn().mockResolvedValue(Result.fail('any')),
      });

      useCase = new CreateTrade(mockTradeRepo, mockBookRepo, mockUserRepo);
    });

    it('should return unexpected error', async () => {
      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnexpectedError);
    });
  });

  describe('when owner books are no longer his', () => {
    beforeEach(() => {
      dummyBook1 = createMock<Book>({ owner: dummyOther });
      mockBookRepo = createMock<BookRepo>({
        batchFindById: jest
          .fn()
          .mockResolvedValueOnce(Result.ok([dummyBook1]))
          .mockResolvedValueOnce(Result.ok([dummyBook2])),
      });

      useCase = new CreateTrade(mockTradeRepo, mockBookRepo, mockUserRepo);
    });

    it('should return InvalidBookError', async () => {
      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(InvalidBookError);
    });
  });

  describe('when trade with own self', () => {
    beforeEach(() => {
      request = {
        ownerId: 'traderId',
        traderId: 'traderId',
        ownerBookIds: ['book2'],
        traderBookIds: ['book2'],
      };
    });

    it('should return UnableToCreateTradeError', async () => {
      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnableToCreateTradeError);
    });
  });

  describe('when trader books are no longer his', () => {
    beforeEach(() => {
      dummyBook2 = createMock<Book>({ owner: dummyOther });
      mockBookRepo = createMock<BookRepo>({
        batchFindById: jest
          .fn()
          .mockResolvedValueOnce(Result.ok([dummyBook1]))
          .mockResolvedValueOnce(Result.ok([dummyBook2])),
      });

      useCase = new CreateTrade(mockTradeRepo, mockBookRepo, mockUserRepo);
    });

    it('should return InvalidBookError', async () => {
      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(InvalidBookError);
    });
  });

  describe('when unable to save', () => {
    beforeEach(() => {
      mockTradeRepo = createMock<TradeRepo>({
        save: jest.fn().mockResolvedValue(Result.fail('any')),
      });

      useCase = new CreateTrade(mockTradeRepo, mockBookRepo, mockUserRepo);
    });

    it('should return unexpected error', async () => {
      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnexpectedError);
    });
  });
});
