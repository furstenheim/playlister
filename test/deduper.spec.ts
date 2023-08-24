import { dedupeTracks, isSongLive } from '$lib/spotify'
import { type SimplifiedTrack } from '@spotify/web-api-ts-sdk'
import * as fs from 'fs/promises'
import { compareTwoStrings } from '$lib/utils'
import { partition } from 'lodash'

describe('Dedupe', function () {
  it('Supertramp', async function () {
    const superTrampSongsAsBuffer = await fs.readFile('./test/supertrampSongs.json')
    const superTrampSongs = JSON.parse(superTrampSongsAsBuffer.toString())
    console.log(superTrampSongs)
    const deduped = dedupeTracks(superTrampSongs as unknown as SimplifiedTrack[])
    const [selected, nonSelected] = partition(deduped, 'selected')
    console.log(JSON.stringify(nonSelected, null, 2))
    console.log(selected.length, nonSelected.length, superTrampSongs.length)
  })

  const tests = [
    {
      a: 'If Everyone Was Listening',
      b: 'If Everyone Was Listening - Remastered 2010'
    },
    {
      a: 'If Everyone Was Listening',
      b: 'If Everyone Was Listening - Live At Hammersmith Odeon / 1975'
    },
    {
      a: 'Two Of Us',
      b: 'Lover Boy'
    },
    {
      a: 'It Doesn\'t Matter',
      b: 'Not The Moment'
    },
    {
      a: 'Rudy',
      b: 'Rudy - Live At Hammersmith Odeon / 1975'
    }
  ]
  tests.forEach((t, i) => {
    it(`test ${i}`, function () {
      console.log(t.a, t.b, compareTwoStrings(t.a, t.b))
    })
  })

  const liveTests = [{
    song: 'Rudy - Live At Hammersmith Odeon / 1975',
    expected: true
  },
  {
    song: 'If Everyone Was Listening',
    expected: false
  },
  {
    song: '19 Dias y 500 Noches - Directo',
    expected: true
  },
  {
    song: 'Two Of Us',
    expected: false
  },
  {
    song: 'It Doesn\'t Matter',
    expected: false
  },
  {
    song: 'Rudy',
    expected: false
  },
  {
    song: 'If Everyone Was Listening - Live At Hammersmith Odeon / 1975',
    expected: true
  },
    {
      song: 'Hotel California - Live; 1999 Remaster',
      expected: true
    }
  ]
  liveTests.forEach((test, i) => {
    it(`live ${i}`, function () {
      expect(isSongLive(test.song)).toEqual(test.expected)
    })
  })
})
