import SocketIoClient, { Socket } from 'socket.io-client'

import { Swap, Order, Charts, Position } from '../Utils/types'

export enum SocketChannels {
  ERROR_MESSAGE = 'error:message',
  SWAPS = 'swaps:address',
  POSITIONS = 'positions:address',
  ORDERS = 'orders:address',
  CHARTS = 'products:chart',
}

// Data channel response
export type ErrorChannelResponse = {
  message: string
  data: IdSubscriptionParams | {}
}

export type DataChannelResponse<TData> = {
  ch: SocketChannels
  p: IdSubscriptionParams | {}
  a: 'set'
  d: TData
}

// Params types
type ProtectedSubscriptionParams = {
  accessToken: string
}

type IdSubscriptionParams = {
  id: string
}

// Helper
type ParamsByChannel<TChannel extends SocketChannels> = 
  TChannel extends SocketChannels.SWAPS ? ProtectedSubscriptionParams :
  TChannel extends SocketChannels.POSITIONS ? ProtectedSubscriptionParams :
  TChannel extends SocketChannels.ORDERS ? ProtectedSubscriptionParams :
  TChannel extends SocketChannels.CHARTS ? IdSubscriptionParams : {}

type ResponseByChannel<TChannel extends SocketChannels> = 
  TChannel extends SocketChannels.ERROR_MESSAGE ? ErrorChannelResponse :
  TChannel extends SocketChannels.SWAPS ? DataChannelResponse<Swap[]> :
  TChannel extends SocketChannels.POSITIONS ? DataChannelResponse<Position[]> :
  TChannel extends SocketChannels.ORDERS ? DataChannelResponse<Order[]> :
  TChannel extends SocketChannels.CHARTS ? DataChannelResponse<Charts> : {}

export class SocketClient {
  private _socket: typeof Socket
  
  public constructor(endpoint: string) {
    this._socket = SocketIoClient(endpoint)
  }

  public on<TChannel extends SocketChannels>(channel: TChannel, fn: (response: ResponseByChannel<TChannel>) => unknown): this {
    this._socket.on(channel, fn)
    return this
  }

  public off<TChannel extends SocketChannels>(channel: TChannel, fn: (response: ResponseByChannel<TChannel>) => unknown): this {
    this._socket.off(channel, fn)
    return this
  }

  public subscribe<TChannel extends SocketChannels>(channel: TChannel, params: ParamsByChannel<TChannel>): this {
    this._socket.emit('subscribe', {
      ch: channel,
      ...params
    })
    return this
  }

  public unsubscribe<TChannel extends SocketChannels>(channel: TChannel, params: ParamsByChannel<TChannel>): this {
    this._socket.emit('unsubscribe', {
      ch: channel,
      ...params
    })
    return this
  }

  public onError(fn: Function): this {
    this._socket.on('error', fn)
    return this
  }

  public offError(fn: Function): this {
    this._socket.off('error', fn)
    return this
  }

  public close(): void {
    this._socket.close()
  }
}
