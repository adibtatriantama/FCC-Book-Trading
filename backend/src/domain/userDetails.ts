import { Result } from 'src/core/result';

export type UserDetailsProps = {
  id: string;
  nickname: string;
  address?: {
    city: string;
    state: string;
  };
};

export class UserDetails {
  private constructor(private _props: UserDetailsProps) {}

  static create(props: UserDetailsProps): Result<UserDetails> {
    return Result.ok(new UserDetails(props));
  }

  get id(): string {
    return this._props.id;
  }

  get nickname(): string {
    return this._props.nickname;
  }

  get address(): { city: string; state: string } {
    return this._props.address || { city: '', state: '' };
  }
}
