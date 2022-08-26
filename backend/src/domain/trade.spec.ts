import { BookDetails } from './bookDetails';
import { Trade } from './trade';
import { UserDetails } from './userDetails';

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
  BookDetails.create({
    id: 'book1-id',
    title: 'book1',
    author: 'author1',
    description: 'description1',
    owner: dummyOwner,
  });

const buildBook2 = () =>
  BookDetails.create({
    id: 'book2-id',
    title: 'book2',
    author: 'author2',
    description: 'description2',
    owner: dummyTrader,
  });

describe('Trade', () => {
  let book1: BookDetails;
  let book2: BookDetails;
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

    it('should flag bookOwnershipChanged', () => {
      trade.accept();

      expect(trade.isBookOwnershipChanged).toBe(true);
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
