<script lang="ts">

  import { isNil } from '$lib/utils'
  import { chunk, orderBy, partition } from 'lodash-es'
  import { type AccessToken, type SimplifiedAlbum } from '@spotify/web-api-ts-sdk'
  import { type Artist } from '@spotify/web-api-ts-sdk/src/types'
  import { addItemsToPlaylist, createPlaylist, dedupeTracks, searchAlbums, searchTracks } from '$lib/spotify'
  import type { UserProfile } from '$lib/types/spotify'

  export let profile: UserProfile
  export let artist: Artist
  export let accessToken: AccessToken

  let playlistName = artist.name

  let albums: SimplifiedAlbum[]
  $: albums = []
  let isLoading: boolean
  let errorMessage: string | null
  $: errorMessage = null
  $: isLoading = true

  let nonSelectedAlbums: Record<string, boolean>
  $: nonSelectedAlbums = {}

  async function loading (): Promise<void> {
    try {
      albums = await searchAlbums(accessToken, artist)
    } catch (e) {
      errorMessage = e.message
    } finally {
      isLoading = false
    }
  }

  void loading()

  function handleClick (albumId: string): void {
    nonSelectedAlbums[albumId] = !(nonSelectedAlbums[albumId] ?? false)
  }

  let isGeneratingList: boolean
  $: isGeneratingList = false
  let generatingListErrorMessage: string | null
  $: generatingListErrorMessage = null
  let generatingPercentage: number
  $: generatingPercentage = 0
  let isSuccessList: boolean
  $: isSuccessList = false
  async function generateList (): Promise<void> {
    const tracks = []
    try {
      isGeneratingList = true
      generatingPercentage = 0
      // sort by date desc so we prioritize older versions
      const albumsByDate = orderBy(albums, 'release_date', 'desc')
      for (const album of albumsByDate) {
        if (nonSelectedAlbums[album.id]) {
          generatingPercentage += 1 / albums.length
          continue
        }

        console.log('selected', album)
        const albumTracks = await searchTracks(accessToken, album)
        tracks.push(...albumTracks)
      }
      const [selected, nonSelected] = partition(dedupeTracks(tracks), 'selected')
      generatingPercentage = 0
      const groupsOfSongs = chunk(selected, 100)
      const playlist = await createPlaylist(accessToken, profile.id, playlistName)

      console.log('nonselected', nonSelected)
      console.log('selected', selected)
      for (const group of groupsOfSongs) {
        console.log(group)
        await addItemsToPlaylist(accessToken, playlist, group.map(s => s.track))
        generatingPercentage += 1 / groupsOfSongs.length
      }
      isSuccessList = true
    } catch (e) {
      generatingListErrorMessage = e.message
    } finally {
      isGeneratingList = false
    }
  }

</script>

{#if isLoading}
  <div class="loader"></div>
{:else if !isNil(errorMessage)}
  <p class="error-message">{errorMessage}</p>
{:else}
  <div class="album-container">
    {#each albums as album (album.id)}
      <div class="album {nonSelectedAlbums[album.id] ? '' : 'album--selected'}" on:click={() => { handleClick(album.id) }}>
        <p class="album-title">
          {album.name}
        </p>
      </div>
    {/each}
  </div>

  <div>
    <p style="font-weight: bold">Playlist Name</p>
    <input type="text" bind:value="{playlistName}">
    <button class="generate-playlist" on:click={generateList}>Generate</button>
    {#if isGeneratingList}
      {(generatingPercentage * 100).toFixed(0) + '%'}
    {/if}
    { #if !isNil(generatingListErrorMessage)}
      <p class="error-message">{generatingListErrorMessage}</p>
    {/if}
    {#if isSuccessList}
      <p class="success-message">Success</p>
    {/if}
  </div>

{/if}

<style>
  .loader {
      border: 4px solid #f3f3f3; /* Light grey */
      border-top: 4px solid #3498db; /* Blue */
      border-radius: 50%;
      width: 15px;
      height: 15px;
      animation: spin 2s linear infinite;
  }

  @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
  }

  .error-message {
      color: darkred;
  }

  .album-container {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      padding: 4px;
  }

  .album {
      flex-grow: 1;
      flex-basis: calc(20% - 8px) ;
      display: flex;
      margin: 2px;
      padding: 2px 2px 2px 2px;
      background: lightgrey;
      border-radius: 2px;
      border: 1px groove dimgray;
      height: 40px;
      text-align: center;
      justify-content: center;
  }

  .album:hover {
      transform: scale(1.01, 1.01);
  }

  .album--selected {
    border: 2px groove dimgray;
  }

  .album-title {
      align-self: center;
      font-size: 0.8rem;

      overflow:hidden;
      line-height: 1rem;
      max-height: 2rem;
      -webkit-box-orient: vertical;
      display: block;
      display: -webkit-box;
      text-overflow: ellipsis;
      -webkit-line-clamp: 2;
      margin: 0px;
      user-select: none;
  }

  .generate-playlist {
      background: dodgerblue;
      color: white;
      border-radius: 2px;
      border: 2px groove dodgerblue;
  }

  .generate-playlist:hover {
      transform: scale(1.01, 1.01);
  }

  .success-message {
      color: green;
      font-weight: bold;
  }

</style>
