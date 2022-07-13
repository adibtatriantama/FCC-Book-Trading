import { User } from 'src/domain/user';
import { UserMapper } from './userMapper';

describe('UserMapper', () => {
  describe('toDto', () => {
    it('should map correctly', () => {
      const user = User.create(
        {
          nickname: 'tester',
          email: 'tester@mail.com',
          address: {
            state: 'state',
            city: 'city',
          },
        },
        'tester1',
      ).getValue();

      const result = UserMapper.toDto(user);

      expect(result).toStrictEqual({
        nickname: 'tester',
        address: {
          state: 'state',
          city: 'city',
        },
      });
    });
  });
});
