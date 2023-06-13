import { SFNClient } from '@aws-sdk/client-sfn'

import { startOrderStatusUpdateWorkflow } from '../startOrderStatusUpdateWorkflow'

jest.mock('@aws-sdk/client-sfn', () => {
  const original = jest.requireActual('@aws-sdk/client-sfn')
  const stepFunctionData = jest.fn()

  return {
    ...original,
    SFNClient: jest.fn().mockImplementation(() => ({
      startExecution: stepFunctionData
        .mockResolvedValue(stepFunctionData)
    }))
  }
})
// TODO: Not sure if this variable name is confusing but, it was there before
const client = new SFNClient()
console.log('🚀 ~ file: startOrderStatusUpdateWorkflow.test.js:19 ~ stepFunctionData:', client)

const OLD_ENV = process.env

beforeEach(() => {
  jest.clearAllMocks()

  // Manage resetting ENV variables
  jest.resetModules()
  process.env = { ...OLD_ENV }
  delete process.env.NODE_ENV
})

afterEach(() => {
  // Restore any ENV variables overwritten in tests
  process.env = OLD_ENV
})

describe('startOrderStatusUpdateWorkflow', () => {
  test('starts the order status workflow', async () => {
    process.env.updateOrderStatusStateMachineArn = 'order-status-arn'

    await startOrderStatusUpdateWorkflow(1, 'access-token', 'ESI')

    expect(client.startExecution).toBeCalledTimes(1)

    // TODO: Why does this no longer have a [] around it?
    expect(client.startExecution).toHaveBeenCalledWith(
      {
        stateMachineArn: 'order-status-arn',
        input: JSON.stringify({
          id: 1,
          accessToken: 'access-token',
          orderType: 'ESI'
        })
      }
    )
  })
  console.log('🚀 ~ file: startOrderStatusUpdateWorkflow.test.js:67 ~ test ~ stepFunctionData.startExecution:', client.startExecution)
})
