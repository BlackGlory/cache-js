import { createRPCClient } from '@utils/rpc-client'
import { ClientProxy, BatchClient, BatchClientProxy } from 'delight-rpc'
import { IAPI, IStats } from './contract'
import { isPositiveInfinity, isNull } from '@blackglory/prelude'
import { timeoutSignal, withAbortSignal } from 'extra-abort'
export { IStats } from './contract'

export interface IMetadata {
  updatedAt: number
  timeToLive: number
  timeBeforeDeletion: number
}

export interface ICacheClientOptions {
  server: string
  timeout?: number
}

export class CacheClient {
  private constructor(
    private client: ClientProxy<IAPI>
  , private batchClient: BatchClient
  , private batchProxy: BatchClientProxy<IAPI, unknown>
  , private closeClients: () => void
  , private timeout?: number
  ) {}

  static async create(options: ICacheClientOptions): Promise<CacheClient> {
    const { client, batchClient, proxy, close } = await createRPCClient(options.server)
    return new CacheClient(client, batchClient, proxy, close, options.timeout)
  }

  close(): void {
    this.closeClients()
  }

  async has(namespace: string, key: string, timeout?: number): Promise<boolean> {
    return await this.withTimeout(
      () => this.client.has(namespace, key)
    , timeout
    )
  }

  async get(namespace: string, key: string, timeout?: number): Promise<string | null> {
    return await this.withTimeout(
      () => this.client.get(namespace, key)
    , timeout
    )
  }

  async bulkGet(
    namespace: string
  , keys: string[]
  , timeout?: number
  ): Promise<Array<string | null>> {
    return await this.withTimeout(async () => {
      const results = await this.batchClient.parallel(
        ...keys.map(key => this.batchProxy.get(namespace, key))
      )
      return results.map(result => result.unwrap())
    }, timeout)
  }

  async getWithMetadata(namespace: string, key: string, timeout?: number): Promise<{
    value: string
    metadata: IMetadata 
  } | null> {
    return await this.withTimeout(
      async () => {
        const result = await this.client.getWithMetadata(namespace, key)
        if (isNull(result)) return null

        return {
          value: result.value
        , metadata: {
            updatedAt: result.metadata.updatedAt
          , timeToLive: result.metadata.timeToLive ?? Infinity
          , timeBeforeDeletion: result.metadata.timeBeforeDeletion ?? Infinity
          }
        }
      }
    , timeout
    )
  }

  async set(
    namespace: string
  , key: string
  , value: string
  , timeToLive: number
  , timeBeforeDeletion: number
  , timeout?: number
  ): Promise<void> {
    await this.withTimeout(
      () => this.client.set(
        namespace
      , key
      , value
      , isPositiveInfinity(timeToLive)
        ? null
        : timeToLive
      , isPositiveInfinity(timeBeforeDeletion)
        ? null
        : timeBeforeDeletion
      )
    , timeout
    )
  }

  async del(namespace: string, key: string, timeout?: number): Promise<void> {
    await this.withTimeout(
      () => this.client.del(namespace, key)
    , timeout
    )
  }

  async clear(namespace: string, timeout?: number): Promise<void> {
    await this.withTimeout(
      () => this.client.clear(namespace)
    , timeout
    )
  }

  async getAllItemKeys(namespace: string, timeout?: number): Promise<string[]> {
    return await this.withTimeout(
      () => this.client.getAllItemKeys(namespace)
    , timeout
    )
  }

  async getAllNamespaces(timeout?: number): Promise<string[]> {
    return await this.withTimeout(
      () => this.client.getAllNamespaces()
    , timeout
    )
  }

  async stats(namespace: string, timeout?: number): Promise<IStats> {
    return await this.withTimeout(
      () => this.client.stats(namespace)
    , timeout
    )
  }

  private async withTimeout<T>(
    fn: () => PromiseLike<T>
  , timeout: number | undefined = this.timeout
  ): Promise<T> {
    if (timeout) {
      return await withAbortSignal(timeoutSignal(timeout), fn)
    }
    return await fn()
  }
}
