import { IAPI } from './contract'
import { ClientProxy, BatchClient, BatchClientProxy, createBatchProxy } from 'delight-rpc'
import { createClient, createBatchClient } from '@delight-rpc/websocket'
import { WebSocket } from 'ws'
import { waitForEventEmitter } from '@blackglory/wait-for'

export async function createRPCClient(url: string): Promise<{
  client: ClientProxy<IAPI>
  batchClient: BatchClient<IAPI>
  proxy: BatchClientProxy<IAPI, unknown>
  close: () => void
}> {
  const ws = new WebSocket(url)
  await waitForEventEmitter(ws, 'open')
  const [client, closeClient] = createClient<IAPI>(ws)
  const [batchClient, closeBatchClient] = createBatchClient(new WebSocket(url))
  const proxy = createBatchProxy<IAPI>()
  return {
    client
  , batchClient
  , proxy
  , close: () => {
      closeClient()
      closeBatchClient()
    }
  }
}
