<script lang="ts">
  import { clientId, fetchProfile, getAccessToken, getAuthRedirect } from '../../lib/spotify'

  void load()

  async function load (): Promise<void> {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    console.log('code', code)
    if (code === null) {
      const authRedirect = await getAuthRedirect(clientId)
      document.location = authRedirect
    } else {
      const accessToken = await getAccessToken(clientId, code)
      const profile = await fetchProfile(accessToken)
      console.log(profile)
    }
  }

</script>
<h>Login</h>
