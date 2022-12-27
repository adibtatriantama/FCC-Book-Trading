import { Book } from 'src/domain/book';
import { UserDetails } from 'src/domain/userDetails';
import { BookType } from 'src/infra/db/onetable';
import { BookMapper } from './bookMapper';

const dummyUser = UserDetails.create({
  nickname: 'tester',
  id: 'testerId',
  address: {
    state: 'state',
    city: 'city',
  },
}).getValue();

describe('BookMapper', () => {
  describe('toDto', () => {
    it('should map correctly', () => {
      const date = new Date();
      const dateString = date.toISOString();

      const book = Book.create(
        {
          title: 'title',
          author: 'author',
          description: 'descr',
          owner: dummyUser,
          createdAt: date,
          updatedAt: date,
          addedAt: date,
        },
        'book1',
      ).getValue();

      const result = BookMapper.toDto(book);

      expect(result).toStrictEqual({
        id: 'book1',
        title: 'title',
        author: 'author',
        description: 'descr',
        owner: {
          nickname: 'tester',
          id: 'testerId',
          address: {
            state: 'state',
            city: 'city',
          },
        },
        createdAt: dateString,
        updatedAt: dateString,
        addedAt: dateString,
      });
    });
  });

  describe('toBook', () => {
    it('should map correctly', () => {
      const date = new Date();
      const bookType: BookType = {
        id: 'book1',
        title: 'The Book Number One',
        author: 'author',
        description: 'desc',
        ownerId: 'user1',
        owner: {
          id: 'user1',
          nickname: 'User 1',
          address: {
            city: 'city',
            state: 'state',
          },
        },
        createdAt: date,
        updatedAt: date,
        addedAt: date,
      };

      const entity = BookMapper.toBook(bookType);

      expect(entity).toStrictEqual(
        Book.create(
          {
            title: 'The Book Number One',
            author: 'author',
            description: 'desc',
            owner: UserDetails.create({
              id: 'user1',
              nickname: 'User 1',
              address: {
                city: 'city',
                state: 'state',
              },
            }).getValue(),
            createdAt: date,
            updatedAt: date,
            addedAt: date,
          },
          'book1',
        ).getValue(),
      );
    });
  });

  describe('toBookType', () => {
    it('should map correctly', () => {
      const date = new Date();
      const entity = Book.create(
        {
          title: 'The Book Number One',
          author: 'author',
          description: 'desc',
          owner: UserDetails.create({
            id: 'user1',
            nickname: 'User 1',
            address: {
              city: 'city',
              state: 'state',
            },
          }).getValue(),
          createdAt: date,
          updatedAt: date,
          addedAt: date,
        },
        'book1',
      ).getValue();

      const dbModel = BookMapper.toBookType(entity);

      expect(dbModel).toEqual({
        id: 'book1',
        title: 'The Book Number One',
        author: 'author',
        description: 'desc',
        ownerId: 'user1',
        owner: {
          id: 'user1',
          nickname: 'User 1',
          address: {
            city: 'city',
            state: 'state',
          },
        },
        createdAt: date,
        updatedAt: date,
        addedAt: date,
      });
    });
  });
});
