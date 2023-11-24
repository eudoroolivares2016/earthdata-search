/**
 * Race two promises to keep from waiting too long for a given request.
 * @param {Promise} promise The promise that does the actual work
 * @param {Integer} secondsSoonerThanLambda The delta between lambdas timeout and the external request timeout
 */
export const withTimeout = (promise, secondsSoonerThanLambda = 10) => {
  // Default the lambda timeout to 30 seconds in the event its not provided
  const lambdaTimeout = (process.env.lambdaTimeout || 30)

  // We'll timeout all external requests 10 seconds sooner than our lambdas
  // to ensure the lambda has enough time to complete its execution
  const externalTimeout = ((lambdaTimeout * 1000) - (secondsSoonerThanLambda * 1000))

  // eslint-disable-next-line prefer-promise-reject-errors
  const timeout = new Promise((resolve, reject) => setTimeout(() => reject(null), externalTimeout))

  // Race the two promises
  return Promise.race([promise, timeout]).then(
    // Our external request
    (value) => value,

    // Our promise that will timeout after `externalTimeout` milliseconds
    () => {
      console.log(`Request timed out after ${externalTimeout / 1000}s`)

      throw new Error('Request timed out')
    }
  )
}
