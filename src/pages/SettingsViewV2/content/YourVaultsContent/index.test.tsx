import React from 'react'

import '@testing-library/jest-dom'
import { render, screen, fireEvent, act } from '@testing-library/react'

import { AddDeviceModalContentV2 } from '../../../../containers/Modal/AddDeviceModalContentV2/AddDeviceModalContentV2'
import { CreateOrEditVaultModalContentV2 } from '../../../../containers/Modal/CreateOrEditVaultModalContentV2/CreateOrEditVaultModalContentV2'
import { YourVaultsContent } from './index'

const mockSetModal = jest.fn()
const mockCloseModal = jest.fn()

const vaultState: {
  current: { data: { id: string; name: string } | null }
  all: { data: { id: string; name: string }[] }
  records: { data: { id: string }[] | null }
} = {
  current: {
    data: { id: 'vault-main', name: 'Main Vault' }
  },
  all: { data: [{ id: 'vault-main', name: 'Main Vault' }] },
  records: { data: [] }
}

jest.mock('../../../../context/ModalContext', () => ({
  useModal: () => ({
    setModal: mockSetModal,
    closeModal: mockCloseModal
  })
}))

jest.mock('../../../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (str: string, values?: { count?: number }) => {
      if (values && 'count' in values && typeof values.count === 'number') {
        return values.count === 1
          ? '1 item'
          : `${values.count} items`
      }
      return str
    }
  })
}))

jest.mock('@tetherto/pearpass-lib-vault', () => ({
  useVault: () => ({ data: vaultState.current.data }),
  useVaults: () => ({ data: vaultState.all.data }),
  useRecords: () => ({ data: vaultState.records.data })
}))

jest.mock('./styles', () => ({
  createStyles: () => ({
    root: {},
    header: {},
    section: {},
    cardList: {},
    iconWrap: {},
    actions: {},
    footer: {}
  })
}))

jest.mock('@tetherto/pearpass-lib-ui-kit', () => ({
    useTheme: () => ({
      theme: {
        colors: {
          colorTextSecondary: '#999',
          colorTextPrimary: '#000',
          colorPrimary: '#00f',
          colorBorderPrimary: '#ccc'
        }
      }
    }),
    Button: ({
      children,
      onClick,
      'data-testid': dataTestid,
      iconBefore: _i,
      ...rest
    }: {
      children: React.ReactNode
      onClick?: () => void
      'data-testid'?: string
      iconBefore?: React.ReactNode
    } & React.ComponentProps<'button'>) => (
      <button
        type="button"
        data-testid={dataTestid}
        onClick={onClick}
        {...rest}
      >
        {children}
      </button>
    ),
    ContextMenu: ({
      children,
      open,
      onOpenChange,
      testID,
      trigger
    }: {
      children: React.ReactNode
      open: boolean
      onOpenChange: (o: boolean) => void
      testID: string
      trigger: React.ReactNode
    }) => (
      <div data-testid={testID}>
        <div
          onClick={() => onOpenChange(true)}
          onKeyDown={() => {}}
        >
          {trigger}
        </div>
        {open ? <div data-testid="context-menu-children">{children}</div> : null}
      </div>
    ),
    ListItem: ({
      testID,
      title,
      subtitle,
      rightElement,
      showDivider: _d,
      dividerColor: _c,
      withRoundedBottomBorders: _r,
      icon: _ic,
      selectable: _s
    }: {
      testID: string
      title: string
      subtitle?: string
      rightElement?: React.ReactNode
      [key: string]: unknown
    }) => (
      <div data-testid={testID}>
        <span>{title}</span>
        {subtitle ? <span>{subtitle}</span> : null}
        {rightElement}
      </div>
    ),
    MultiSlotInput: ({
      children,
      testID
    }: {
      children: React.ReactNode
      testID: string
    }) => <div data-testid={testID}>{children}</div>,
    NavbarListItem: (props: {
      testID: string
      label: string
      onClick: () => void
      [key: string]: unknown
    }) => {
      const { testID, label, onClick } = props
      return (
        <button data-testid={testID} type="button" onClick={onClick}>
          {label}
        </button>
      )
    },
    Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
    Title: ({
      children,
      as: Component = 'h2'
    }: {
      children: React.ReactNode
      as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'
    }) => <Component>{children}</Component>
}))

