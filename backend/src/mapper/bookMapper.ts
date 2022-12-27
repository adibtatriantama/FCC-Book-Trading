import { Book } from 'src/domain/book';
import { BookDetails } from 'src/domain/bookDetails';
import { BookDto } from 'src/dto/bookDto';
import { BookType } from 'src/infra/db/onetable';
import { UserDetailsMapper } from './userDetailsMapper';

export class BookMapper {
  static toDto(book: Book): BookDto {
    return {
      id: book.id,
      title: book.title,
      author: book.author,
      description: book.description,
      owner: UserDetailsMapper.toDto(book.owner),
      createdAt: book.createdAt.toISOString(),
      updatedAt: book.updatedAt.toISOString(),
      addedAt: book.addedAt.toISOString(),
    };
  }

  static toBook(bookType: BookType): Book {
    return Book.create(
      {
        title: bookType.title,
        author: bookType.author,
        description: bookType.description,
        owner: UserDetailsMapper.toUserDetails(bookType.owner),
        createdAt: bookType.createdAt,
        updatedAt: bookType.updatedAt,
        addedAt: bookType.addedAt,
      },
      bookType.id,
    ).getValue();
  }

  static toBookType(entity: Book): BookType {
    return {
      id: entity.id,
      title: entity.title,
      author: entity.author,
      description: entity.description,
      ownerId: entity.owner.id,
      owner: {
        id: entity.owner.id,
        nickname: entity.owner.nickname,
        address: entity.owner.address,
      },
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      addedAt: entity.addedAt,
    };
  }

  static toDetails(book: Book): BookDetails {
    return BookDetails.create({
      id: book.id,
      title: book.title,
      author: book.author,
      description: book.description,
      owner: book.owner,
    });
  }
}
