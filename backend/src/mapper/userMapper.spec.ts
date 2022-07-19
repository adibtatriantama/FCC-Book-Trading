import { User } from 'src/domain/user';
import { UserDetails } from 'src/domain/userDetails';
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
        id: 'tester1',
        nickname: 'tester',
        address: {
          state: 'state',
          city: 'city',
        },
      });
    });
  });

  describe('toDetails', () => {
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

      const result = UserMapper.toDetails(user);

      expect(result).toStrictEqual(
        UserDetails.create({
          id: 'tester1',
          nickname: 'tester',
          address: {
            state: 'state',
            city: 'city',
          },
        }).getValue(),
      );
    });
  });
});
