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
}

class CacheClient {
  static create(options: ICacheClientOptions): Promise<CacheClient>

  set(
    namespace: string
  , key: string
  , value: string
  , timeToLive: number | null
  , timeout?: number
  ): Promise<void>

  has(namespace: string, key: string, timeout?: number): Promise<boolean>

  get(namespace: string, key: string, timeout?: number): Promise<string | null>
  getWithMetadata(namespace: string, key: string, timeout?: number): Promise<{
      value: string
      metadata: IMetadata
  } | null>
  bulkGet(
    namespace: string
  , keys: string[]
  , timeout?: number
  ): Promise<Array<string | null>>

  del(namespace: string, key: string, timeout?: number): Promise<void>
  clear(namespace: string, timeout?: number): Promise<void>

  getAllItemKeys(namespace: string, timeout?: number): Promise<string[]>
  getAllNamespaces(timeout?: number): Promise<string[]>

  stats(namespace: string, timeout?: number): Promise<IStats>

  close(): Promise<void>
}
```
