import { Book } from 'src/domain/book';
import { UserDetails } from 'src/domain/userDetails';
import { DB_BOOK, DB_BOOK_PREFIX, DB_USER_PREFIX } from '../constant';
import { DbBook } from '../model/dbBook';

export class DbBookMapper {
  static toEntity(dbBook: Record<string, any>): Book {
    return Book.create(
      {
        title: dbBook.title,
        author: dbBook.author,
        description: dbBook.description,
        owner: UserDetails.create({
          id: dbBook.owner.id,
          nickname: dbBook.owner.nickname,
          address: dbBook.owner.address,
        }).getValue(),
      },
      dbBook.id,
    ).getValue();
  }

  static toDbModel(entity: Book): DbBook {
    return {
      PK: DB_BOOK,
      SK: `${DB_BOOK_PREFIX}${entity.id}`,
      GSI1PK: `${DB_USER_PREFIX}${entity.owner.id}`,
      GSI1SK: `${DB_BOOK_PREFIX}${entity.id}`,
      kind: 'Book',
      id: entity.id,
      title: entity.title,
      author: entity.author,
      description: entity.description,
      owner: {
        id: entity.owner.id,
        nickname: entity.owner.nickname,
        address: entity.owner.address,
      },
    };
  }
}
