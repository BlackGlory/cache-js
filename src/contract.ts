export const expectedVersion = '^0.6.0 || ^0.7.0'

export interface IAPI {
  has(namespace: string, key: string): boolean
  get(namespace: string, key: string): string | null
  getWithMetadata(namespace: string, key: string): {
    value: string
    metadata: IMetadata
  } | null
  set(
    namespace: string
  , key: string
  , value: string
  , timeToLive: number | null /* ms */
  ): null
  del(namespace: string, key: string): null
  clear(namespace: string): null

  getAllItemKeys(namespace: string): string[]
  getAllNamespaces(): string[]
  stats(namespace: string): IStats
}

export interface IStats {
  namespace: string
  items: number
}

export interface IMetadata {
  updatedAt: number
  timeToLive: number | null
}
