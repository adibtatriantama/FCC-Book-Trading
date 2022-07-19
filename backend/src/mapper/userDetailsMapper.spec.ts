import { UserDetails } from 'src/domain/userDetails';
import { UserDetailsMapper } from './userDetailsMapper';

describe('UserDetailsMapper', () => {
  describe('toDto', () => {
    it('should map correctly', () => {
      const user = UserDetails.create({
        id: 'tester1',
        nickname: 'tester',
        address: {
          state: 'state',
          city: 'city',
        },
      }).getValue();

      const result = UserDetailsMapper.toDto(user);

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
});
