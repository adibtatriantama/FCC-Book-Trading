<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { createPopupWin } from '$lib/helper/createPopup';
	import { loadUser } from '$lib/store/authStore';
	import { onMount } from 'svelte';

	let text = 'Opening Auth Page in Popup...';
	let subtext =
		'Please complete the login process in the opened auth page! This page will reloaded automatically after completion.';

	onMount(() => {
		const returnTo = $page.url.searchParams.get('returnTo') ?? '/';

		if (localStorage.getItem('token')) {
			goto(returnTo);
		} else {
			const baseUrl = $page.url.origin;

			const popupLoginUrl = `${import.meta.env.VITE_AUTH_URL}/login?client_id=${
				import.meta.env.VITE_AUTH_CLIENT_ID
			}&redirect_uri=${baseUrl}/authorizeinpopup&response_type=token`;

			const loginUrl = `${import.meta.env.VITE_AUTH_URL}/login?client_id=${
				import.meta.env.VITE_AUTH_CLIENT_ID
			}&redirect_uri=${baseUrl}/authorize&response_type=token`;

			const popup = createPopupWin(popupLoginUrl, 'Login Window', 500, 600);

			if (!popup) {
				setTimeout(() => {
					text = 'Opening Auth Page...';
					subtext = 'Popup blocked, redirecting to auth page...';
				}, 2000);
				goto(loginUrl);
			}

			window.addEventListener('storage', async () => {
				await loadUser();
				goto(returnTo);
			});
		}
	});
</script>

<main class="container mt-8">
	<h1 class="text-xl text-gray-800">{text}</h1>
	<p class="text-lg text-gray-600 mt-2">{subtext}</p>
</main>
