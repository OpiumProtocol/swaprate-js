import { assert } from 'chai'

import Utils from '../../src/Utils'

import { privateKey, publicKey } from './../constants'

describe('Utils', () => {
  it('Should correctly sign typed message', () => {
    const data = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
        ],
        Login: [
          { name: 'message', type: 'string' },
        ],
      },
      domain: {
        name: 'SwapRate',
        version: '1',
      },
      primaryType: 'Login',
      message: {
        message: 'Login to SwapRate! Token valid till: 13371488',
      }
    }

    const signature = Utils.signMessage({
      data,
      privateKey
    })

    assert.equal(signature, '0x7f1774733457c25ddf2fbafa94ad89bf7eb539c060181bc549de85b68ffdd6f620858cc0365e4da7b8e37a1e88f0a8bea48ec6d53f984e052c51d966152989d11c')
  })

  it('Should correctly form access token', () => {
    const accessToken = Utils.formAccessToken({
      ttl: 13371488,
      address: publicKey,
      signature: '0x7f1774733457c25ddf2fbafa94ad89bf7eb539c060181bc549de85b68ffdd6f620858cc0365e4da7b8e37a1e88f0a8bea48ec6d53f984e052c51d966152989d11c'
    })

    assert.equal(accessToken, 'eyJ0dGwiOjEzMzcxNDg4LCJhZGRyZXNzIjoiMHg4MWVFNkRjOTZhQTFkMjhGNTAxN2I4ZTg0RDdmN0VCM0U4MTExMjBCIiwic2lnbmF0dXJlIjoiMHg3ZjE3NzQ3MzM0NTdjMjVkZGYyZmJhZmE5NGFkODliZjdlYjUzOWMwNjAxODFiYzU0OWRlODViNjhmZmRkNmY2MjA4NThjYzAzNjVlNGRhN2I4ZTM3YTFlODhmMGE4YmVhNDhlYzZkNTNmOTg0ZTA1MmM1MWQ5NjYxNTI5ODlkMTFjIn0=')
  })
})
