<script lang="ts">

  import type { UserProfile } from '$lib/types/spotify'
  import { debounce } from '$lib/utils'
  import type {FormEventHandler} from 'svelte/elements'

  export let profile: UserProfile
  let name: string
  $: name = profile.display_name

  const handleInput = debounce(function (event: { target: EventTarget & HTMLInputElement }) {
    console.log(event.target.value)
  }, 100) as unknown as FormEventHandler<HTMLInputElement> // formateventhandler expects current target but we will receive target since it is not immediately processed
</script>

<p>Welcome {name}</p>

<input on:input={handleInput} type="text">
