import { Result } from 'src/core/result';
import { UnexpectedError } from 'src/core/useCaseError';
import { BookDetails } from 'src/domain/bookDetails';
import { Trade } from 'src/domain/trade';
import { UserDetails } from 'src/domain/userDetails';
import { TradeRepo } from 'src/repo/tradeRepo';
import { createMock } from 'ts-auto-mock';
import { FindTradeByBook, FindTradeByBookRequest } from './findTradeByBook';

const dummyOwner = UserDetails.create({
  id: 'ownerId',
  nickname: 'owner',
}).getValue();

const dummyTrader = UserDetails.create({
  id: 'traderId',
  nickname: 'trader',
}).getValue();

let useCase: FindTradeByBook;
let mockTradeRepo: TradeRepo;

let dummyBook1: BookDetails;
let dummyBook2: BookDetails;
let dummyTrade: Trade;

let request: FindTradeByBookRequest;

beforeEach(() => {
  dummyBook1 = createMock<BookDetails>({ owner: dummyOwner });
  dummyBook2 = createMock<BookDetails>({ owner: dummyTrader });
  dummyTrade = createMock<Trade>({
    decider: dummyOwner,
    requester: dummyTrader,
    deciderBooks: [dummyBook1],
    requesterBooks: [dummyBook2],
    status: 'pending',
  });

  mockTradeRepo = createMock<TradeRepo>({
    findTradeByBookId: jest.fn().mockResolvedValue(Result.ok([dummyTrade])),
  });

  useCase = new FindTradeByBook(mockTradeRepo);

  request = {
    bookId: 'traderId',
  };
});

describe('Find Trade by Book', () => {
  it('should return dto', async () => {
    const response = await useCase.execute(request);

    expect(response.isRight()).toBe(true);
    expect(response.value).toBeDefined();
  });

  describe('when unable to find trade', () => {
    beforeEach(() => {
      mockTradeRepo = createMock<TradeRepo>({
        findTradeByBookId: jest.fn().mockResolvedValue(Result.fail('any')),
      });

      useCase = new FindTradeByBook(mockTradeRepo);
    });

    it('should return unexpected error', async () => {
      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnexpectedError);
    });
  });
});
