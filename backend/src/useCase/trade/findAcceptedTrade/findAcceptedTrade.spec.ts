import { Result } from 'src/core/result';
import { UnexpectedError } from 'src/core/useCaseError';
import { Book, BookProps } from 'src/domain/book';
import { Trade } from 'src/domain/trade';
import { UserDetails } from 'src/domain/userDetails';
import { TradeRepo } from 'src/repo/tradeRepo';
import { buildMockTradeRepo } from 'src/test/helper';
import { FindAcceptedTrade } from './findAcceptedTrade';

const dummyOwner = UserDetails.create({
  id: 'ownerId',
  nickname: 'owner',
}).getValue();

const dummyTrader = UserDetails.create({
  id: 'traderId',
  nickname: 'trader',
}).getValue();

let useCase: FindAcceptedTrade;
let mockTradeRepo: TradeRepo;

let dummyBook1: Book;
let dummyBook2: Book;
let dummyTrade: Trade;

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
    findAcceptedTrade: jest.fn().mockResolvedValue(Result.ok([dummyTrade])),
  });

  useCase = new FindAcceptedTrade(mockTradeRepo);
});

describe('Find Accepted Trade', () => {
  it('should return dto', async () => {
    const response = await useCase.execute();

    expect(response.isRight()).toBe(true);
    expect(response.value).toBeDefined();
  });

  describe('when unable to find trade', () => {
    beforeEach(() => {
      mockTradeRepo = buildMockTradeRepo({
        findAcceptedTrade: jest.fn().mockResolvedValue(Result.fail('any')),
      });

      useCase = new FindAcceptedTrade(mockTradeRepo);
    });

    it('should return unexpected error', async () => {
      const response = await useCase.execute();

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnexpectedError);
    });
  });
});