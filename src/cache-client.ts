import { createRPCClient } from '@utils/rpc-client.js'
import { ClientProxy, BatchClient, BatchClientProxy } from 'delight-rpc'
import { IAPI, INamespaceStats, IItem } from './contract.js'
import { raceAbortSignals, timeoutSignal, withAbortSignal, isAbortSignal } from 'extra-abort'
import { JSONValue } from '@blackglory/prelude'
export { INamespaceStats, IItem, IItemMetadata } from './contract.js'

export interface ICacheClientOptions {
  server: string
  timeout?: number
  retryIntervalForReconnection?: number
}

export interface ICacheClientRequestOptions {
  signal?: AbortSignal
  timeout?: number | false
}

export class CacheClient {
  static async create(options: ICacheClientOptions): Promise<CacheClient> {
    const { client, batchClient, proxy, close } = await createRPCClient(
      options.server
    , options.retryIntervalForReconnection
    , options.timeout
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
  , signalOrOptions?: AbortSignal | ICacheClientRequestOptions
  ): Promise<INamespaceStats> {
    return await this.client.getNamespaceStats(
      namespace
    , this.createSignal(signalOrOptions)
    )
  }

  async getAllNamespaces(
    signalOrOptions?: AbortSignal | ICacheClientRequestOptions
  ): Promise<string[]> {
    return await this.client.getAllNamespaces(
      this.createSignal(signalOrOptions)
    )
  }

  async getAllItemKeys(
    namespace: string
  , signalOrOptions?: AbortSignal | ICacheClientRequestOptions
  ): Promise<string[]> {
    return await this.client.getAllItemKeys(
      namespace
    , this.createSignal(signalOrOptions)
    )
  }

  async hasItem(
    namespace: string
  , itemKey: string
  , signalOrOptions?: AbortSignal | ICacheClientRequestOptions
  ): Promise<boolean> {
    return await this.client.hasItem(
      namespace
    , itemKey
    , this.createSignal(signalOrOptions)
    )
  }

  async getItem(
    namespace: string
  , itemKey: string
  , signalOrOptions?: AbortSignal | ICacheClientRequestOptions
  ): Promise<IItem | null> {
    return await this.client.getItem(
      namespace
    , itemKey
    , this.createSignal(signalOrOptions)
    )
  }

  async getItemValue(
    namespace: string
  , itemKey: string
  , signalOrOptions?: AbortSignal | ICacheClientRequestOptions
  ): Promise<JSONValue | null> {
    return await this.client.getItemValue(
      namespace
    , itemKey
    , this.createSignal(signalOrOptions)
    )
  }

  async getItemValues(
    namespace: string
  , itemKeys: string[]
  , signalOrOptions?: AbortSignal | ICacheClientRequestOptions
  ): Promise<Array<JSONValue | null>> {
    return await withAbortSignal(
      this.createSignal(signalOrOptions)
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
  , signalOrOptions?: AbortSignal | ICacheClientRequestOptions
  ): Promise<void> {
    await this.client.setItem(
      namespace
    , itemKey
    , itemValue
    , timeToLive
    , this.createSignal(signalOrOptions)
    )
  }

  async removeItem(
    namespace: string
  , itemKey: string
  , signalOrOptions?: AbortSignal | ICacheClientRequestOptions
  ): Promise<void> {
    await this.client.removeItem(
      namespace
    , itemKey
    , this.createSignal(signalOrOptions)
    )
  }

  async clearItemsByNamespace(
    namespace: string
  , signalOrOptions?: AbortSignal | ICacheClientRequestOptions
  ): Promise<void> {
    await this.client.clearItemsByNamespace(
      namespace
    , this.createSignal(signalOrOptions)
    )
  }

  private createSignal(
    signalOrOptions: AbortSignal | ICacheClientRequestOptions = {}
  ): AbortSignal {
    const options: ICacheClientRequestOptions = isAbortSignal(signalOrOptions)
                                              ? { signal: signalOrOptions }
                                              : signalOrOptions

    return raceAbortSignals([
      options.signal
    , options.timeout !== false && (
        (options.timeout && timeoutSignal(options.timeout)) ??
        (this.timeout && timeoutSignal(this.timeout))
      )
    ])
  }
}
