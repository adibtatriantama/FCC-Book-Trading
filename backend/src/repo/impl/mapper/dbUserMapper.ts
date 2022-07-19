import { User } from 'src/domain/user';
import { DB_METADATA, DB_USER_PREFIX } from '../constant';
import { DbUser } from '../model/dbUser';

export class DbUserMapper {
  static toEntity(dbUser: Record<string, any>): User {
    return User.create(
      {
        nickname: dbUser.nickname,
        email: dbUser.email,
        address: dbUser.address,
      },
      dbUser.id,
    ).getValue();
  }

  static toDbModel(entity: User): DbUser {
    return {
      PK: `${DB_USER_PREFIX}${entity.id}`,
      SK: DB_METADATA,
      kind: 'User',
      id: entity.id,
      nickname: entity.nickname,
      email: entity.email,
      address: entity.address,
    };
  }
}
