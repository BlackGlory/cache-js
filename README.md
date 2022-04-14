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
  timeToLive: number
  timeBeforeDeletion: number
}

interface ICacheClientOptions {
  server: string
  timeout?: number
}

class CacheClient {
    constructor(options: ICacheClientOptions)

    close(): void
    has(namespace: string, key: string, timeout?: number): Promise<boolean>
    get(namespace: string, key: string, timeout?: number): Promise<string | null>
    getWithMetadata(namespace: string, key: string, timeout?: number): Promise<{
        value: string
        metadata: IMetadata
    } | null>
    set(
      namespace: string
    , key: string
    , value: string
    , timeToLive: number
    , timeBeforeDeletion: number
    , timeout?: number
    ): Promise<void>
    del(namespace: string, key: string, timeout?: number): Promise<void>
    clear(namespace: string, timeout?: number): Promise<void>
    getAllItemKeys(namespace: string, timeout?: number): Promise<string[]>
    getAllNamespaces(timeout?: number): Promise<string[]>
    stats(namespace: string, timeout?: number): Promise<IStats>
}
```
