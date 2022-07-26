<script lang="ts">
	import { goto } from '$app/navigation';

	import { addBook } from '$lib/helper/apiHelper';
	import { toastError, toastSuccess } from '$lib/helper/toastHelper';

	let title = '';
	let author = '';
	let description = '';

	const submit = async () => {
		const response = await addBook({
			title,
			author,
			description
		});

		if (response.isFailure) {
			toastError(response.getErrorValue());
		} else {
			toastSuccess('Book added successfully');
			goto('/me/book');
		}
	};
</script>

<main class="max-w-lg mt-8 mx-auto">
	<h1 class="text-2xl text-gray-800">Add Book</h1>
	<form class="mt-8">
		<div>
			<span class="uppercase text-sm text-gray-600 font-bold"> Title </span>
			<input
				bind:value={title}
				class="w-full bg-gray-200 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-indigo-400"
				type="text"
				placeholder="Enter the title"
				required
			/>
		</div>
		<div class="mt-8">
			<span class="uppercase text-sm text-gray-600 font-bold"> Author </span>
			<input
				bind:value={author}
				class="w-full bg-gray-200 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-indigo-400"
				type="text"
				placeholder="Enter the author"
				required
			/>
		</div>
		<div class="mt-8">
			<span class="uppercase text-sm text-gray-600 font-bold"> Description </span>
			<textarea
				bind:value={description}
				class="w-full h-32 bg-gray-200 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-indigo-400"
				placeholder="Enter the description"
				required
			/>
		</div>
		<div class="mt-8">
			<button
				on:click|preventDefault={submit}
				class="uppercase text-sm font-bold tracking-wide bg-indigo-500 text-gray-100 p-3 rounded-lg w-full focus:outline-none focus:shadow-outline hover:bg-indigo-700"
				type="submit"
			>
				Add Book
			</button>
		</div>
	</form>
</main>
