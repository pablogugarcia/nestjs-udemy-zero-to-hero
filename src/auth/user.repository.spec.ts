import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { User } from './user.entity';
// jest.mock('bcrypt');
import * as bcrypt from 'bcrypt';
import { UserRepository } from './user.repository';

const mockAuthCredentialsDto: AuthCredentialsDto = {
  password: '123',
  username: 'test',
};

describe('UserRepository', () => {
  let userRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserRepository],
    }).compile();

    userRepository = await module.get<UserRepository>(UserRepository);
  });

  describe('signUp', () => {
    let save: jest.Mock<any, any>;

    beforeEach(() => {
      save = jest.fn();
      userRepository.create = jest.fn().mockReturnValue({ save });
    });

    it('successfully signs up the user', () => {
      expect.assertions(1);

      save.mockResolvedValue(undefined);
      return expect(
        userRepository.signUp(mockAuthCredentialsDto),
      ).resolves.not.toThrow();
    });

    it('Trhows a conflict exception as username already exists', () => {
      expect.assertions(1);
      save.mockRejectedValue({ code: '23505' });
      return expect(
        userRepository.signUp(mockAuthCredentialsDto),
      ).rejects.toThrow(ConflictException);
    });

    it('Trhows a internal servr error', () => {
      expect.assertions(1);

      save.mockRejectedValue({ code: '1234' });
      return expect(
        userRepository.signUp(mockAuthCredentialsDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('validateUserPassword', () => {
    let user;

    beforeEach(() => {
      userRepository.findOne = jest.fn();
      user = new User();
      user.username = 'testusername';
      user.validatePassword = jest.fn();
    });
    it('Returns the username as validation is successful', async () => {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(true);
      const result = await userRepository.validateUserPassword(
        mockAuthCredentialsDto,
      );
      expect(result).toEqual('testusername');
    });

    it('Returns null as user cannot be found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const result = await userRepository.validateUserPassword(
        mockAuthCredentialsDto,
      );
      expect(user.validatePassword).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('hashpassword', () => {
    it('calls bcrypt.hash to generate a hash', async () => {
      (bcrypt.hash as any) = jest.fn().mockResolvedValue('testhash');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await userRepository.hashPassword('testpass', 'testsalt');
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(result).toEqual('testhash');
    });
  });
});
