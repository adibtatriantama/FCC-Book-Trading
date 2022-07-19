import { Book } from 'src/domain/book';
import { UserDetails } from 'src/domain/userDetails';
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
      const book = Book.create(
        {
          title: 'title',
          author: 'author',
          description: 'descr',
          owner: dummyUser,
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
      });
    });
  });
});
