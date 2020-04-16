import axios from 'axios'

import {
  EIP712Message,

  PayReceiveType,
  AggregateType
} from '../Utils/types'

// Meta
export type SupportedToken = {
  title: string
  address: string
  decimals: number
}

export type MetaConfigResponse = {
  networkId: number
  defaults: {
    productId: string
  }
  supportedTokens: SupportedToken[]
  opiumContracts: {
    TokenSpender: string
    CompoundSupplyAggregator: string
  }
  supportedMaturities: number[]
}

export const metaConfig = {
  get: (endpoint: string): Promise<MetaConfigResponse> =>
    axios
      .get(`${endpoint}/meta/config`)
      .then(response => response.data),
}

// Wallet
type BalanceToken = {
  title: string
  address: string
  decimals: number
  total: string
  allowance: string
  compoundSupplyAllowance: string
}

export type WalletBalanceResponse = {
  eth: string
  tokens: BalanceToken[]
}

export const wallet = {
  get: (endpoint: string, accessToken: string): Promise<WalletBalanceResponse> =>
    axios
      .get(`${endpoint}/wallet/balance`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      .then(response => response.data),
}


// Auth
export type AuthLoginDataResponse = {
  ttl: number
  data: EIP712Message
}

export const auth = {
  get: (endpoint: string): Promise<AuthLoginDataResponse> =>
    axios
      .get(`${endpoint}/auth/loginData`)
      .then(response => response.data),
}


// Orders
export type PostOrdersFormRequestBody = {
  productId: string
  pay: {
    type: PayReceiveType
    rate: number | null
  }
  receive: {
    type: PayReceiveType
    rate: number | null
  }
  nominal: number
  maturity: number
  partialFill: boolean
  aggregate: AggregateType
}

export type PostOrdersFormResponse = {
  formedOrderId: string
  orderToSign: EIP712Message
}

export type PostOrdersSignRequestBody = {
  formedOrderId: string
  signature: string
}

export type PostOrdersSignResponse = {
  orderId: string
}

export type PutOrdersCancelRequestQuery = {
  orderIds: string[]
}

export const orders = {
  form: (endpoint: string, body: PostOrdersFormRequestBody, accessToken: string): Promise<PostOrdersFormResponse> =>
    axios
      .post(`${endpoint}/orders/form`, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      .then(response => response.data),

  sign: (endpoint: string, body: PostOrdersSignRequestBody, accessToken: string): Promise<PostOrdersSignResponse> =>
    axios
      .post(`${endpoint}/orders/sign`, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      .then(response => response.data),

  cancel: (endpoint: string, body: PutOrdersCancelRequestQuery, accessToken: string): Promise<void> =>
    axios
      .put(`${endpoint}/orders/cancel?${body.orderIds.map(orderId => `orderIds[]=${orderId}`)}`, null, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      .then(response => response.data),
}


// Products

export enum ProductType {
  COMPOUND = 'COMPOUND'
}

export enum ProductSubtype {
  SUPPLY = 'SUPPLY',
  BORROW = 'BORROW'
}

export type Product = {
  productId: string
  title: string
  token: string
  type: ProductType
  subtype: ProductSubtype
  margin: number
  fixedRateSupported: boolean
}

export type ProductsResponse = Product[]

export type ProductQuoteResponse = {
  fixedRate: number
}

export const products = {
  get: (endpoint: string): Promise<ProductsResponse> =>
    axios
      .get(`${endpoint}/products`)
      .then(response => response.data),

  quote: (endpoint: string, productId: string, maturity: number, nominal: number): Promise<ProductQuoteResponse> =>
    axios
      .get(`${endpoint}/products/${productId}/quote?maturity=${maturity}&nominal=${nominal}`)
      .then(response => response.data),
}
