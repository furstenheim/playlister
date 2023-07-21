export const clientId = '8f5ffc8e8f4e4ccf8c0c241cf6092d6b'
/*
const clientId = '8f5ffc8e8f4e4ccf8c0c241cf6092d6b'
const params = new URLSearchParams(window.location.search)
const code = params.get('code')

if (!code) {
  redirectToAuthCodeFlow(clientId)
} else {
  const accessToken = await getAccessToken(clientId, code)
  const profile = await fetchProfile(accessToken)
  populateUI(profile)
}
*/

// verbatim from https://developer.spotify.com/documentation/web-api/howtos/web-app-profile
export async function getAuthRedirect (clientId: string): Promise<string> {
  const verifier = generateCodeVerifier(128)
  const challenge = await generateCodeChallenge(verifier)

  localStorage.setItem('verifier', verifier)

  const params = new URLSearchParams()
  params.append('client_id', clientId)
  params.append('response_type', 'code')
  params.append('redirect_uri', 'http://localhost:5173/login')
  params.append('scope', 'user-read-private user-read-email')
  params.append('code_challenge_method', 'S256')
  params.append('code_challenge', challenge)

  return `https://accounts.spotify.com/authorize?${params.toString()}`
}

function generateCodeVerifier (length: number): string {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

async function generateCodeChallenge (codeVerifier: string): Promise<string> {
  const data = new TextEncoder().encode(codeVerifier)
  const digest = await window.crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export async function getAccessToken (clientId: string, code: string): Promise<string> {
  const verifier = localStorage.getItem('verifier')

  const params = new URLSearchParams()
  params.append('client_id', clientId)
  params.append('grant_type', 'authorization_code')
  params.append('code', code)
  params.append('redirect_uri', 'http://localhost:5173/login')
  params.append('code_verifier', verifier!)

  const result = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  })

  const { access_token: accessToken } = await result.json()
  return accessToken
}

export async function fetchProfile (token: string): Promise<any> {
  const result = await fetch('https://api.spotify.com/v1/me', {
    method: 'GET', headers: { Authorization: `Bearer ${token}` }
  })

  return await result.json()
}
