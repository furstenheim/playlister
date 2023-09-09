import type { UserProfile } from '$lib/types/spotify'
import * as spotify from '@spotify/web-api-ts-sdk'
import { compareTwoStrings, getTimeAfterSeconds, isNil, isTimeExpired } from '$lib/utils'
import { type Artist, type Page } from '@spotify/web-api-ts-sdk/src/types'
import { type AccessToken, type Playlist, type SimplifiedAlbum, type SimplifiedTrack } from '@spotify/web-api-ts-sdk'

const ACCESS_TOKEN_KEY = 'access_token_key_v3'
export const clientId = '8f5ffc8e8f4e4ccf8c0c241cf6092d6b'
const CURRENT_WEBSITE = window.location.host.match('localhost') ? `http://${window.location.host}` : `https://${window.location.host}`
// verbatim from https://developer.spotify.com/documentation/web-api/howtos/web-app-profile
export async function getAuthRedirect (clientId: string): Promise<string> {
  const verifier = generateCodeVerifier(128)
  const challenge = await generateCodeChallenge(verifier)

  localStorage.setItem('verifier', verifier)

  const params = new URLSearchParams()
  params.append('client_id', clientId)
  params.append('response_type', 'code')
  params.append('redirect_uri', CURRENT_WEBSITE)
  params.append('scope', 'user-read-private user-read-email playlist-modify-private playlist-modify-public')
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

export async function getAccessTokenFromLocalStorage (): Promise<AccessToken | null> {
  try {
    const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY)
    console.log(storedToken)
    if (!isNil(storedToken)) {
      const accessToken: AccessTokenWithExpiration = JSON.parse(storedToken)
      if (!isTimeExpired(accessToken.expiration)) {
        return accessToken.accessToken
      }
    }
  } catch (e) {
    console.error('Could not fetch access token from local storage', e)
  }
  return null
}
export async function getAccessToken (clientId: string, code: string): Promise<AccessToken> {
  const verifier = localStorage.getItem('verifier')

  const params = new URLSearchParams()
  params.append('client_id', clientId)
  params.append('grant_type', 'authorization_code')
  params.append('code', code)
  params.append('redirect_uri', CURRENT_WEBSITE)
  params.append('code_verifier', verifier!)

  const result = await fetch('https://accounts.spotify.com/api/token?', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  })

  const resultAsJson = await result.json()

  const { access_token: accessToken } = resultAsJson

  if (isNil(accessToken)) {
    throw new Error(resultAsJson.error)
  }

  const accessTokenWithExpiration: AccessTokenWithExpiration = { expiration: getTimeAfterSeconds(resultAsJson.expires_in), accessToken: resultAsJson }
  localStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(accessTokenWithExpiration))
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

export async function searchAlbums (token: AccessToken, artist: Artist): Promise<SimplifiedAlbum[]> {
  const sdk = spotify.SpotifyApi.withAccessToken(clientId, token)
  /*
    Possible values
    - album
    - single
    - appears_on
    - compilation */
  const includeGroups = ['album', 'single']
  const albums = await sdk.artists.albums(artist.id, includeGroups.join(','))
  return albums.items
}

export async function searchTracks (token: AccessToken, album: SimplifiedAlbum): Promise<SimplifiedTrack[]> {
  const sdk = spotify.SpotifyApi.withAccessToken(clientId, token)
  const tracks = await sdk.albums.tracks(album.id)
  return tracks.items
}

export async function createPlaylist (token: AccessToken, userId: string, playlistName: string): Promise<Playlist> {
  const sdk = spotify.SpotifyApi.withAccessToken(clientId, token)
  const playlist = await sdk.playlists.createPlaylist(userId, { name: playlistName, public: false })
  return playlist
}

// Max 100 songs
export async function addItemsToPlaylist (token: AccessToken, playlist: Playlist, songs: SimplifiedTrack[]): Promise<void> {
  const sdk = spotify.SpotifyApi.withAccessToken(clientId, token)
  await sdk.playlists.addItemsToPlaylist(playlist.id, songs.map(s => s.uri))
}

export interface SelectedTrack {
  selected: boolean
  track: SimplifiedTrack
}
export function dedupeTracks (tracks: SimplifiedTrack[]): SelectedTrack[] {
  const result: SelectedTrack[] = []
  // eslint-disable-next-line no-labels
  mainLoop: for (let i = 0; i < tracks.length; i++) {
    const track1 = tracks[i]
    if (isSongLive(track1.name) || isSongRemastered(track1.name)) {
      result.push({
        selected: false,
        track: track1
      })
      continue
    }
    for (let j = i + 1; j < tracks.length; j++) {
      const track2 = tracks[2]
      if (isSongDuped(track1.name, track2.name)) {
        result.push({
          selected: false,
          track: track1
        })
        // eslint-disable-next-line no-labels
        continue mainLoop
      }
    }
    result.push({
      selected: true,
      track: track1
    })
  }
  return result
}

export function isSongDuped (firstSong: string, secondSong: string): boolean {
  // Rudy - Live At Hammersmith Odeon / 1975 should not be pushed if Rudy is there
  return (!isSongLive(secondSong) && !isSongRemastered(secondSong)) && (firstSong.startsWith(secondSong) || compareTwoStrings(firstSong, secondSong) > 0.6)
}

export function isSongLive (songName: string): boolean {
  const liveRegexes = [/-.*Directo.*/i, /-.*Live.*/i]
  return liveRegexes.find(r => songName.match(r)) !== undefined
}

export function isSongRemastered (songName: string): boolean {
  const liveRegexes = [/-.*Remastered.*/i, /-.*Remaster.*/i]
  return liveRegexes.find(r => songName.match(r)) !== undefined
}

interface AccessTokenWithExpiration {
  expiration: number // number instead of date to be able to searialize properly
  accessToken: AccessToken
}