jest.mock('@tetherto/pearpass-lib-ui-kit/icons', () => ({
  Add: () => null,
  Edit: () => null,
  LockOutlined: () => null,
  MoreVert: () => null,
  PersonAdd: () => null
}))

const resetVaultFixtures = () => {
  vaultState.current = {
    data: { id: 'vault-main', name: 'Main Vault' }
  }
  vaultState.all = {
    data: [{ id: 'vault-main', name: 'Main Vault' }]
  }
  vaultState.records = { data: [] }
}

describe('YourVaultsContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    resetVaultFixtures()
  })

  it('renders null when there is no current vault', () => {
    vaultState.current = { data: null }

    const { container } = render(<YourVaultsContent />)

    expect(container.firstChild).toBeNull()
  })

  it('renders the card, current vault row, and create button for a single vault', () => {
    render(<YourVaultsContent />)

    expect(screen.getByTestId('settings-card-your-vault')).toBeInTheDocument()
    expect(screen.getByText('Your Vaults')).toBeInTheDocument()
    expect(screen.getByText('Current Vault')).toBeInTheDocument()
    const row = screen.getByTestId('settings-vault-item')
    expect(row.textContent).toContain('Main Vault')
    expect(row.textContent).toContain('0 items')
    expect(
      screen.queryByTestId('settings-other-vaults-multislot')
    ).not.toBeInTheDocument()
    expect(screen.getByTestId('settings-your-vaults-create').textContent).toBe(
      'Create new Vault'
    )
  })

  it('lists other vaults when the user has more than one vault', () => {
    vaultState.all = {
      data: [
        { id: 'vault-main', name: 'Main Vault' },
        { id: 'vault-other', name: 'Second Vault' }
      ]
    }

    render(<YourVaultsContent />)

    expect(screen.getByText('Other Vaults')).toBeInTheDocument()
    expect(screen.getByTestId('settings-other-vaults-multislot')).toBeInTheDocument()
    expect(
      screen.getByTestId('settings-other-vault-Second Vault')
    ).toBeInTheDocument()
  })

  it('opens the add-device modal when the invite control is used', () => {
    render(<YourVaultsContent />)

    fireEvent.click(screen.getByTestId('settings-vault-invite-button'))

    expect(mockSetModal).toHaveBeenCalledTimes(1)
    const arg = mockSetModal.mock.calls[0][0] as React.ReactElement
    expect(arg.type).toBe(AddDeviceModalContentV2)
  })

  it('opens the create-vault modal with shouldRedirectToMain false when create is pressed', () => {
    render(<YourVaultsContent />)

    fireEvent.click(screen.getByTestId('settings-your-vaults-create'))

    expect(mockSetModal).toHaveBeenCalledTimes(1)
    const el = mockSetModal.mock.calls[0][0] as React.ReactElement<
      Record<string, unknown>
    >
    expect(el.type).toBe(CreateOrEditVaultModalContentV2)
    const props = el.props as {
      shouldRedirectToMain?: boolean
      onClose: () => void
      onSuccess: () => void
    }
    expect(props.shouldRedirectToMain).toBe(false)
    expect(props.onClose).toBe(mockCloseModal)
    expect(props.onSuccess).toBe(mockCloseModal)
  })

  it('opens rename (edit) for the current vault from the context menu', async () => {
    render(<YourVaultsContent />)

    await act(async () => {
      fireEvent.click(screen.getByTestId('settings-vault-more-button'))
    })

    const rename = screen.getByTestId('settings-vault-edit-button')
    await act(async () => {
      fireEvent.click(rename)
    })

    expect(mockSetModal).toHaveBeenCalledTimes(1)
    const el = mockSetModal.mock.calls[0][0] as React.ReactElement<
      Record<string, unknown>
    >
    expect(el.type).toBe(CreateOrEditVaultModalContentV2)
    const editProps = el.props as { vault: { id: string; name: string }; onClose: () => void }
    expect(editProps.vault).toEqual({
      id: 'vault-main',
      name: 'Main Vault'
    })
    expect(editProps.onClose).toBe(mockCloseModal)
  })
})
