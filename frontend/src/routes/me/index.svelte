<script lang="ts">
	import type { BookDto } from '$lib/dto/bookDto';
	import { getUser } from '$lib/helper/apiHelper';
	import { toastError, toastSuccess } from '$lib/helper/toastHelper';
	import { updateProfile } from '$lib/store/authStore';
	import { onMount } from 'svelte';
	import { derived, writable } from 'svelte/store';

	const searchTitle = writable('');
	const allBooks = writable<BookDto[]>([]);
	const filteredBooks = derived([allBooks, searchTitle], ([$allBooks, $searchTitle]) => {
		const search = $searchTitle.toLowerCase();

		let books: BookDto[] = $allBooks;

		if (search) {
			books = books.filter(
				(book) =>
					book.title.toLowerCase().includes(search) || book.author.toLowerCase().includes(search)
			);
		}

		return books;
	});

	let nickname = '';
	let state = '';
	let city = '';

	onMount(() => {
		loadMyProfile();
	});

	const loadMyProfile = async () => {
		const getProfileResult = await getUser();

		if (getProfileResult.isSuccess) {
			const profile = getProfileResult.getValue();
			nickname = profile.nickname;
			state = profile.address.state;
			city = profile.address.city;
		} else {
			toastError(getProfileResult.getErrorValue());
		}
	};

	const saveNewProfile = async () => {
		const saveNewProfileResult = await updateProfile({
			nickname,
			address: {
				state,
				city
			}
		});

		if (saveNewProfileResult.isSuccess) {
			toastSuccess('Profile updated');
		} else {
			toastError(saveNewProfileResult.getErrorValue());
		}
	};
</script>

<main>
	<section class="container flex justify-center mx-auto mt-16">
		<div class="flex flex-col">
			<h2 class="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-800 text-center">
				My Profile
			</h2>

			<form class="mt-8">
				<div>
					<span class="uppercase text-sm text-gray-600 font-bold"> Nickname </span>
					<input
						bind:value={nickname}
						class="w-full bg-gray-200 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-indigo-400"
						type="text"
						required
					/>
				</div>
				<div class="mt-8">
					<span class="uppercase text-sm text-gray-600 font-bold"> State </span>
					<input
						bind:value={state}
						class="w-full bg-gray-200 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-indigo-400"
						type="text"
						required
					/>
				</div>
				<div class="mt-8">
					<span class="uppercase text-sm text-gray-600 font-bold"> City </span>
					<input
						bind:value={city}
						class="w-full bg-gray-200 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-indigo-400"
						type="text"
						required
					/>
				</div>
				<div class="mt-8">
					<button
						on:click|preventDefault={saveNewProfile}
						class="uppercase text-sm font-bold tracking-wide bg-indigo-500 text-gray-100 p-3 rounded-lg w-full focus:outline-none focus:shadow-outline hover:bg-indigo-700"
						type="submit"
					>
						Save
					</button>
				</div>
			</form>
		</div>
	</section>

	<div style="height: 300px;" />
</main>
