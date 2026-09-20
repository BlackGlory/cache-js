import { BatchClient, BatchClientProxy, ClientProxy, createBatchProxy } from 'delight-rpc'
import { createBatchClient, createClient } from '@delight-rpc/extra-native-websocket'
import { ExtraNativeWebSocket, autoReconnect } from 'extra-native-websocket'
import { timeoutSignal } from 'extra-abort'
import { go } from '@blackglory/prelude'

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
  close: () => Promise<void>
}> {
  const url = go(() => {
    const url = new URL(options.url, document.URL)

    if (options.basicAuth) {
      url.username = options.basicAuth.username
      url.password = options.basicAuth.password
    }

    return url
  })

  const ws = new ExtraNativeWebSocket(() => new WebSocket(url))

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
