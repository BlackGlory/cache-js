export const expectedVersion = '^0.8.0'

export interface IStats {
  namespace: string
  items: number
}

export interface IMetadata {
  updatedAt: number
  timeToLive: number | null
}

export interface IAPI {
  stats(namespace: string): IStats
  getAllNamespaces(): string[]
  getAllItemKeys(namespace: string): string[]

  hasItem(namespace: string, itemKey: string): boolean

  getItem(namespace: string, itemKey: string): string | null
  getItemWithMetadata(namespace: string, itemKey: string): {
    value: string
    metadata: IMetadata
  } | null

  setItem(
    namespace: string
  , itemKey: string
  , itemValue: string
  , timeToLive: number | null /* ms */
  ): null

  removeItem(namespace: string, itemKey: string): null

  clearItemsByNamespace(namespace: string): null
}
