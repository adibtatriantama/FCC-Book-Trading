import { Book, BookProps } from 'src/domain/book';
import { Trade } from 'src/domain/trade';
import { User, UserProps } from 'src/domain/user';
import { BookMapper } from './bookMapper';
import { TradeMapper } from './tradeMapper';

const buildUser = (params?: Partial<UserProps>, id?: string) => {
  return User.create(
    {
      nickname: params.nickname ?? 'tester',
      email: params.email ?? 'tester@mail.com',
      address: {
        state: 'state',
        city: 'city',
      },
    },
    id,
  ).getValue();
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
  const owner = buildUser(
    { nickname: 'owner', email: 'owner@mail.com' },
    'ownerId',
  );
  const trader = buildUser(
    { nickname: 'trader', email: 'trader@mail.com' },
    'traderId',
  );

  it('should map correctly', () => {
    const trade = Trade.create(
      {
        ownerBooks: [buildBook({ title: 'book1', owner }, 'book1')],
        traderBooks: [buildBook({ title: 'book2', owner: trader }, 'book2')],
        status: 'rejected',
        owner,
        trader,
      },
      'tradeId',
    ).getValue();

    const result = TradeMapper.toDto(trade);

    expect(result).toStrictEqual({
      id: 'tradeId',
      owner: {
        nickname: 'owner',
        address: {
          state: 'state',
          city: 'city',
        },
      },
      trader: {
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
            nickname: 'trader',
            address: {
              state: 'state',
              city: 'city',
            },
          },
        },
      ],
      status: 'rejected',
    });
  });
});
