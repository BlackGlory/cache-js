export interface IAPI {
  has(namespace: string, key: string): Promise<boolean>
  get(namespace: string, key: string): Promise<string | null>
  getWithMetadata(namespace: string, key: string): Promise<{
    value: string
    metadata: IMetadata
  } | null>
  set(
    namespace: string
  , key: string
  , value: string
  , timeToLive: number | null /* ms */
  ): Promise<null>
  del(namespace: string, key: string): Promise<null>
  clear(namespace: string): Promise<null>

  getAllItemKeys(namespace: string): Promise<string[]>
  getAllNamespaces(): Promise<string[]>
  stats(namespace: string): Promise<IStats>
}

export interface IStats {
  namespace: string
  items: number
}

export interface IMetadata {
  updatedAt: number
  timeToLive: number | null
}

export const expectedVersion = '0.3.0'
