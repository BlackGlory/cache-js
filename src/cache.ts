import { createRPCClient } from './rpc-client'
import { ClientProxy } from 'delight-rpc'
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
  private client: ClientProxy<IAPI>
  private closeClient: () => void

  constructor(private options: ICacheClientOptions) {
    const { client, close } = createRPCClient(options.server)
    this.client = client
    this.closeClient = close
  }

  close(): void {
    this.closeClient()
  }

  async has(namespace: string, key: string, timeout?: number): Promise<boolean> {
    return await this.withTimeout(
      () => this.client.has(namespace, key)
    , timeout
    )
  }

  async get(namespace: string, key: string, timeout?: number): Promise<string | null> {
    const value = await this.withTimeout(
      () => this.client.get(namespace, key)
    , timeout
    )
    return value
  }

  async getWithMetadata(namespace: string, key: string, timeout?: number): Promise<{
    value: string
    metadata: IMetadata 
  } | null> {
    const result = await this.withTimeout(
      () => this.client.getWithMetadata(namespace, key)
    , timeout
    )
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
  , timeout: number | undefined = this.options.timeout
  ): Promise<T> {
    if (timeout) {
      return await withAbortSignal(timeoutSignal(timeout), fn)
    }
    return await fn()
  }
}
