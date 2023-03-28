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
interface INamespaceStats {
  items: number
}

interface IItemMetadata {
  updatedAt: number
  timeToLive: number | null
}

interface ICacheClientOptions {
  server: string
  timeout?: number
  retryIntervalForReconnection?: number
}

class CacheClient {
  static create(options: ICacheClientOptions): Promise<CacheClient>

  close(): Promise<void>

  getNamespaceStats(namespace: string, timeout?: number): Promise<INamespaceStats>

  getAllNamespaces(timeout?: number): Promise<string[]>

  getAllItemKeys(namespace: string, timeout?: number): Promise<string[]>

  hasItem(namespace: string, itemKey: string, timeout?: number): Promise<boolean>

  getItem(namespace: string, itemKey: string, timeout?: number): Promise<
    {
      value: JSONValue
      metadata: IItemMetadata
    } | null
  >

  getItemValue(
    namespace: string
  , itemKey: string
  , timeout?: number
  ): Promise<JSONValue | null>

  getItemValues(
    namespace: string
  , itemKeys: string[]
  , timeout?: number
  ): Promise<Array<JSONValue | null>>

  setItem(
    namespace: string
  , itemKey: string
  , itemValue: JSONValue
  , timeToLive: number | null
  , timeout?: number
  ): Promise<void>

  removeItem(namespace: string, itemKey: string, timeout?: number): Promise<void>

  clearItemsByNamespace(namespace: string, timeout?: number): Promise<void>
}
```
