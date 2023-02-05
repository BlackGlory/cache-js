import { createRPCClient } from '@utils/rpc-client.js'
import { ClientProxy, BatchClient, BatchClientProxy } from 'delight-rpc'
import { IAPI, IStats } from './contract.js'
import { timeoutSignal, withAbortSignal } from 'extra-abort'
import { isNull } from '@blackglory/prelude'
export { IStats } from './contract.js'

export interface IMetadata {
  updatedAt: number
  timeToLive: number | null
}

export interface ICacheClientOptions {
  server: string
  timeout?: number
  retryIntervalForReconnection?: number
}

export class CacheClient {
  async stats(namespace: string, timeout?: number): Promise<IStats> {
    return await this.withTimeout(
      () => this.client.stats(namespace)
    , timeout ?? this.timeout
    )
  }

  async getAllNamespaces(timeout?: number): Promise<string[]> {
    return await this.withTimeout(
      () => this.client.getAllNamespaces()
    , timeout ?? this.timeout
    )
  }

  async getAllItemKeys(namespace: string, timeout?: number): Promise<string[]> {
    return await this.withTimeout(
      () => this.client.getAllItemKeys(namespace)
    , timeout ?? this.timeout
    )
  }

  private constructor(
    private client: ClientProxy<IAPI>
  , private batchClient: BatchClient
  , private batchProxy: BatchClientProxy<IAPI, unknown>
  , private closeClients: () => Promise<void>
  , private timeout?: number
  ) {}

  static async create(options: ICacheClientOptions): Promise<CacheClient> {
    const { client, batchClient, proxy, close } = await createRPCClient(options.server)
    return new CacheClient(client, batchClient, proxy, close, options.timeout)
  }

  async close(): Promise<void> {
    await this.closeClients()
  }

  async hasItem(namespace: string, key: string, timeout?: number): Promise<boolean> {
    return await this.withTimeout(
      () => this.client.hasItem(namespace, key)
    , timeout ?? this.timeout
    )
  }

  async getItem(namespace: string, key: string, timeout?: number): Promise<string | null> {
    return await this.withTimeout(
      () => this.client.getItem(namespace, key)
    , timeout ?? this.timeout
    )
  }

  async getItemWithMetadata(namespace: string, key: string, timeout?: number): Promise<{
    value: string
    metadata: IMetadata
  } | null> {
    return await this.withTimeout(
      async () => {
        const result = await this.client.getItemWithMetadata(namespace, key)
        if (isNull(result)) return null

        return {
          value: result.value
        , metadata: {
            updatedAt: result.metadata.updatedAt
          , timeToLive: result.metadata.timeToLive
          }
        }
      }
    , timeout ?? this.timeout
    )
  }

  async getItems(
    namespace: string
  , keys: string[]
  , timeout?: number
  ): Promise<Array<string | null>> {
    return await this.withTimeout(
      async () => {
        const results = await this.batchClient.parallel(
          ...keys.map(key => this.batchProxy.getItem(namespace, key))
        )
        return results.map(result => result.unwrap())
      }
    , timeout ?? this.timeout
    )
  }

  async setItem(
    namespace: string
  , key: string
  , value: string
  , timeToLive: number | null
  , timeout?: number
  ): Promise<void> {
    await this.withTimeout(
      () => this.client.setItem(
        namespace
      , key
      , value
      , timeToLive
      )
    , timeout ?? this.timeout
    )
  }

  async removeItem(namespace: string, key: string, timeout?: number): Promise<void> {
    await this.withTimeout(
      () => this.client.removeItem(namespace, key)
    , timeout ?? this.timeout
    )
  }

  async clearItemsByNamespace(namespace: string, timeout?: number): Promise<void> {
    await this.withTimeout(
      () => this.client.clearItemsByNamespace(namespace)
    , timeout ?? this.timeout
    )
  }

  private async withTimeout<T>(
    fn: () => PromiseLike<T>
  , timeout: number | undefined = this.timeout
  ): Promise<T> {
    if (timeout) {
      return await withAbortSignal(timeoutSignal(timeout), fn)
    } else {
      return await fn()
    }
  }
}
