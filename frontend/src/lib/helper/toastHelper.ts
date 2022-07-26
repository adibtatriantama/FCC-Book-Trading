import { toasts } from 'svelte-toasts';

export const toastSuccess = (message: string) => {
	toasts.add({
		title: 'Success',
		description: message,
		duration: 5000,
		type: 'success',
		theme: 'light'
	});
};

export const toastError = (message: string) => {
	toasts.add({
		title: 'Error',
		description: message,
		duration: 5000,
		type: 'error',
		theme: 'light'
	});
};
