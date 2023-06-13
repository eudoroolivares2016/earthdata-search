import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager'
import { getSecretEarthdataConfig } from '../../../../sharedUtils/config'
import { getSecretsManagerConfig } from '../aws/getSecretsManagerConfig'

let secretsmanager
let ursSystemCredentials

/**
 * Returns the decrypted urs system credentials from Secrets Manager
 * @param {String} earthdataEnvironment The CMR Environment to retrieve a token from
 */
export const getUrsSystemCredentials = async (earthdataEnvironment) => {
  if (ursSystemCredentials == null) {
    if (secretsmanager == null) {
      secretsmanager = new SecretsManagerClient(getSecretsManagerConfig())
    }

    if (process.env.NODE_ENV === 'development') {
      const {
        cmrSystemUsername, cmrSystemPassword
      } = getSecretEarthdataConfig(earthdataEnvironment)

      return {
        username: cmrSystemUsername,
        password: cmrSystemPassword
      }
    }

    console.log(`Fetching UrsSystemPasswordSecret_${earthdataEnvironment}`)

    const params = {
      SecretId: `UrsSystemPasswordSecret_${earthdataEnvironment}`
    }

    // If not running in development mode fetch secrets from AWS
    const secretValue = await secretsmanager.send(params)

    ursSystemCredentials = JSON.parse(secretValue.SecretString)
  }

  return ursSystemCredentials
}
