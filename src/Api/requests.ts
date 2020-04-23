import axios from 'axios'

import {
  MetaConfigResponse,

  WalletBalanceResponse,

  AuthLoginDataResponse,

  PostOrdersFormRequestBody,
  PostOrdersFormResponse,

  PostOrdersSignRequestBody,
  PostOrdersSignResponse,

  PutOrdersCancelRequestQuery,

  ProductsResponse,

  ProductQuoteResponse
} from '../Utils/types'

export const metaConfig = {
  get: (endpoint: string): Promise<MetaConfigResponse> =>
    axios
      .get(`${endpoint}/meta/config`)
      .then(response => response.data),
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

export const auth = {
  get: (endpoint: string): Promise<AuthLoginDataResponse> =>
    axios
      .get(`${endpoint}/auth/loginData`)
      .then(response => response.data),
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
