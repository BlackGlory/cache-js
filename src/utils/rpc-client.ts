import { createBatchClient, createClient } from '@delight-rpc/extra-websocket'
import { BatchClient, BatchClientProxy, ClientProxy, createBatchProxy } from 'delight-rpc'
import { timeoutSignal } from 'extra-abort'
import { autoReconnect, ExtraWebSocket } from 'extra-websocket'
import { WebSocket } from 'ws'

export async function createRPCClient<IAPI extends object>(options: {
  url: string

  basicAuth?: {
    username: string
    password: string
  }
  expectedVersion?: string

  timeoutForConnection?: number
  retryIntervalForReconnection?: number
}): Promise<{
  client: ClientProxy<IAPI>
  batchClient: BatchClient<IAPI>
  proxy: BatchClientProxy<IAPI, unknown>
, close: () => Promise<void>
}> {
  const ws = new ExtraWebSocket(() => new WebSocket(options.url, {
    auth: options.basicAuth
       && `${options.basicAuth.username}:${options.basicAuth.password}`
  }))

  const cancelAutoReconnect = autoReconnect(
    ws
  , options.retryIntervalForReconnection
  , options.timeoutForConnection
  )

  await ws.connect(
    options.timeoutForConnection
  ? timeoutSignal(options.timeoutForConnection)
  : undefined
  )

  const [client, closeClient] = createClient<IAPI>(ws, {
    expectedVersion: options.expectedVersion
  })
  const [batchClient, closeBatchClient] = createBatchClient(ws, {
    expectedVersion: options.expectedVersion
  })
  const proxy = createBatchProxy<IAPI>()


  return {
    client
  , batchClient
  , proxy
  , async close() {
      closeClient()
      closeBatchClient()
      cancelAutoReconnect()

      await ws.close()
    }
  }
}
