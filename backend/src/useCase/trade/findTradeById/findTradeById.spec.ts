import { NOT_FOUND } from 'src/constant';
import { Result } from 'src/core/result';
import { EntityNotFoundError, UnexpectedError } from 'src/core/useCaseError';
import { Book, BookProps } from 'src/domain/book';
import { Trade } from 'src/domain/trade';

import { UserDetails } from 'src/domain/userDetails';
import { TradeRepo } from 'src/repo/tradeRepo';
import { buildMockTradeRepo } from 'src/test/helper';
import { FindTradeById, FindTradeByIdRequest } from './findTradeById';

const dummyOwner = UserDetails.create({
  id: 'ownerId',
  nickname: 'owner',
}).getValue();

const dummyTrader = UserDetails.create({
  id: 'traderId',
  nickname: 'trader',
}).getValue();

let useCase: FindTradeById;
let mockTradeRepo: TradeRepo;

let dummyBook1: Book;
let dummyBook2: Book;
let dummyTrade: Trade;

let request: FindTradeByIdRequest;

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
  });

  useCase = new FindTradeById(mockTradeRepo);

  request = {
    tradeId: 'tradeId',
  };
});

describe('Find Trade by Id', () => {
  it('should return dto', async () => {
    const response = await useCase.execute(request);

    expect(response.isRight()).toBe(true);
    expect(response.value).toBeDefined();
  });

  describe('when trade not found', () => {
    beforeEach(() => {
      mockTradeRepo = buildMockTradeRepo({
        findById: jest.fn().mockResolvedValue(Result.fail(NOT_FOUND)),
      });

      useCase = new FindTradeById(mockTradeRepo);
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

      useCase = new FindTradeById(mockTradeRepo);
    });

    it('should return unexpected error', async () => {
      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnexpectedError);
    });
  });
});
