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

enum SwapStatus {
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
