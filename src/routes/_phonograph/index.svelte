<script>
	import { getContext, onDestroy, onMount, setContext } from 'svelte';
	import { fade } from 'svelte/transition';
	import { t } from 'svelte-i18n';
	import { liteMode } from '$lib/stores/app-store';
	import { activeBacksound, musics } from '$lib/stores/phonograph-store';
	import { playSfx } from '$lib/helpers/sounds/audiofx';
	import { nextTrack, pauseTrack, playTrack } from '$lib/helpers/sounds/phonograph';

	import Scrollable from '$lib/components/Scrollable.svelte';
	import ButtonIcon from '$lib/components/ButtonIcon.svelte';
	import Header from '$lib/components/Header.svelte';
	import Background from './_background.svelte';
	import Albums from './_albums.svelte';
	import Tracks from './_tracks.svelte';
	import Controller from './_controller.svelte';
	import ModalTrack from './_modal-track.svelte';
	import { customTracks } from '$lib/helpers/dataAPI/api-localstorage';
	import Modal from '$lib/components/Modal.svelte';

	let detailHeight;
	onMount(() => playSfx('music-loaded'));

	$: bgm = $activeBacksound;
	$: activeTrack = bgm.sourceID;
	$: playedTrack = activeTrack;

	$: activeAlbum = bgm.album;
	$: playedAlbum = activeAlbum;
	$: tracks = $musics.filter(({ album }) => album === playedAlbum);

	setContext('pickAlbum', (selected) => (playedAlbum = selected));
	setContext('pickTrack', (selected) => (playedTrack = selected));

	const setMusic = (sid) => {
		playSfx('music-set');
		const trackData = $musics.find(({ sourceID }) => sourceID === sid);
		activeBacksound.set(trackData);
	};
	setContext('setMusic', setMusic);

	const navigate = getContext('navigate');
	const back = () => {
		playSfx('music-close');
		navigate('index');
	};

	onDestroy(async () => {
		if (playedTrack === activeTrack) return;
		await pauseTrack();
		playTrack(activeTrack);
	});

	// Modal to mange Track
	let showModalAdd = false;
	const handleModal = (val) => (showModalAdd = val);
	setContext('handleModal', handleModal);

	let showModalDelete = false;
	let musicIDToDelete = '';
	const closeModalDelete = () => {
		playSfx('modal-close');
		showModalDelete = false;
	};
	setContext('closeModal', closeModalDelete);

	setContext('deletePrompt', (id) => {
		musicIDToDelete = id;
		showModalDelete = true;
	});

	const confirmDelete = () => {
		playSfx();
		if ($activeBacksound.sourceID === musicIDToDelete) nextTrack();
		musics.update((m) => m.filter((m) => m.sourceID !== musicIDToDelete));
		customTracks.delete(musicIDToDelete);
		musicIDToDelete = '';
		showModalDelete = false;
	};
</script>

<svelte:head>
	<title>{$t('phonograph.heading')} | {$t('title')}</title>
</svelte:head>

<ModalTrack show={showModalAdd} />

{#if showModalDelete}
	<Modal
		title={$t('phonograph.removeTrack')}
		on:confirm={confirmDelete}
		on:cancel={closeModalDelete}
	>
		<div class="deleteTrack">{$t('phonograph.deleteTrack')}</div>
	</Modal>
{/if}

<section transition:fade={{ duration: 250 }} class:lite={$liteMode}>
	<Background />
	<Header icon="phonograph" h2={$t('phonograph.heading')} relative>
		<div class="close">
			<ButtonIcon on:click={back} />
		</div>
	</Header>
	<div class="container">
		<div class="album-list" style="--controlH:{detailHeight}px">
			<Scrollable visibility="hidden">
				<Albums {activeAlbum} {playedAlbum} />
			</Scrollable>
		</div>
		<div class="playlist">
			<Tracks {playedAlbum} {activeTrack} {playedTrack} trackList={tracks} />
		</div>
		<div class="controller" bind:clientHeight={detailHeight}>
			<Controller playedSID={playedTrack} />
		</div>
	</div>
</section>

<style>
	section {
		width: 100%;
		height: 100%;
		position: relative;
	}

	.container {
		padding: 0 2%;
		width: 100%;
		height: 88%;
		display: flex;
		position: relative;
		z-index: +1;
	}

	section:not(.lite) .album-list {
		mask-image: linear-gradient(transparent, black 7%, black 93%, transparent);
	}

	.album-list {
		position: absolute;
		top: 0;
		left: 0;
		width: 30%;
		min-width: 260px;
		height: calc(0.9 * var(--screen-height) - (1.15 * var(--controlH)));
		transition: height 0.25s;
	}

	.playlist {
		margin-left: auto;
		margin-right: 3%;
	}

	.controller {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 45%;
		font-size: 120%;
		padding: 0 0 0 2.75%;
	}

	:global(.mobileLandscape) .container {
		padding: 0 5%;
	}

	@media screen and (max-width: 620px) {
		.container {
			flex-direction: column;
			position: relative;
		}
		.container::after {
			content: '';
			width: 120%;
			height: 120%;
			left: 50%;
			top: 0;
			position: absolute;
			z-index: -1;
			transform: translateX(-50%);
			background-image: linear-gradient(transparent 10%, rgba(0, 0, 0, 1));
		}

		.album-list {
			width: unset;
			min-width: unset;
			position: relative;
			height: unset;
			mask-image: unset;
		}

		.playlist {
			margin-right: 5%;
			margin-left: 0%;
		}

		.controller {
			position: relative;
			width: 100%;
			font-size: 120%;
		}
	}
</style>
