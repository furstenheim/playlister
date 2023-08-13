  import type { SpotifyError, UserProfile } from '$lib/types/spotify'
import * as spotify from '@spotify/web-api-ts-sdk'
import { isNil } from '$lib/utils'
import { type Artist, type Page } from '@spotify/web-api-ts-sdk/src/types'
import { type AccessToken } from '@spotify/web-api-ts-sdk'

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
  params.append('redirect_uri', 'http://localhost:5173')
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

export async function getAccessToken (clientId: string, code: string): Promise<AccessToken> {
  const verifier = localStorage.getItem('verifier')

  const params = new URLSearchParams()
  params.append('client_id', clientId)
  params.append('grant_type', 'authorization_code')
  params.append('code', code)
  params.append('redirect_uri', 'http://localhost:5173')
  params.append('code_verifier', verifier!)

  const result = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  })

  const resultAsJson = await result.json()

  const { access_token: accessToken } = resultAsJson

  if (isNil(accessToken)) {
    throw new Error(resultAsJson.error)
  }
  return resultAsJson
}

export async function fetchProfile (token: AccessToken): Promise<UserProfile> {
  const result = await fetch('https://api.spotify.com/v1/me', {
    method: 'GET', headers: { Authorization: `Bearer ${token.access_token}` }
  })

  return await result.json()
}

export async function searchArtists (token: AccessToken, searchString: string): Promise<Page<Artist>> {
  const sdk = spotify.SpotifyApi.withAccessToken(clientId, token)
  const { artists } = await sdk.search(searchString, ['artist'])
  console.log(artists)
  return artists
}
