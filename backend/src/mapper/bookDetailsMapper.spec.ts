import { BookDetails } from 'src/domain/bookDetails';
import { UserDetails } from 'src/domain/userDetails';
import { BookDetailsMapper } from './bookDetailsMapper';

const dummyUser = UserDetails.create({
  nickname: 'tester',
  id: 'testerId',
  address: {
    state: 'state',
    city: 'city',
  },
}).getValue();

describe('BookDetailsMapper', () => {
  describe('toDto', () => {
    it('should map correctly', () => {
      const book = BookDetails.create({
        id: 'book1',
        title: 'title',
        author: 'author',
        description: 'descr',
        owner: dummyUser,
      });

      const result = BookDetailsMapper.toDto(book);

      expect(result).toStrictEqual({
        id: 'book1',
        title: 'title',
        author: 'author',
        description: 'descr',
        owner: {
          id: 'testerId',
          nickname: 'tester',
          address: {
            state: 'state',
            city: 'city',
          },
        },
      });
    });
  });
});
