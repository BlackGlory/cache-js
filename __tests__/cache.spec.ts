import { CacheClient } from '@src/cache'

const server = 'ws://cache:8080'

describe('CacheClient', () => {
  test('set, get', async () => {
    const client = await CacheClient.create({ server })

    try {
      await client.set('namespace', 'key', 'value', null)
      const result = await client.get('namespace', 'key')

      expect(result).toBe('value')
    } finally {
      await client.clear('namespace')
      await client.close()
    }
  })
})
