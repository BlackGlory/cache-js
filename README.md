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
interface IMetadata {
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

  stats(namespace: string, timeout?: number): Promise<IStats>
  getAllNamespaces(timeout?: number): Promise<string[]>
  getAllItemKeys(namespace: string, timeout?: number): Promise<string[]>

  hasItem(namespace: string, itemKey: string, timeout?: number): Promise<boolean>

  getItem(namespace: string, itemKey: string, timeout?: number): Promise<string | null> 

  getItemWithMetadata(namespace: string, itemKey: string, timeout?: number): Promise<{
    value: string
    metadata: IMetadata
  } | null>

  getItems(
    namespace: string
  , itemKeys: string[]
  , timeout?: number
  ): Promise<Array<string | null>>

  setItem(
    namespace: string
  , itemKey: string
  , itemValue: string
  , timeToLive: number | null
  , timeout?: number
  ): Promise<void>

  removeItem(namespace: string, itemKey: string, timeout?: number): Promise<void>

  clearItemsByNamespace(namespace: string, timeout?: number): Promise<void>
}
```
