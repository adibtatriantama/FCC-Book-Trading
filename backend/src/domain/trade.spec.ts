import { Book } from './book';
import { Trade } from './trade';
import { User } from './user';

const dummyOwner = User.create(
  { nickname: 'owner', email: 'owner.mail.com' },
  'owner-id',
).getValue();

const dummyTrader = User.create(
  { nickname: 'trader', email: 'trader.mail.com' },
  'trader-id',
).getValue();

const buildBook1 = () =>
  Book.create(
    {
      title: 'book1',
      author: 'author1',
      description: 'description1',
      owner: dummyOwner,
    },
    'book1-id',
  ).getValue();

const buildBook2 = () =>
  Book.create(
    {
      title: 'book2',
      author: 'author2',
      description: 'description2',
      owner: dummyTrader,
    },
    'book2-id',
  ).getValue();

describe('Trade', () => {
  let book1: Book;
  let book2: Book;
  let trade: Trade;

  describe('accept', () => {
    beforeEach(() => {
      book1 = buildBook1();
      book2 = buildBook2();

      trade = Trade.create({
        owner: dummyOwner,
        trader: dummyTrader,
        ownerBooks: [book1],
        traderBooks: [book2],
      }).getValue();
    });

    it('should return ok result', () => {
      const acceptResult = trade.accept();

      expect(acceptResult.isSuccess).toBe(true);
    });

    it('should update status', () => {
      trade.accept();

      expect(trade.status).toBe('accepted');
    });

    it('should transfer books ownership', () => {
      trade.accept();

      expect(book1.owner).toBe(dummyTrader);
      expect(book2.owner).toBe(dummyOwner);
    });

    describe("when status isn't pending", () => {
      it('should return fail result', () => {
        book1 = buildBook1();
        book2 = buildBook2();

        trade = Trade.create({
          owner: dummyOwner,
          trader: dummyTrader,
          ownerBooks: [book1],
          traderBooks: [book2],
          status: 'accepted',
        }).getValue();

        const acceptResult = trade.accept();

        expect(acceptResult.isFailure).toBe(true);
      });
    });
  });

  describe('reject', () => {
    beforeEach(() => {
      book1 = buildBook1();
      book2 = buildBook2();

      trade = Trade.create({
        owner: dummyOwner,
        trader: dummyTrader,
        ownerBooks: [book1],
        traderBooks: [book2],
      }).getValue();
    });

    it('should return ok result', () => {
      const rejectResult = trade.reject();

      expect(rejectResult.isSuccess).toBe(true);
    });

    it('should update status', () => {
      trade.reject();

      expect(trade.status).toBe('rejected');
    });

    describe("status isn't pending", () => {
      it('should return fail result', () => {
        book1 = buildBook1();
        book2 = buildBook2();

        trade = Trade.create({
          owner: dummyOwner,
          trader: dummyTrader,
          ownerBooks: [book1],
          traderBooks: [book2],
          status: 'rejected',
        }).getValue();

        const rejectResult = trade.reject();

        expect(rejectResult.isFailure).toBe(true);
      });
    });
  });
});
