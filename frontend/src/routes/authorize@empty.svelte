<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import * as queryString from 'query-string';
	import { saveToken, userStore } from '$lib/store/authStore';
	import { goto } from '$app/navigation';
	import { toasts } from 'svelte-toasts';

	let text = 'Authenticating';

	onMount(async () => {
		if ($userStore) {
			goto('/');
		}
		const parsedHash = queryString.parse($page.url.hash);

		const accessToken = parsedHash.access_token;

		if (typeof accessToken === 'string') {
			saveToken(accessToken);

			text = 'Authentication Complete';

			setTimeout(() => {
				goto('/');
			}, 3000);
		} else {
			toasts.add({
				title: 'Authorization failed',
				description: 'Invalid authorization details',
				duration: 5000,
				type: 'error',
				theme: 'light'
			});

			goto('/');
		}
	});
</script>

<h1 class="text-3xl">{text}</h1>
