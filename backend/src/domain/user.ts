import { Result } from 'src/core/result';

export type UserProps = {
  nickname: string;
  email: string;
  address?: {
    city: string;
    state: string;
  };
};

export class User {
  private constructor(private _props: UserProps, public readonly id: string) {}

  static create(props: UserProps, id: string): Result<User> {
    return Result.ok(new User(props, id));
  }

  get nickname(): string {
    return this._props.nickname;
  }

  get email(): string {
    return this._props.email;
  }

  get address(): { city: string; state: string } {
    return this._props.address || { city: '', state: '' };
  }
}
