export const expectedVersion = '^0.8.0'

export interface IAPI {
  stats(namespace: string): IStats
  getAllNamespaces(): string[]
  getAllItemKeys(namespace: string): string[]

  hasItem(namespace: string, key: string): boolean

  getItem(namespace: string, key: string): string | null
  getItemWithMetadata(namespace: string, key: string): {
    value: string
    metadata: IMetadata
  } | null

  setItem(
    namespace: string
  , key: string
  , value: string
  , timeToLive: number | null /* ms */
  ): null

  removeItem(namespace: string, key: string): null

  clearItemsByNamespace(namespace: string): null
}

export interface IStats {
  namespace: string
  items: number
}

export interface IMetadata {
  updatedAt: number
  timeToLive: number | null
}
