import { Result } from 'src/core/result';
import { Book } from 'src/domain/book';

export interface BookRepo {
  findById(bookId: string): Promise<Result<Book>>;
  batchFindById(bookIds: string[]): Promise<Result<Book[]>>;
  findByUserId(userId: string): Promise<Result<Book[]>>;
  findRecent(): Promise<Result<Book[]>>;

  save(book: Book): Promise<Result<Book>>;
  remove(book: Book): Promise<Result<void>>;
}
