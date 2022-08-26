import { BookDetails } from 'src/domain/bookDetails';
import { BookDetailsDto } from 'src/dto/bookDetailsDto';
import { UserDetailsMapper } from './userDetailsMapper';

export class BookDetailsMapper {
  static toDto(bookDetails: BookDetails): BookDetailsDto {
    return {
      id: bookDetails.id,
      title: bookDetails.title,
      author: bookDetails.author,
      description: bookDetails.description,
      owner: UserDetailsMapper.toDto(bookDetails.owner),
    };
  }
}
