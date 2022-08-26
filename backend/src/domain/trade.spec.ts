import { Book } from './book';
import { Trade } from './trade';
import { UserDetails } from './userDetails';

const date = new Date();

const dummyOwner = UserDetails.create({
  nickname: 'owner',
  id: 'owner-id',
  address: {
    city: 'city',
    state: 'state',
  },
}).getValue();

const dummyTrader = UserDetails.create({
  nickname: 'trader',
  id: 'trader-id',
  address: {
    city: 'city',
    state: 'state',
  },
}).getValue();

const buildBook1 = () =>
  Book.create(
    {
      title: 'book1',
      author: 'author1',
      description: 'description1',
      owner: dummyOwner,
      createdAt: date,
      updatedAt: date,
      addedAt: date,
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
      createdAt: date,
      updatedAt: date,
      addedAt: date,
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
        decider: dummyOwner,
        requester: dummyTrader,
        deciderBooks: [book1],
        requesterBook: [book2],
        createdAt: new Date(),
        updatedAt: new Date(),
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
          decider: dummyOwner,
          requester: dummyTrader,
          deciderBooks: [book1],
          requesterBook: [book2],
          status: 'accepted',
          createdAt: new Date(),
          updatedAt: new Date(),
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
        decider: dummyOwner,
        requester: dummyTrader,
        deciderBooks: [book1],
        requesterBook: [book2],
        createdAt: new Date(),
        updatedAt: new Date(),
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
          decider: dummyOwner,
          requester: dummyTrader,
          deciderBooks: [book1],
          requesterBook: [book2],
          status: 'rejected',
          createdAt: new Date(),
          updatedAt: new Date(),
        }).getValue();

        const rejectResult = trade.reject();

        expect(rejectResult.isFailure).toBe(true);
      });
    });
  });
});
