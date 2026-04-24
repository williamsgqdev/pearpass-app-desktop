/// <reference types="@testing-library/jest-dom" />

import React from 'react'

import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

import { ImportItemsContent } from './index'
;(globalThis as { React?: typeof React }).React = React

jest.mock('../../../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}))

jest.mock('../../../../context/LoadingContext', () => ({
  useGlobalLoading: jest.fn()
}))

const mockSetToast = jest.fn()
jest.mock('../../../../context/ToastContext', () => ({
  useToast: () => ({
    setToast: mockSetToast
  })
}))

jest.mock('@tetherto/pearpass-lib-vault', () => ({
  useCreateRecord: () => ({
    createRecord: jest.fn()
  }),
  decryptExportData: jest.fn()
}))

jest.mock('@tetherto/pearpass-lib-constants', () => ({
  MAX_IMPORT_RECORDS: 1000
}))

jest.mock('@tetherto/pearpass-lib-data-import', () => ({
  decryptKeePassKdbx: jest.fn(),
  parse1PasswordData: jest.fn(),
  parseBitwardenData: jest.fn(),
  parseKeePassData: jest.fn(),
  parseLastPassData: jest.fn(),
  parseNordPassData: jest.fn(),
  parsePearPassData: jest.fn(),
  parseProtonPassData: jest.fn()
}))

jest.mock('../../../SettingsView/ImportTab/utils/readFileContent', () => ({
  readFileContent: jest.fn()
}))

jest.mock('../../../../utils/logger', () => ({
  logger: {
    error: jest.fn()
  }
}))

jest.mock('./styles', () => ({
  createStyles: () => ({
    container: {},
    listWrapper: {},
    listItems: {},
    listItemBorder: {},
    backButton: {},
    header: {},
    passwordSection: {},
    uploadArea: {},
    footer: {}
  })
}))

const mockTheme = {
  theme: {
    colors: {
      colorTextSecondary: '#888',
      colorTextPrimary: '#fff'
    }
  }
}

jest.mock('@tetherto/pearpass-lib-ui-kit', () => ({
  useTheme: () => mockTheme,
  PageHeader: ({ title }: { title: React.ReactNode }) => <h1>{title}</h1>,
  Text: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Title: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  Link: (props: { children?: React.ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={props.onClick}>
      {props.children}
    </button>
  ),
  ListItem: (props: {
    testID?: string
    title?: React.ReactNode
    subtitle?: React.ReactNode
    onClick?: () => void
  }) => (
    <button type="button" data-testid={props.testID} onClick={props.onClick}>
      <span>{props.title}</span>
      <span>{props.subtitle}</span>
    </button>
  ),
  UploadField: (props: { testID?: string }) => (
    <div data-testid={props.testID}>upload-field</div>
  ),
  PasswordField: (props: {
    testID?: string
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  }) => (
    <input
      data-testid={props.testID}
      value={props.value}
      onChange={props.onChange}
    />
  ),
  Button: (props: {
    children?: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    'aria-label'?: string
  }) => (
    <button
      type="button"
      aria-label={props['aria-label']}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  )
}))

jest.mock('@tetherto/pearpass-lib-ui-kit/icons', () => ({
  ArrowBackOutined: () => null,
  KeyboardArrowRightFilled: () => null
}))

describe('ImportItemsContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders import sources list', () => {
    render(<ImportItemsContent />)

    expect(
      screen.getByRole('heading', { name: 'Import Items' })
    ).toBeInTheDocument()
    expect(screen.getByTestId('settings-import-1password')).toBeInTheDocument()
    expect(screen.getByTestId('settings-import-bitwarden')).toBeInTheDocument()
    expect(
      screen.getByTestId('settings-import-unencrypted')
    ).toBeInTheDocument()
  })

  it('opens upload step and can navigate back', () => {
    render(<ImportItemsContent />)

    fireEvent.click(screen.getByTestId('settings-import-bitwarden'))

    expect(screen.getByText('Import from Bitwarden')).toBeInTheDocument()
    expect(screen.getByTestId('import-upload-field')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Import' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'back' }))

    expect(
      screen.getByRole('heading', { name: 'Import Items' })
    ).toBeInTheDocument()
  })
})
