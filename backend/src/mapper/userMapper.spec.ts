import { User } from 'src/domain/user';
import { UserDetails } from 'src/domain/userDetails';
import { UserType } from 'src/infra/db/onetable';
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
          createdAt: new Date(),
          updatedAt: new Date(),
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

  describe('toUserType', () => {
    it('should map correctly', () => {
      const createdAt = new Date();
      const updatedAt = new Date();
      const user = User.create(
        {
          nickname: 'tester',
          email: 'tester@mail.com',
          address: {
            state: 'state',
            city: 'city',
          },
          createdAt,
          updatedAt,
        },
        'tester1',
      ).getValue();

      const result = UserMapper.toUserType(user);

      expect(result).toEqual({
        id: 'tester1',
        nickname: 'tester',
        email: 'tester@mail.com',
        address: {
          state: 'state',
          city: 'city',
        },
        createdAt,
        updatedAt,
      });
    });
  });

  describe('toUser', () => {
    it('should map correctly', () => {
      const createdAt = new Date();
      const updatedAt = new Date();
      const userType: UserType = {
        id: 'tester1',
        nickname: 'tester',
        email: 'tester@mail.com',
        address: {
          state: 'state',
          city: 'city',
        },
        createdAt,
        updatedAt,
      };

      const user = UserMapper.toUser(userType);

      expect(user).toStrictEqual(
        User.create(
          {
            nickname: 'tester',
            email: 'tester@mail.com',
            address: {
              state: 'state',
              city: 'city',
            },
            createdAt,
            updatedAt,
          },
          'tester1',
        ).getValue(),
      );
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
          createdAt: new Date(),
          updatedAt: new Date(),
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
