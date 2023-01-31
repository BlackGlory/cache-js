import { IAPI, expectedVersion } from '@src/contract.js'
import { ClientProxy, BatchClient, BatchClientProxy, createBatchProxy } from 'delight-rpc'
import { createClient, createBatchClient } from '@delight-rpc/extra-websocket'
import { WebSocket } from 'ws'
import { ExtraWebSocket, autoReconnect } from 'extra-websocket'

export async function createRPCClient(
  url: string
, retryIntervalForReconnection?: number
): Promise<{
  client: ClientProxy<IAPI>
  batchClient: BatchClient<IAPI>
  proxy: BatchClientProxy<IAPI, unknown>
  close: () => Promise<void>
}> {
  const ws = new ExtraWebSocket(() => new WebSocket(url))
  const cancelAutoReconnect = autoReconnect(ws, retryIntervalForReconnection)
  await ws.connect()

  const [client, closeClient] = createClient<IAPI>(ws, { expectedVersion })
  const [batchClient, closeBatchClient] = createBatchClient(ws, { expectedVersion })
  const proxy = createBatchProxy<IAPI>()

  return {
    client
  , batchClient
  , proxy
  , close: async () => {
      closeClient()
      closeBatchClient()
      cancelAutoReconnect()
      await ws.close()
    }
  }
}
