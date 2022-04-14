import { IAPI } from './contract'
import { ClientProxy } from 'delight-rpc'
import { createClient } from '@delight-rpc/websocket'
import { WebSocket } from 'ws'

export function createRPCClient(url: string): {
  client: ClientProxy<IAPI>
  close: () => void
} {
  const [client, close] = createClient<IAPI>(new WebSocket(url))
  return { client, close }
}
