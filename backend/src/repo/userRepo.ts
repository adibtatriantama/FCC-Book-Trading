import { Result } from 'src/core/result';
import { User } from 'src/domain/user';
import { ReadOptions } from './options';

export interface UserRepo {
  findById(userId: string, options?: ReadOptions): Promise<Result<User>>;
  batchFindById(
    userIds: string[],
    options?: ReadOptions,
  ): Promise<Result<User[]>>;

  save(user: User): Promise<Result<User>>;
}
