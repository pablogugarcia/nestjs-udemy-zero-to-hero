import * as bcrypt from 'bcrypt';
import { User } from './user.entity';

describe('user entity', () => {
  describe('validatePassword', () => {
    let user: User;

    beforeEach(() => {
      user = new User();
      user.password = 'testpass';
      user.salt = 'testsalt';
      (bcrypt.hash as jest.Mock) = jest.fn();
    });

    it('returns true as password valid', async () => {
      (bcrypt.hash as jest.Mock).mockReturnValue('testpass');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await user.validatePassword('123');
      expect(bcrypt.hash).toHaveBeenCalledWith('123', 'testsalt');
      expect(result).toBeTruthy();
    });
    it('returns false as password invalid', async () => {
      (bcrypt.hash as jest.Mock).mockReturnValue('wrongpass');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await user.validatePassword('wrongpass');
      expect(bcrypt.hash).toHaveBeenCalledWith('wrongpass', 'testsalt');
      expect(result).toBeFalsy();
    });
  });
});
