import { BookDetails, BookDetailsProps } from 'src/domain/bookDetails';
import { Trade } from 'src/domain/trade';
import { UserDetails, UserDetailsProps } from 'src/domain/userDetails';
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
});
