<script lang="ts">
  import { clientId, fetchProfile, getAccessToken, getAuthRedirect } from '$lib/spotify'
  import type { UserProfile } from '$lib/types/spotify'
  import Search from './Search.svelte'
  import { isNil } from '$lib/utils.ts'
  import { type AccessToken } from '@spotify/web-api-ts-sdk'

  let profile: UserProfile | null = null
  let accessToken: AccessToken
  void load()

  async function load (): Promise<void> {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    console.log('code', code)
    if (isNil(code)) {
      await redirect()
    } else {
      try {
        // TODO store the code in local storage
        accessToken = await getAccessToken(clientId, code)
      } catch (e) {
        await redirect()
        return
      }
      profile = await fetchProfile(accessToken)
      console.log(profile)
    }
  }

  async function redirect () {
    const authRedirect = await getAuthRedirect(clientId)
    document.location = authRedirect
  }

</script>
{#if profile === null}
<h>Login</h>
{:else}
<Search profile={profile} token={accessToken}></Search>
{/if}
