import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';

describe('RegisterDto password policy', () => {
  it('rejects weak passwords', async () => {
    const dto = Object.assign(new RegisterDto(), {
      email: 'user@example.com',
      password: 'password',
      displayName: 'Alex Dupont',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'password')).toBe(true);
  });

  it('accepts strong passwords', async () => {
    const dto = Object.assign(new RegisterDto(), {
      email: 'user@example.com',
      password: 'ValidPassword123',
      displayName: 'Alex Dupont',
    });

    const errors = await validate(dto);

    expect(errors.filter((error) => error.property === 'password')).toEqual([]);
  });
});
