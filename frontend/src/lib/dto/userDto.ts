export type UserDto = {
	id: string;
	nickname: string;
	address: {
		city: string;
		state: string;
	};
};
