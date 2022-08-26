import { Book } from 'src/domain/book';
import { BookDetails } from 'src/domain/bookDetails';
import { BookDto } from 'src/dto/bookDto';
import { UserDetailsMapper } from './userDetailsMapper';

export class BookMapper {
  static toDto(book: Book): BookDto {
    return {
      id: book.id,
      title: book.title,
      author: book.author,
      description: book.description,
      owner: UserDetailsMapper.toDto(book.owner),
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
