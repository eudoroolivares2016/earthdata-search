import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager'

import { getUrsSystemCredentials } from '../getUrsSystemCredentials'

jest.mock('@aws-sdk/client-secrets-manager', () => {
  const original = jest.requireActual('@aws-sdk/client-secrets-manager')
  const sendMock = jest.fn().mockReturnValueOnce({
    SecretString: '{"username":"test", "password":"password"}'
  })

  return {
    ...original,
    SecretsManagerClient: jest.fn().mockImplementation(() => ({
      send: sendMock
    }))
  }
})

const client = new SecretsManagerClient()

describe('getUrsSystemCredentials', () => {
  // TODO: why did we end up not needing the "input outer obj"
  test('fetches urs credentials from secrets manager', async () => {
    const response = await getUrsSystemCredentials('prod')

    expect(response).toEqual({
      username: 'test',
      password: 'password'
    })

    expect(client.send).toBeCalledTimes(1)
    expect(client.send).toHaveBeenCalledWith(
      { SecretId: 'UrsSystemPasswordSecret_prod' }
    )
  })
})
