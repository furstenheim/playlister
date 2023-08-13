<script lang="ts">

  import type { UserProfile } from '$lib/types/spotify'
  import { debounce } from '$lib/utils'
  import type { FormEventHandler } from 'svelte/elements'
  import { type AccessToken } from '@spotify/web-api-ts-sdk'
  import { searchArtists } from '$lib/spotify'

  export let profile: UserProfile
  export let token: AccessToken
  let name: string
  $: name = profile.display_name

  const handleInput = debounce(async function (event: { target: EventTarget & HTMLInputElement }) {
    const query = event.target.value
    console.log(query)
    await searchArtists(token, query)
  }, 100) as unknown as FormEventHandler<HTMLInputElement> // formateventhandler expects current target but we will receive target since it is not immediately processed
</script>

<p>Welcome {name}</p>

<input on:input={handleInput} type="text">
