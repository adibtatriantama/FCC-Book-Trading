import type { UserDto } from './userDto';

export type BookDto = {
	id: string;
	title: string;
	author: string;
	description: string;
	owner: UserDto;
};
