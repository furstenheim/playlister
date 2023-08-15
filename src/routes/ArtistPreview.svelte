<script lang="ts">
  import { type Artist } from '@spotify/web-api-ts-sdk/src/types'

  export let artist: Artist
</script>

<div class="artist-container">
  {#if artist.images.length > 0}
    <img height="40px" width="40px" src="{artist.images[0].url}" alt="{artist.name + '-image'}"/>
  {/if}
  <p class="artist-title">{artist.name}</p>
</div>

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

  .artist-title {
      font-weight: bold;
      margin-left: 3px;
  }

</style>
