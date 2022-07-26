import { Result } from '$lib/core/result';
import type { UserDto } from '$lib/dto/userDto';
import { getUser, updateUser } from '$lib/helper/apiHelper';
import { get, writable } from 'svelte/store';

export const userStore = writable<UserDto | null>(null);

export const authState = writable<string>('');

export const loadUser = async (): Promise<Result<void>> => {
	const getUserResult = await getUser();

	if (getUserResult.isSuccess) {
		const user = getUserResult.getValue();
		userStore.set(user);

		return Result.ok();
	} else {
		if (get(userStore)) {
			await logout();
		}

		return Result.fail('unable to load user');
	}
};

export const updateProfile = async (props: {
	nickname: string;
	address: {
		state: string;
		city: string;
	};
}): Promise<Result<void>> => {
	const updateProfileResult = await updateUser(props);

	if (updateProfileResult.isFailure) {
		return Result.fail(updateProfileResult.getErrorValue());
	} else {
		const user = updateProfileResult.getValue();
		userStore.set(user);

		return Result.ok();
	}
};

export const logout = async () => {
	userStore.set(null);
	localStorage.removeItem('token');
};

export const saveToken = (token: string) => {
	localStorage.setItem('token', token);
};
