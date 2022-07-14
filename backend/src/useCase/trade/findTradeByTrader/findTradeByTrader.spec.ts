import { Result } from 'src/core/result';
import { UnexpectedError } from 'src/core/useCaseError';
import { Book, BookProps } from 'src/domain/book';
import { Trade } from 'src/domain/trade';
import { User } from 'src/domain/user';
import { TradeRepo } from 'src/repo/tradeRepo';
import {
  FindTradeByTrader,
  FindTradeByTraderRequest,
} from './findTradeByTrader';

const dummyOwner = User.create(
  { nickname: 'owner', email: 'owner@mail.com' },
  'ownerId',
).getValue();

const dummyTrader = User.create(
  { nickname: 'trader', email: 'trader@mail.com' },
  'traderId',
).getValue();

let useCase: FindTradeByTrader;
let mockTradeRepo: TradeRepo;

let dummyBook1: Book;
let dummyBook2: Book;
let dummyTrade: Trade;

let request: FindTradeByTraderRequest;

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
    findTradeByTraderId: jest.fn().mockResolvedValue(Result.ok([dummyTrade])),
  });

  useCase = new FindTradeByTrader(mockTradeRepo);

  request = {
    traderId: 'traderId',
  };
});

describe('Find Trade by Trader', () => {
  it('should return dto', async () => {
    const response = await useCase.execute(request);

    expect(response.isRight()).toBe(true);
    expect(response.value).toBeDefined();
  });

  describe('when unable to find trade', () => {
    beforeEach(() => {
      mockTradeRepo = buildMockTradeRepo({
        findTradeByTraderId: jest.fn().mockResolvedValue(Result.fail('any')),
      });

      useCase = new FindTradeByTrader(mockTradeRepo);
    });

    it('should return unexpected error', async () => {
      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnexpectedError);
    });
  });
});
