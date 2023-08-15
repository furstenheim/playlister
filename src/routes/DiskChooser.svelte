<script lang="ts">

  import { isNil } from '$lib/utils'
  import { type AccessToken, type Album } from '@spotify/web-api-ts-sdk'
  import { type Artist } from '@spotify/web-api-ts-sdk/src/types'
  import { searchAlbums } from '$lib/spotify'

  export let artist: Artist
  export let accessToken: AccessToken
  let albums: Album[]
  $: albums = []
  let isLoading: boolean
  let errorMessage: string | null
  $: errorMessage = null
  $: isLoading = true
  console.log('Loading')

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

</script>

{#if isLoading}
  <div class="loader"></div>
{:else if !isNil(errorMessage)}
  <p class="error-message">{errorMessage}</p>
{:else}
  <div class="album-container">
    {#each albums as album (album.id)}
      <div class="album">
        <p class="album-title">
          {album.name}
        </p>
      </div>
    {/each}
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

  .album-title {
      align-self: center;
      font-size: 0.8rem;

      /**Major Properties**/
      overflow:hidden;
      line-height: 1rem;
      max-height: 2rem;
      -webkit-box-orient: vertical;
      display: block;
      display: -webkit-box;
      text-overflow: ellipsis;
      -webkit-line-clamp: 2;
      margin: 0px;
  }
</style>
