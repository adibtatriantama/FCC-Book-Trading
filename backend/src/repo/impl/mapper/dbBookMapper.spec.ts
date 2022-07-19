import { Book } from 'src/domain/book';
import { UserDetails } from 'src/domain/userDetails';
import { DbBook } from '../model/dbBook';
import { DbBookMapper } from './dbBookMapper';

describe('DbBookMapper', () => {
  describe('toEntity', () => {
    it('should map correctly', () => {
      const dbModel: DbBook = {
        PK: 'book',
        SK: 'b#book1',
        GSI1PK: 'u#user1',
        GSI1SK: 'b#book1',
        kind: 'Book',
        id: 'book1',
        title: 'The Book Number One',
        author: 'author',
        description: 'desc',
        owner: {
          id: 'user1',
          nickname: 'User 1',
          address: {
            city: 'city',
            state: 'state',
          },
        },
      };

      const entity = DbBookMapper.toEntity(dbModel);

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
          },
          'book1',
        ).getValue(),
      );
    });
  });

  describe('toDbModel', () => {
    it('should map correctly', () => {
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
        },
        'book1',
      ).getValue();

      const dbModel = DbBookMapper.toDbModel(entity);

      expect(dbModel).toStrictEqual({
        PK: 'book',
        SK: 'b#book1',
        GSI1PK: 'u#user1',
        GSI1SK: 'b#book1',
        kind: 'Book',
        id: 'book1',
        title: 'The Book Number One',
        author: 'author',
        description: 'desc',
        owner: {
          id: 'user1',
          nickname: 'User 1',
          address: {
            city: 'city',
            state: 'state',
          },
        },
      });
    });
  });
});
