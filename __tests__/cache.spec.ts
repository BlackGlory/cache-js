import { CacheClient } from '@src/cache.js'

const server = 'ws://cache:8080'

describe('CacheClient', () => {
  test('set, get', async () => {
    const client = await CacheClient.create({ server })

    try {
      await client.setItem('namespace', 'key', 'value', null)
      const result = await client.getItem('namespace', 'key')

      expect(result).toBe('value')
    } finally {
      await client.clearItemsByNamespace('namespace')
      await client.close()
    }
  })
})
