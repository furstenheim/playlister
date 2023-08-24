<script lang="ts">
  import { type Artist } from '@spotify/web-api-ts-sdk/src/types'
  import DiskChooser from './DiskChooser.svelte'
  import type { UserProfile } from '$lib/types/spotify.d.ts'
  import {AccessToken} from '@spotify/web-api-ts-sdk'

  export let artist: Artist
  export let profile: UserProfile
  export let accessToken: AccessToken

  let isOpen = false

  const handleClick = function (): void {
    isOpen = !isOpen
  }

  if (artist.name === 'Eagles') {
    handleClick()
  }
</script>

<div class="artist-container" on:click="{handleClick}">
  {#if artist.images.length > 0}
    <img height="40px" width="40px" src="{artist.images[0].url}" alt="{artist.name + '-image'}"/>
  {/if}
  <p class="artist-title">{artist.name}</p>
</div>

{#if isOpen}
  <div style="margin: 4px">
    <DiskChooser profile={profile} artist="{artist}" accessToken="{accessToken}"></DiskChooser>
  </div>

{/if}

<style>
  .artist-container {
      display: flex;
      flex-direction: row;
      align-items: center;
      margin: 4px;
      padding: 2px 2px 2px 10px;
      background: lightgreen;
      border-radius: 4px;
      border: 2px groove darkgreen;
  }

  .artist-container:hover {
      transform: scale(1.01, 1.01);
  }

  .artist-title {
      font-weight: bold;
      margin-left: 3px;
  }

  .disks-container {

  }

</style>
