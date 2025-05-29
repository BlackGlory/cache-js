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
  , signal?: AbortSignal
  ): Promise<INamespaceStats>

  getAllNamespaces(signal?: AbortSignal): Promise<string[]>

  getAllItemKeys(namespace: string, signal?: AbortSignal): Promise<string[]>

  hasItem(
    namespace: string
  , itemKey: string
  , signal?: AbortSignal
  ): Promise<boolean>

  getItem(
    namespace: string
  , itemKey: string
  , signal?: AbortSignal
  ): Promise<IItem | null>

  getItemValue(
    namespace: string
  , itemKey: string
  , signal?: AbortSignal
  ): Promise<JSONValue | null>

  getItemValues(
    namespace: string
  , itemKeys: string[]
  , signal?: AbortSignal
  ): Promise<Array<JSONValue | null>>

  setItem(
    namespace: string
  , itemKey: string
  , itemValue: JSONValue
  , timeToLive: number | null
  , signal?: AbortSignal
  ): Promise<void>

  removeItem(
    namespace: string
  , itemKey: string
  , signal?: AbortSignal
  ): Promise<void>

  clearItemsByNamespace(namespace: string, signal?: AbortSignal): Promise<void>
}
```
