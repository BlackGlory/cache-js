import { JSONValue } from '@blackglory/prelude'

export const expectedVersion = '^0.9.0'

export interface INamespaceStats {
  items: number
}

export interface IItem {
  value: JSONValue
  metadata: IItemMetadata
}

export interface IItemMetadata {
  updatedAt: number
  timeToLive: number | null
}

export interface IAPI {
  getAllNamespaces(): string[]
  getAllItemKeys(namespace: string): string[]

  getNamespaceStats(namespace: string): INamespaceStats

  hasItem(namespace: string, itemKey: string): boolean

  getItem(namespace: string, itemKey: string): IItem | null
  getItemValue(namespace: string, itemKey: string): JSONValue | null

  setItem(
    namespace: string
  , itemKey: string
  , itemValue: JSONValue
  , timeToLive: number | null /* ms */
  ): null

  removeItem(namespace: string, itemKey: string): null

  clearItemsByNamespace(namespace: string): null
}
