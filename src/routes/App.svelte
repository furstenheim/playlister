<script lang="ts">
  import { clientId, fetchProfile, getAccessToken, getAuthRedirect } from '$lib/spotify'
  import type { UserProfile } from '$lib/types/spotify'
  import Search from './Search.svelte'
  import { isNil } from '$lib/utils.ts'
  import { type AccessToken } from '@spotify/web-api-ts-sdk'

  let profile: UserProfile | null = null
  let accessToken: AccessToken
  const ACCESS_TOKEN_KEY = 'access_token_key'
  void load()

  async function load (): Promise<void> {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    console.log('code', code)
    if (isNil(code)) {
      try {
        accessToken = JSON.parse(localStorage.getItem(ACCESS_TOKEN_KEY))
      } catch (e) {
        console.error('Could not fetch access token from local storage', e)
      }
      if (isNil(accessToken)) {
        await redirect()
        return
      }
    } else {
      try {
        // TODO store the code in local storage
        accessToken = await getAccessToken(clientId, code)
        localStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(accessToken))
      } catch (e) {
        await redirect()
        return
      }
    }
    profile = await fetchProfile(accessToken)
    console.log(profile)
  }

  async function redirect (): Promise<void> {
    const authRedirect = await getAuthRedirect(clientId)
    document.location = authRedirect
  }

</script>
{#if profile === null}
<h>Login</h>
{:else}
<Search profile={profile} token={accessToken}></Search>
{/if}
