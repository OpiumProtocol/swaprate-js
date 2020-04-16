import { assert } from 'chai'

import { Namespace } from '../../src/config'
import Api, { ApiError } from '../../src/Api'
import Utils from '../../src/Utils'

import { PayReceiveType, AggregateType, Order } from '../../src/Utils/types'

import { privateKey, publicKey } from './../constants'

let api: Api
let productId: string
let maturities: number[]
let accessToken: string
let formedOrderId: string
let signedOrder: string
let signedOrderId: string
let orders: Order[] = []
let lastOrdersLength: number

const unexpectedPromiseResolve = new Error('Unexpected Promise resolve')

const delay = (seconds: number): Promise<void> => new Promise(resolve => {
  setTimeout(resolve, seconds * 1000)
})

describe('Api', () => {
  it('Should successfully initialize Api class with default options', () => {
    const _api = new Api()
    assert.ok(_api instanceof Api)
  })

  before(() => {
    api = new Api({
      namespace: Namespace.development
    })
  })

  after(() => {
    api.closeSocket()
    setTimeout(process.exit, 5000)
  })

  it('Should GET meta/config', async () => {
    const metaConfig = await api.getMetaConfig()

    productId = metaConfig.defaults.productId
    maturities = metaConfig.supportedMaturities

    assert.exists(metaConfig)
    assert.exists(metaConfig.networkId)
    assert.exists(metaConfig.defaults.productId)
    assert.exists(metaConfig.opiumContracts.TokenSpender)
    assert.exists(metaConfig.opiumContracts.CompoundSupplyAggregator)
    assert.exists(metaConfig.supportedMaturities.length)
    assert.exists(metaConfig.supportedTokens.length)
    assert.exists(metaConfig.supportedTokens[0].title)
    assert.exists(metaConfig.supportedTokens[0].address)
    assert.exists(metaConfig.supportedTokens[0].decimals)
  })

  it('Should GET /products', async () => {
    const products = await api.getProducts()

    assert.exists(products)
    assert.exists(products.length)
    assert.exists(products[0].productId)
    assert.exists(products[0].title)
    assert.exists(products[0].token)
    assert.exists(products[0].type)
    assert.exists(products[0].subtype)
    assert.exists(products[0].margin)
    assert.exists(products[0].fixedRateSupported)
  })

  it('Should GET /products/:productId/quote', async () => {
    const fixedRateDepositQuote = await api.getFixedRateDepositQuote(productId, maturities[0], 100)

    assert.exists(fixedRateDepositQuote)
    assert.exists(fixedRateDepositQuote.fixedRate)
  })

  it('Should GET /auth/loginData', async () => {
    const loginData = await api.getAuthLoginData()

    const signature = Utils.signMessage({ data: loginData.data, privateKey })
    accessToken = Utils.formAccessToken({ ttl: loginData.ttl, address: publicKey, signature })

    assert.exists(loginData)
    assert.exists(loginData.ttl)
    assert.exists(loginData.data)
  })

  it('Should throw on unauthorized GET /wallet/balance', async () => {
    try {
      await api.getWalletBalance()
      throw unexpectedPromiseResolve
    } catch (e) {
      assert.equal(e.message, ApiError.Unauthorized)
    }
  })

  it('Should throw on incorrect accessToken GET /wallet/balance', async () => {
    try {
      await api.getWalletBalance('Incorrect Access Token')
      throw unexpectedPromiseResolve
    } catch (e) {
      assert.equal(e.message, ApiError.IncorrectAccessToken)
    }
  })

  it('Should set access token and GET /wallet/balance', async () => {
    // Set formed access token
    api.accessToken = accessToken

    // Connect to sockets
    api.onOrders(res => {
      orders = res.d
    })
    api.subscribeOrders()

    const balance = await api.getWalletBalance()

    assert.exists(balance)
    assert.exists(balance.eth)
    assert.exists(balance.tokens)
    assert.exists(balance.tokens[0])
    assert.exists(balance.tokens[0].title)
    assert.exists(balance.tokens[0].address)
    assert.exists(balance.tokens[0].decimals)
    assert.exists(balance.tokens[0].total)
    assert.exists(balance.tokens[0].allowance)
    assert.exists(balance.tokens[0].compoundSupplyAllowance)
  })

  it('Should POST /orders/form', async () => {
    const order = {
      productId,
      pay: {
        type: PayReceiveType.FIXED,
        rate: 0.04
      },
      receive: {
        type: PayReceiveType.FLOATING,
        rate: null
      },
      nominal: 100,
      maturity: maturities[0],
      partialFill: true,
      aggregate: AggregateType.NONE,
    }

    const formedOrder = await api.postOrderForm(order)
    
    formedOrderId = formedOrder.formedOrderId
    signedOrder = Utils.signMessage({ data: formedOrder.orderToSign, privateKey })

    assert.exists(formedOrder)
    assert.exists(formedOrder.formedOrderId)
    assert.exists(formedOrder.orderToSign)
  })

  it('Should POST /orders/sign', async () => {
    const order = {
      formedOrderId,
      signature: signedOrder
    }

    lastOrdersLength = orders.length

    const signedOrderResponse = await api.postOrderSign(order)

    signedOrderId = signedOrderResponse.orderId

    assert.exists(signedOrderResponse)
    assert.exists(signedOrderResponse.orderId)
  })

  it('Should check orders length', async () => {
    await delay(2)
    assert.equal(orders.length, lastOrdersLength + 1)
  })
    .timeout(3000)

  it('Should PUT /orders/cancel', async () => {
    await api.putOrdersCancel([ signedOrderId ])
  })

  it('Should check orders length', async () => {
    await delay(2)
    assert.equal(orders.length, lastOrdersLength)
  })
    .timeout(3000)
})
