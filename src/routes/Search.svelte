<script lang="ts">

  import type { UserProfile } from '$lib/types/spotify'
  import { debounce } from '$lib/utils'
  import type { FormEventHandler } from 'svelte/elements'
  import { type AccessToken } from '@spotify/web-api-ts-sdk'
  import { searchArtists } from '$lib/spotify'
  import { type Artist } from '@spotify/web-api-ts-sdk/src/types'
  import ArtistPreview from './ArtistPreview.svelte'

  export let profile: UserProfile
  export let token: AccessToken
  let name: string
  $: name = profile.display_name
  let artists: Artist[]
  $: artists = []

  const handleInput = debounce(async function (event: { target: EventTarget & HTMLInputElement }) {
    const query = event.target.value
    console.log(query)
    if (query !== '') {
      ({ items: artists } = await searchArtists(token, query))
    }
  }, 100) as unknown as FormEventHandler<HTMLInputElement> // formateventhandler expects current target but we will receive target since it is not immediately processed
</script>

<p>Welcome {name}</p>

<input on:input={handleInput} type="text">

<ul style="list-style-type: none; padding-left: 0">
  {#each artists.slice(0, 10) as artist (artist.id)}
    <li>
      <ArtistPreview artist="{artist}" accessToken="{token}"></ArtistPreview>
    </li>
  {/each}

</ul>
