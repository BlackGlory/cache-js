import { createRPCClient } from '@utils/rpc-client.js'
import { ClientProxy, BatchClient, BatchClientProxy } from 'delight-rpc'
import { IAPI, INamespaceStats, IItem } from './contract.js'
import { timeoutSignal, withAbortSignal } from 'extra-abort'
import { JSONValue } from '@blackglory/prelude'
export { INamespaceStats, IItem, IItemMetadata } from './contract.js'

export interface ICacheClientOptions {
  server: string
  timeout?: number
  retryIntervalForReconnection?: number
}

export class CacheClient {
  static async create(options: ICacheClientOptions): Promise<CacheClient> {
    const { client, batchClient, proxy, close } = await createRPCClient(
      options.server
    , options.retryIntervalForReconnection
    )
    return new CacheClient(client, batchClient, proxy, close, options.timeout)
  }

  private constructor(
    private client: ClientProxy<IAPI>
  , private batchClient: BatchClient
  , private batchProxy: BatchClientProxy<IAPI, unknown>
  , private closeClients: () => Promise<void>
  , private timeout?: number
  ) {}

  async close(): Promise<void> {
    await this.closeClients()
  }

  async getNamespaceStats(
    namespace: string
  , timeout?: number
  ): Promise<INamespaceStats> {
    return await this.withTimeout(
      () => this.client.getNamespaceStats(namespace)
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

  async hasItem(
    namespace: string
  , itemKey: string
  , timeout?: number
  ): Promise<boolean> {
    return await this.withTimeout(
      () => this.client.hasItem(namespace, itemKey)
    , timeout ?? this.timeout
    )
  }

  async getItem(
    namespace: string
  , itemKey: string
  , timeout?: number
  ): Promise<IItem | null> {
    return await this.withTimeout(
      () => this.client.getItem(namespace, itemKey)
    , timeout ?? this.timeout
    )
  }

  async getItemValue(
    namespace: string
  , itemKey: string
  , timeout?: number
  ): Promise<JSONValue | null> {
    return await this.withTimeout(
      () => this.client.getItemValue(namespace, itemKey)
    , timeout ?? this.timeout
    )
  }

  async getItemValues(
    namespace: string
  , itemKeys: string[]
  , timeout?: number
  ): Promise<Array<JSONValue | null>> {
    return await this.withTimeout(
      async () => {
        const results = await this.batchClient.parallel(
          ...itemKeys.map(key => this.batchProxy.getItemValue(namespace, key))
        )
        return results.map(result => result.unwrap())
      }
    , timeout ?? this.timeout
    )
  }

  async setItem(
    namespace: string
  , itemKey: string
  , itemValue: JSONValue
  , timeToLive: number | null
  , timeout?: number
  ): Promise<void> {
    await this.withTimeout(
      () => this.client.setItem(
        namespace
      , itemKey
      , itemValue
      , timeToLive
      )
    , timeout ?? this.timeout
    )
  }

  async removeItem(
    namespace: string
  , itemKey: string
  , timeout?: number
  ): Promise<void> {
    await this.withTimeout(
      () => this.client.removeItem(namespace, itemKey)
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
