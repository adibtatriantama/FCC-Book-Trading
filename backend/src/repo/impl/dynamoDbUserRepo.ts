import { Model } from 'dynamodb-onetable';
import { NOT_FOUND } from 'src/constant';
import { Result } from 'src/core/result';
import { User } from 'src/domain/user';
import { onetable, UserType } from 'src/infra/db/onetable';
import { UserMapper } from 'src/mapper/userMapper';
import { UserRepo } from '../userRepo';

export class DynamoDbUserRepo implements UserRepo {
  private userModel: Model<UserType>;
  private isDev: boolean;

  constructor() {
    this.userModel = onetable.getModel<UserType>('User');

    this.isDev = process.env.NODE_ENV !== 'production';
  }

  async findById(
    userId: string,
    options = { consistentRead: false },
  ): Promise<Result<User>> {
    try {
      const stats = this.isDev ? {} : undefined;

      const result = await this.userModel.get(
        { id: userId },
        { consistent: options.consistentRead, stats },
      );

      if (stats) {
        console.log(stats);
      }

      if (!result) {
        return Result.fail(NOT_FOUND);
      }

      const user = UserMapper.toUser(result);

      return Result.ok(user);
    } catch (error) {
      console.error(error);
      return Result.fail('unexpected error');
    }
  }

  async batchFindById(
    userIds: string[],
    options = { consistentRead: false },
  ): Promise<Result<User[]>> {
    try {
      const stats = this.isDev ? {} : undefined;
      const users: User[] = [];

      // Map Entries: Maximum number of 100 items. https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchGetItem.html
      for (let i = 0; i < userIds.length; i += 100) {
        const userIdsSlice = userIds.slice(i, i + 100);
        const batch = {};

        for (const userId of userIdsSlice) {
          await this.userModel.get({ id: userId }, { batch });
        }

        const result = await onetable.batchGet(batch, {
          consistent: options.consistentRead,
          stats,
        });

        if (stats) {
          console.log(stats);
        }

        users.push(...(result as UserType[]).map(UserMapper.toUser));
      }

      return Result.ok(users);
    } catch (error) {
      console.error(error);
      return Result.fail('unexpected error');
    }
  }

  async save(user: User): Promise<Result<User>> {
    try {
      const stats = this.isDev ? {} : undefined;

      const result = await this.userModel.create(UserMapper.toUserType(user), {
        stats,
      });

      if (stats) {
        console.log(stats);
      }

      const createdUser = UserMapper.toUser(result);

      return Result.ok(createdUser);
    } catch (error) {
      console.error(error);
      return Result.fail('unexpected error');
    }
  }
}
