import * as sigUtil from 'eth-sig-util'

// EIP712
interface IMessageTypeProperty {
  name: string
  type: string
}

export interface IMessageTypes {
  EIP712Domain: IMessageTypeProperty[]
  [additionalProperties: string]: IMessageTypeProperty[]
}

export type EIP712Message = sigUtil.TypedMessage<IMessageTypes>

// Orders
export enum AggregateType {
  NONE = 'NONE',
  FIXED_RATE_COMPOUND = 'FIXED_RATE_COMPOUND'
}

export enum PayReceiveType {
  FIXED = 'FIXED',
  FLOATING = 'FLOATING'
}

export enum SwapStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
  REJECTED = 'REJECTED',
}

export type Swap = {
  swapId: string
  createdAt: number
  pay: {
    type: PayReceiveType
    rate: number
    description: string
    accInterest: number
  }
  receive: {
    type: PayReceiveType
    rate: number
    description: string
    accInterest: number
  }
  nominal: number
  token: string
  maturity: number
  status: SwapStatus
  txHash: string
  fixedRate: null | {
    depositAmount: number
  }
}

export enum PositionByAddressType {
  // Loan
  L = 'L',
  // Deposit
  D = 'D'
}

export type Position = {
  type: PositionByAddressType
  createdAt: number
  token: string
  pay: null | {
    type: PayReceiveType
    rate: string
    description: string
    accInterest: number
  }
  receive: null | {
    type: PayReceiveType
    rate: string
    description: string
    accInterest: number
  }
  nominal: number
  populate: null | {
    productId: string
    pay: {
      type: PayReceiveType
      rate?: number
    }
    receive: {
      type: PayReceiveType
      rate?: number
    }
    nominal: number
    maturity: number
  }
}


export type Order = {
  orderId: string
  createdAt: number
  productId: string
  pay: {
    type: PayReceiveType
    rate: number
    description: string
  }
  receive: {
    type: PayReceiveType
    rate: number
    description: string
  }
  token: string
  status: PayReceiveType
  nominal: number
  filled: number
  maturity: number
}

type ChartsData = {
  timestamp: number
  value: number | null
}

export type Charts = {
  payFixed: ChartsData
  receiveFixed: ChartsData
}

// Requests

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

// Auth
export type AuthLoginDataResponse = {
  ttl: number
  data: EIP712Message
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
