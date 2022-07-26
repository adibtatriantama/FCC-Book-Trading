import { Book, BookProps } from 'src/domain/book';
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

const buildBook = (params?: Partial<BookProps>, id?: string) => {
  return Book.create(
    {
      title: params.title ?? 'title',
      author: params.author ?? 'author',
      description: params.description ?? 'descr',
      owner: params.owner,
    },
    id,
  ).getValue();
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
        ownerBooks: [
          buildBook(
            {
              title: 'book1',
              owner,
            },
            'book1',
          ),
        ],
        traderBooks: [
          buildBook(
            {
              title: 'book2',
              owner: trader,
            },
            'book2',
          ),
        ],
        status: 'rejected',
        createdAt: dummyDate,
        acceptedAt: dummyDate,
        owner,
        trader,
      },
      'tradeId',
    ).getValue();

    const result = TradeMapper.toDto(trade);

    expect(result).toStrictEqual({
      id: 'tradeId',
      owner: {
        id: 'ownerId',
        nickname: 'owner',
        address: {
          state: 'state',
          city: 'city',
        },
      },
      trader: {
        id: 'traderId',
        nickname: 'trader',
        address: {
          state: 'state',
          city: 'city',
        },
      },
      ownerBooks: [
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
      traderBooks: [
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
      acceptedAt: dummyIsoDate,
    });
  });
});
