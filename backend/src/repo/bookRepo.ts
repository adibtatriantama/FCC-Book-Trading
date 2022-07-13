import { Result } from 'src/core/result';
import { Book } from 'src/domain/book';

export interface BookRepo {
  findById(bookId: string): Promise<Result<Book>>;

  save(book: Book): Promise<Result<Book>>;
}
