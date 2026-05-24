# cache-js
## Install
```sh
npm install --save @blackglory/cache-js
# or
yarn add @blackglory/cache-js
```

## API
### CacheClient
```ts
interface ICacheClientOptions {
  server: string
  timeout?: number
  retryIntervalForReconnection?: number
}

interface ICacheClientRequestOptions {
  signal?: AbortSignal
  timeout?: number | false
}

interface INamespaceStats {
  items: number
}

interface IItem {
  value: JSONValue
  metadata: IItemMetadata
}

interface IItemMetadata {
  updatedAt: number
  timeToLive: number | null
}

class CacheClient {
  static create(options: ICacheClientOptions): Promise<CacheClient>

  close(): Promise<void>

  getNamespaceStats(
    namespace: string
  , signalOrOptions?: AbortSignal | ICacheClientRequestOptions
  ): Promise<INamespaceStats>

  getAllNamespaces(
    signalOrOptions?: AbortSignal | ICacheClientRequestOptions
  ): Promise<string[]>

  getAllItemKeys(
    namespace: string
  , signalOrOptions?: AbortSignal | ICacheClientRequestOptions
  ): Promise<string[]>

  hasItem(
    namespace: string
  , itemKey: string
  , signalOrOptions?: AbortSignal | ICacheClientRequestOptions
  ): Promise<boolean>

  getItem(
    namespace: string
  , itemKey: string
  , signalOrOptions?: AbortSignal | ICacheClientRequestOptions
  ): Promise<IItem | null>

  getItemValue(
    namespace: string
  , itemKey: string
  , signalOrOptions?: AbortSignal | ICacheClientRequestOptions
  ): Promise<JSONValue | null>

  getItemValues(
    namespace: string
  , itemKeys: string[]
  , signalOrOptions?: AbortSignal | ICacheClientRequestOptions
  ): Promise<Array<JSONValue | null>>

  setItem(
    namespace: string
  , itemKey: string
  , itemValue: JSONValue
  , timeToLive: number | null
  , signalOrOptions?: AbortSignal | ICacheClientRequestOptions
  ): Promise<void>

  removeItem(
    namespace: string
  , itemKey: string
  , signalOrOptions?: AbortSignal | ICacheClientRequestOptions
  ): Promise<void>

  clearItemsByNamespace(
    namespace: string
  , signalOrOptions?: AbortSignal | ICacheClientRequestOptions
  ): Promise<void>
}
```
