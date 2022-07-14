import { Result } from 'src/core/result';
import { UnexpectedError } from 'src/core/useCaseError';
import { Book, BookProps } from 'src/domain/book';
import { Trade } from 'src/domain/trade';
import { User } from 'src/domain/user';
import { BookRepo } from 'src/repo/bookRepo';
import { TradeRepo } from 'src/repo/tradeRepo';
import { UserRepo } from 'src/repo/userRepo';
import {
  CreateTrade,
  CreateTradeRequest,
  InvalidBookError,
} from './createTrade';

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

let useCase: CreateTrade;
let mockTradeRepo: TradeRepo;
let mockBookRepo: BookRepo;
let mockUserRepo: UserRepo;

let dummyBook1: Book;
let dummyBook2: Book;

let request: CreateTradeRequest;

const buildMockTradeRepo = (params?: Partial<TradeRepo>) => {
  return {
    save: params?.save ?? jest.fn(),
    findById: params?.findById ?? jest.fn(),
  };
};

const buildMockBookRepo = (params?: Partial<BookRepo>) => {
  return {
    save: params?.save ?? jest.fn(),
    findById: params?.findById ?? jest.fn(),
    batchFindById: params?.batchFindById ?? jest.fn(),
  };
};

const buildMockUserRepo = (params?: Partial<UserRepo>) => {
  return {
    findById: params?.findById ?? jest.fn(),
    batchFindById: params?.batchFindById ?? jest.fn(),
    save: params?.save ?? jest.fn(),
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
  const dummyTrade = Trade.create({
    owner: dummyOwner,
    trader: dummyTrader,
    ownerBooks: [dummyBook1],
    traderBooks: [dummyBook2],
    status: 'accepted',
  }).getValue();

  mockTradeRepo = buildMockTradeRepo({
    save: jest.fn().mockResolvedValue(Result.ok(dummyTrade)),
  });
  mockBookRepo = buildMockBookRepo({
    batchFindById: jest
      .fn()
      .mockResolvedValueOnce(Result.ok([dummyBook1]))
      .mockResolvedValueOnce(Result.ok([dummyBook2])),
  });
  mockUserRepo = buildMockUserRepo({
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
      mockUserRepo = buildMockUserRepo({
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
      mockBookRepo = buildMockBookRepo({
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
      dummyBook1 = buildBook(
        { title: 'dummyBook 1', owner: somebodyElse },
        'book1',
      );
      mockBookRepo = buildMockBookRepo({
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

  describe('when trader books are no longer his', () => {
    beforeEach(() => {
      dummyBook2 = buildBook(
        { title: 'dummyBook 1', owner: somebodyElse },
        'book1',
      );
      mockBookRepo = buildMockBookRepo({
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
      mockTradeRepo = buildMockTradeRepo({
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
