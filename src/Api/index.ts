import * as requests from './requests'
import * as socket from './socket'

// Config
import { Namespace, endpoints } from '../config'

// Utils
import { AccessToken } from './../Utils/accessToken'
import { Order, Swap, Position, Charts } from './../Utils/types'

export enum ApiError {
  Unauthorized = 'Unauthorized',
  IncorrectAccessToken = 'IncorrectAccessToken',
  ExpiredToken = 'ExpiredToken'
}

type ApiOptionsArguments = {
  namespace?: Namespace
}

type ApiOptions = {
  namespace: Namespace
}

export default class Api {
  private readonly _options: ApiOptions
  private readonly _endpoint: string

  private readonly _socket: socket.SocketClient

  private _accessToken: string | null = null

  public constructor(options?: ApiOptionsArguments) {
    // Options
    const defaultOptions: ApiOptions = {
      namespace: Namespace.production
    }

    this._options = {
      ...defaultOptions,
      ...options
    }

    this._endpoint = endpoints[this._options.namespace]

    this._socket = new socket.SocketClient(this._endpoint)
  }

  // HTTP Api

  // Config
  public getMetaConfig(): Promise<requests.MetaConfigResponse> {
    return requests.metaConfig.get(this._endpoint)
  }

  // Products
  public getProducts(): Promise<requests.ProductsResponse> {
    return requests.products.get(this._endpoint)
  }

  public getFixedRateDepositQuote(productId: string, maturity: number, nominal: number): Promise<requests.ProductQuoteResponse> {
    return requests.products.quote(this._endpoint, productId, maturity, nominal)
  }

  // Auth
  public getAuthLoginData(): Promise<requests.AuthLoginDataResponse> {
    return requests.auth.get(this._endpoint)
  }

  // Wallet
  public getWalletBalance(accessToken = this._accessToken): Promise<requests.WalletBalanceResponse> {
    const _accessToken = this._validAccessToken(accessToken)

    return requests.wallet.get(this._endpoint, _accessToken)
  }

  // Orders
  public postOrderForm(order: requests.PostOrdersFormRequestBody, accessToken = this._accessToken): Promise<requests.PostOrdersFormResponse> {
    const _accessToken = this._validAccessToken(accessToken)

    return requests.orders.form(this._endpoint, order, _accessToken)
  }

  public postOrderSign(order: requests.PostOrdersSignRequestBody, accessToken = this._accessToken): Promise<requests.PostOrdersSignResponse> {
    const _accessToken = this._validAccessToken(accessToken)

    return requests.orders.sign(this._endpoint, order, _accessToken)
  }

  public putOrdersCancel(orderIds: string[], accessToken = this._accessToken): Promise<void> {
    const _accessToken = this._validAccessToken(accessToken)

    return requests.orders.cancel(this._endpoint, { orderIds }, _accessToken)
  }

  // Sockets

  // Swaps
  public subscribeSwaps(accessToken = this._accessToken): void {
    const _accessToken = this._validAccessToken(accessToken)

    this._socket.subscribe(socket.SocketChannels.SWAPS, { accessToken: _accessToken })
  }

  public unsubscribeSwaps(accessToken = this._accessToken): void {
    const _accessToken = this._validAccessToken(accessToken)

    this._socket.unsubscribe(socket.SocketChannels.SWAPS, { accessToken: _accessToken })
  }

  public onSwaps(fn: (response: socket.DataChannelResponse<Swap[]>) => unknown): void {
    this._socket.on(socket.SocketChannels.SWAPS, fn)
  }

  public offSwaps(fn: (response: socket.DataChannelResponse<Swap[]>) => unknown): void {
    this._socket.off(socket.SocketChannels.SWAPS, fn)
  }

  // Orders
  public subscribeOrders(accessToken = this._accessToken): void {
    const _accessToken = this._validAccessToken(accessToken)

    this._socket.subscribe(socket.SocketChannels.ORDERS, { accessToken: _accessToken })
  }

  public unsubscribeOrders(accessToken = this._accessToken): void {
    const _accessToken = this._validAccessToken(accessToken)

    this._socket.unsubscribe(socket.SocketChannels.ORDERS, { accessToken: _accessToken })
  }

  public onOrders(fn: (response: socket.DataChannelResponse<Order[]>) => unknown): void {
    this._socket.on(socket.SocketChannels.ORDERS, fn)
  }

  public offOrders(fn: (response: socket.DataChannelResponse<Order[]>) => unknown): void {
    this._socket.off(socket.SocketChannels.ORDERS, fn)
  }

  // Positions
  public subscribePositions(accessToken = this._accessToken): void {
    const _accessToken = this._validAccessToken(accessToken)

    this._socket.subscribe(socket.SocketChannels.POSITIONS, { accessToken: _accessToken })
  }

  public unsubscribePositions(accessToken = this._accessToken): void {
    const _accessToken = this._validAccessToken(accessToken)

    this._socket.unsubscribe(socket.SocketChannels.POSITIONS, { accessToken: _accessToken })
  }

  public onPositions(fn: (response: socket.DataChannelResponse<Position[]>) => unknown): void {
    this._socket.on(socket.SocketChannels.POSITIONS, fn)
  }

  public offPositions(fn: (response: socket.DataChannelResponse<Position[]>) => unknown): void {
    this._socket.off(socket.SocketChannels.POSITIONS, fn)
  }

  // Charts
  public subscribeCharts(productId: string): void {
    this._socket.subscribe(socket.SocketChannels.CHARTS, { id: productId })
  }

  public unsubscribeCharts(productId: string): void {
    this._socket.unsubscribe(socket.SocketChannels.CHARTS, { id: productId })
  }

  public onCharts(fn: (response: socket.DataChannelResponse<Charts>) => unknown): void {
    this._socket.on(socket.SocketChannels.CHARTS, fn)
  }

  public offCharts(fn: (response: socket.DataChannelResponse<Charts>) => unknown): void {
    this._socket.off(socket.SocketChannels.CHARTS, fn)
  }

  // Error message
  public onErrorMessage(fn: (response: socket.ErrorChannelResponse) => unknown): void {
    this._socket.on(socket.SocketChannels.ERROR_MESSAGE, fn)
  }

  public offErrorMessage(fn: (response: socket.ErrorChannelResponse) => unknown): void {
    this._socket.off(socket.SocketChannels.ERROR_MESSAGE, fn)
  }

  // Socket helpers
  public onError(fn: Function): void {
    this._socket.onError(fn)
  }

  public offError(fn: Function): void {
    this._socket.offError(fn)
  }

  public closeSocket(): void {
    this._socket.close()
  }

  // Helpers
  public set accessToken(accessToken: string) {
    this._accessToken = accessToken
  }

  private _parseAccessToken(accessToken: string): AccessToken {
    try {
      return JSON.parse(Buffer.from(accessToken, 'base64').toString())
    } catch (e) {
      throw new Error(ApiError.IncorrectAccessToken)
    }
  }

  private _validAccessToken(accessToken: string | null): string {
    if (!accessToken) {
      throw new Error(ApiError.Unauthorized)
    }

    if (!this._validTTL(accessToken)) {
      throw new Error(ApiError.ExpiredToken)
    }

    return accessToken
  }

  private _validTTL(accessToken: string): boolean {
    const { ttl } = this._parseAccessToken(accessToken)
    return ttl >= ~~(Date.now() / 1000)
  }
}
