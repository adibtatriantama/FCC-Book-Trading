import { BookDetails, BookDetailsProps } from 'src/domain/bookDetails';
import { Trade } from 'src/domain/trade';
import { UserDetails, UserDetailsProps } from 'src/domain/userDetails';
import { TradeTypes } from 'src/infra/db/onetable';
import { TradeMapper } from './tradeMapper';

const dummyDate = new Date();
const dummyIsoDate = dummyDate.toISOString();

const buildUserDetails = (params?: Partial<UserDetailsProps>): UserDetails => {
  return UserDetails.create({
    id: params.id ?? 'id',
    nickname: params.nickname ?? 'tester',
    address: params.address ?? {
      state: 'state',
      city: 'city',
    },
  }).getValue();
};

const buildBook = (params?: Partial<BookDetailsProps>) => {
  return BookDetails.create({
    id: params.id,
    title: params.title ?? 'title',
    author: params.author ?? 'author',
    description: params.description ?? 'descr',
    owner: params.owner,
  });
};

describe('TradeMapper', () => {
  const owner = buildUserDetails({
    id: 'ownerId',
    nickname: 'owner',
  });

  const trader = buildUserDetails({
    id: 'traderId',
    nickname: 'trader',
  });

  it('should map correctly', () => {
    const trade = Trade.create(
      {
        deciderBooks: [
          buildBook({
            id: 'book1',
            title: 'book1',
            owner,
          }),
        ],
        requesterBooks: [
          buildBook({
            id: 'book2',
            title: 'book2',
            owner: trader,
          }),
        ],
        status: 'rejected',
        createdAt: dummyDate,
        updatedAt: dummyDate,
        decider: owner,
        requester: trader,
      },
      'tradeId',
    ).getValue();

    const result = TradeMapper.toDto(trade);

    expect(result).toEqual({
      id: 'tradeId',
      decider: {
        id: 'ownerId',
        nickname: 'owner',
        address: {
          state: 'state',
          city: 'city',
        },
      },
      requester: {
        id: 'traderId',
        nickname: 'trader',
        address: {
          state: 'state',
          city: 'city',
        },
      },
      deciderBooks: [
        {
          id: 'book1',
          title: 'book1',
          author: 'author',
          description: 'descr',
          owner: {
            id: 'ownerId',
            nickname: 'owner',
            address: {
              state: 'state',
              city: 'city',
            },
          },
        },
      ],
      requesterBooks: [
        {
          id: 'book2',
          title: 'book2',
          author: 'author',
          description: 'descr',
          owner: {
            id: 'traderId',
            nickname: 'trader',
            address: {
              state: 'state',
              city: 'city',
            },
          },
        },
      ],
      status: 'rejected',
      createdAt: dummyIsoDate,
      updatedAt: dummyIsoDate,
    });
  });

  describe('toTrade', () => {
    const tradeTypes: TradeTypes = {
      metadata: {
        id: 't1',
        status: 'accepted',
        createdAt: dummyDate,
        updatedAt: dummyDate,
        acceptedAt: dummyDate,
      },
      requesterBooks: [
        {
          ownerId: 'user1',
          tradeId: 't1',
          bookId: 'book1',
          book: {
            id: 'book1',
            title: 'Book 1',
            author: 'author',
            description: 'desc',
          },
        },
      ],
      deciderBooks: [
        {
          ownerId: 'user2',
          tradeId: 't1',
          bookId: 'book2',
          book: {
            id: 'book2',
            title: 'Book 2',
            author: 'author',
            description: 'desc',
          },
        },
      ],
      requester: {
        tradeId: 't1',
        userId: 'user1',
        user: {
          id: 'user1',
          nickname: 'iam user1',
          address: {
            city: 'city',
            state: 'state',
          },
        },
      },
      decider: {
        tradeId: 't1',
        userId: 'user2',
        user: {
          id: 'user2',
          nickname: 'iam user2',
          address: {
            city: 'city',
            state: 'state',
          },
        },
      },
    };

    const entity = TradeMapper.toTrade(tradeTypes);

    expect(entity).toStrictEqual(
      Trade.create(
        {
          status: 'accepted',
          requester: UserDetails.create({
            id: 'user1',
            nickname: 'iam user1',
            address: {
              city: 'city',
              state: 'state',
            },
          }).getValue(),
          decider: UserDetails.create({
            id: 'user2',
            nickname: 'iam user2',
            address: {
              city: 'city',
              state: 'state',
            },
          }).getValue(),
          requesterBooks: [
            BookDetails.create({
              id: 'book1',
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
            }),
          ],
          deciderBooks: [
            BookDetails.create({
              id: 'book2',
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
            }),
          ],
          acceptedAt: dummyDate,
          createdAt: dummyDate,
          updatedAt: dummyDate,
        },
        't1',
      ).getValue(),
    );
  });
});
