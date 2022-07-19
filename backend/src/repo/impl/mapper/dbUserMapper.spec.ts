import { User } from 'src/domain/user';
import { DbUser } from '../model/dbUser';
import { DbUserMapper } from './dbUserMapper';

describe('DbUserMapper', () => {
  describe('toEntity', () => {
    it('should map correctly', () => {
      const dbUser: DbUser = {
        PK: 'u#user1',
        SK: 'metadata',
        kind: 'User',
        id: 'user1',
        nickname: 'iam user1',
        email: 'user1@mail.com',
        address: {
          city: 'city',
          state: 'state',
        },
      };

      const entity = DbUserMapper.toEntity(dbUser);

      expect(entity).toStrictEqual(
        User.create(
          {
            nickname: 'iam user1',
            email: 'user1@mail.com',
            address: {
              city: 'city',
              state: 'state',
            },
          },
          'user1',
        ).getValue(),
      );
    });
  });

  describe('toDbModel', () => {
    it('should map correctly', () => {
      const entity = User.create(
        {
          nickname: 'iam user1',
          email: 'user1@mail.com',
          address: {
            city: 'city',
            state: 'state',
          },
        },
        'user1',
      ).getValue();

      const dbModel = DbUserMapper.toDbModel(entity);

      expect(dbModel).toStrictEqual({
        PK: 'u#user1',
        SK: 'metadata',
        kind: 'User',
        id: 'user1',
        nickname: 'iam user1',
        email: 'user1@mail.com',
        address: {
          city: 'city',
          state: 'state',
        },
      });
    });
  });
});
