import { Book } from 'src/domain/book';
import { User } from 'src/domain/user';
import { BookMapper } from './bookMapper';

const dummyUser = User.create(
  { nickname: 'tester', email: 'tester@mail.com' },
  'testerId',
).getValue();

describe('BookMapper', () => {
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
      },
    });
  });
});
