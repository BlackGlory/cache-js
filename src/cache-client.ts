import { createRPCClient } from '@utils/rpc-client.js'
import { ClientProxy, BatchClient, BatchClientProxy } from 'delight-rpc'
import { IAPI, INamespaceStats, IItem } from './contract.js'
import { raceAbortSignals, timeoutSignal, withAbortSignal } from 'extra-abort'
import { isntUndefined, JSONValue } from '@blackglory/prelude'
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
  , signal?: AbortSignal
  ): Promise<INamespaceStats> {
    return await this.client.getNamespaceStats(
      namespace
    , this.withTimeout(signal)
    )
  }

  async getAllNamespaces(signal?: AbortSignal): Promise<string[]> {
    return await this.client.getAllNamespaces(
      this.withTimeout(signal)
    )
  }

  async getAllItemKeys(
    namespace: string
  , signal?: AbortSignal
  ): Promise<string[]> {
    return await this.client.getAllItemKeys(namespace, this.withTimeout(signal))
  }

  async hasItem(
    namespace: string
  , itemKey: string
  , signal?: AbortSignal
  ): Promise<boolean> {
    return await this.client.hasItem(namespace, itemKey, this.withTimeout(signal))
  }

  async getItem(
    namespace: string
  , itemKey: string
  , signal?: AbortSignal
  ): Promise<IItem | null> {
    return await this.client.getItem(namespace, itemKey, this.withTimeout(signal))
  }

  async getItemValue(
    namespace: string
  , itemKey: string
  , signal?: AbortSignal
  ): Promise<JSONValue | null> {
    return await this.client.getItemValue(
      namespace
    , itemKey
    , this.withTimeout(signal)
    )
  }

  async getItemValues(
    namespace: string
  , itemKeys: string[]
  , signal?: AbortSignal
  ): Promise<Array<JSONValue | null>> {
    return await withAbortSignal(
      this.withTimeout(signal)
    , async () => {
        const results = await this.batchClient.parallel(
          ...itemKeys.map(key => this.batchProxy.getItemValue(namespace, key))
        )
        return results.map(result => result.unwrap())
      }
    )
  }

  async setItem(
    namespace: string
  , itemKey: string
  , itemValue: JSONValue
  , timeToLive: number | null
  , signal?: AbortSignal
  ): Promise<void> {
    await this.client.setItem(
      namespace
    , itemKey
    , itemValue
    , timeToLive
    , this.withTimeout(signal)
    )
  }

  async removeItem(
    namespace: string
  , itemKey: string
  , signal?: AbortSignal
  ): Promise<void> {
    await this.client.removeItem(namespace, itemKey, this.withTimeout(signal))
  }

  async clearItemsByNamespace(
    namespace: string
  , signal?: AbortSignal
  ): Promise<void> {
    await this.client.clearItemsByNamespace(namespace, this.withTimeout(signal))
  }

  private withTimeout(signal?: AbortSignal): AbortSignal {
    return raceAbortSignals([
      isntUndefined(this.timeout) && timeoutSignal(this.timeout)
    , signal
    ])
  }
}
