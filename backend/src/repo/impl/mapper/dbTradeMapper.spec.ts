import { Book } from 'src/domain/book';
import { Trade } from 'src/domain/trade';
import { UserDetails } from 'src/domain/userDetails';
import { DbTrade } from '../model/dbTrade';
import { DbTradeMapper } from './dbTradeMapper';

const dummyDate = new Date();
const dummyIsoDate = dummyDate.toISOString();

describe('DbTradeMapper', () => {
  describe('toEntity', () => {
    it('should map correctly', () => {
      const dbModel: DbTrade = {
        metadata: {
          PK: 't#t1',
          SK: 'metadata',
          kind: 'Trade',
          id: 't1',
          status: 'pending',
          createdAt: dummyIsoDate,
        },
        tradeItems: [
          {
            PK: 't#t1',
            SK: 'ti#book1',
            GSI1PK: 'u#user1',
            GSI1SK: 't#t1',
            kind: 'Trade Item',
            bookId: 'book1',
            ownerId: 'user1',
            tradeId: 't1',
            title: 'Book 1',
            author: 'author',
            description: 'desc',
          },
          {
            PK: 't#t1',
            SK: 'ti#book2',
            GSI1PK: 'u#user2',
            GSI1SK: 't#t1',
            kind: 'Trade Item',
            bookId: 'book2',
            ownerId: 'user2',
            tradeId: 't1',
            title: 'Book 2',
            author: 'author',
            description: 'desc',
          },
        ],
        bookOwner: {
          PK: 't#t1',
          SK: 'ow#user1',
          GSI1PK: 'ow#user1',
          GSI1SK: 't#t1',
          kind: `Trade's Book Owner`,
          userId: 'user1',
          tradeId: 't1',
          nickname: 'iam user1',
          address: {
            city: 'city',
            state: 'state',
          },
        },
        bookTrader: {
          PK: 't#t1',
          SK: 'tr#user2',
          GSI1PK: 'tr#user2',
          GSI1SK: 't#t1',
          kind: `Trade's Book Trader`,
          userId: 'user2',
          tradeId: 't1',
          nickname: 'iam user2',
          address: {
            city: 'city',
            state: 'state',
          },
        },
      };

      const entity = DbTradeMapper.toEntity(dbModel);

      expect(entity).toStrictEqual(
        Trade.create(
          {
            owner: UserDetails.create({
              id: 'user1',
              nickname: 'iam user1',
              address: {
                city: 'city',
                state: 'state',
              },
            }).getValue(),
            trader: UserDetails.create({
              id: 'user2',
              nickname: 'iam user2',
              address: {
                city: 'city',
                state: 'state',
              },
            }).getValue(),
            ownerBooks: [
              Book.create(
                {
                  title: 'Book 1',
                  author: 'author',
                  description: 'desc',
                  owner: UserDetails.create({
                    id: 'user1',
                    nickname: 'iam user1',
                    address: {
                      city: 'city',
                      state: 'state',
                    },
                  }).getValue(),
                },
                'book1',
              ).getValue(),
            ],
            traderBooks: [
              Book.create(
                {
                  title: 'Book 2',
                  author: 'author',
                  description: 'desc',
                  owner: UserDetails.create({
                    id: 'user2',
                    nickname: 'iam user2',
                    address: {
                      city: 'city',
                      state: 'state',
                    },
                  }).getValue(),
                },
                'book2',
              ).getValue(),
            ],
            createdAt: dummyDate,
          },
          't1',
        ).getValue(),
      );
    });
  });

  describe('toDbModel', () => {
    it('should map correctly', () => {
      const entity = Trade.create(
        {
          owner: UserDetails.create({
            id: 'user1',
            nickname: 'iam user1',
            address: {
              city: 'city',
              state: 'state',
            },
          }).getValue(),
          trader: UserDetails.create({
            id: 'user2',
            nickname: 'iam user2',
            address: {
              city: 'city',
              state: 'state',
            },
          }).getValue(),
          ownerBooks: [
            Book.create(
              {
                title: 'Book 1',
                author: 'author',
                description: 'desc',
                owner: UserDetails.create({
                  id: 'user1',
                  nickname: 'iam user1',
                  address: {
                    city: 'city',
                    state: 'state',
                  },
                }).getValue(),
              },
              'book1',
            ).getValue(),
          ],
          traderBooks: [
            Book.create(
              {
                title: 'Book 2',
                author: 'author',
                description: 'desc',
                owner: UserDetails.create({
                  id: 'user2',
                  nickname: 'iam user2',
                  address: {
                    city: 'city',
                    state: 'state',
                  },
                }).getValue(),
              },
              'book2',
            ).getValue(),
          ],
          createdAt: dummyDate,
        },
        't1',
      ).getValue();

      const dbModel = DbTradeMapper.toDbModel(entity);

      expect(dbModel).toStrictEqual({
        metadata: {
          PK: 't#t1',
          SK: 'metadata',
          kind: 'Trade',
          id: 't1',
          status: 'pending',
          createdAt: dummyIsoDate,
        },
        tradeItems: [
          {
            PK: 't#t1',
            SK: 'ti#book1',
            GSI1PK: 'ti#book1',
            GSI1SK: 't#t1',
            kind: 'Trade Item',
            bookId: 'book1',
            ownerId: 'user1',
            tradeId: 't1',
            title: 'Book 1',
            author: 'author',
            description: 'desc',
          },
          {
            PK: 't#t1',
            SK: 'ti#book2',
            GSI1PK: 'ti#book2',
            GSI1SK: 't#t1',
            kind: 'Trade Item',
            bookId: 'book2',
            ownerId: 'user2',
            tradeId: 't1',
            title: 'Book 2',
            author: 'author',
            description: 'desc',
          },
        ],
        bookOwner: {
          PK: 't#t1',
          SK: 'ow#user1',
          GSI1PK: 'ow#user1',
          GSI1SK: 't#t1',
          kind: `Trade's Book Owner`,
          userId: 'user1',
          tradeId: 't1',
          nickname: 'iam user1',
          address: {
            city: 'city',
            state: 'state',
          },
        },
        bookTrader: {
          PK: 't#t1',
          SK: 'tr#user2',
          GSI1PK: 'tr#user2',
          GSI1SK: 't#t1',
          kind: `Trade's Book Trader`,
          userId: 'user2',
          tradeId: 't1',
          nickname: 'iam user2',
          address: {
            city: 'city',
            state: 'state',
          },
        },
      });
    });
  });
});
