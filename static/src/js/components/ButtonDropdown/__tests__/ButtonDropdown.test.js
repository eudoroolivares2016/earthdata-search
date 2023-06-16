import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import ButtonDropdown from '../ButtonDropdown'

const setup = () => {
  const props = {
    onClick: jest.fn(),
    buttonLabel: 'Test Label',
    buttonContent: 'Test Button Content',
    className: 'some-test-classname'
  }

  act(() => {
    render(
      <ButtonDropdown {...props}>Button Text</ButtonDropdown>
    )
  })
}

describe('ButtonDropdown component', () => {
  test('should render self', async () => {
    setup()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /test label/i })).toBeInTheDocument()
      expect(screen.queryByText('Button Text')).not.toBeInTheDocument()
    })
  })

  test('update display when dropdown is opened', async () => {
    setup()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button'))
    await waitFor(() => {
      expect(screen.getByText('Button Text')).toBeInTheDocument()
    })
  })

  describe('icon', () => {
    test('displays correctly by default', async () => {
      setup()
      await waitFor(() => {
        expect(screen.getByTestId('dropdown-closed')).toBeInTheDocument()
      })
    })

    test('displays correctly when opened', async () => {
      setup()
      const user = userEvent.setup()
      await user.click(screen.getByRole('button'))
      await waitFor(() => {
        expect(screen.getByTestId('dropdown-open')).toBeInTheDocument()
      })
    })
  })
})
