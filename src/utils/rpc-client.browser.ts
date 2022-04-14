import { IAPI, expectedVersion } from '@src/contract'
import { ClientProxy, BatchClient, BatchClientProxy, createBatchProxy } from 'delight-rpc'
import { createClient, createBatchClient } from '@delight-rpc/websocket-browser'
import { waitForEventTarget } from '@blackglory/wait-for'

export async function createRPCClient(url: string): Promise<{
  client: ClientProxy<IAPI>
  batchClient: BatchClient<IAPI>
  proxy: BatchClientProxy<IAPI, unknown>
  close: () => void
}> {
  const ws = new WebSocket(url)
  await waitForEventTarget(ws, 'open')
  const [client, closeClient] = createClient<IAPI>(ws, undefined, expectedVersion)
  const [batchClient, closeBatchClient] = createBatchClient(new WebSocket(url), expectedVersion)
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
