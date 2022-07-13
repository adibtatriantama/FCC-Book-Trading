import { Result } from 'src/core/result';
import { User } from 'src/domain/user';

export interface UserRepo {
  findById(userId: string): Promise<Result<User>>;

  save(user: User): Promise<Result<User>>;
}
