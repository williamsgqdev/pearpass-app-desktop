import { renderHook, act } from '@testing-library/react'

import { usePearUpdate } from './usePearUpdate'
import { useModal } from '../context/ModalContext'

global.Pear = {
  messages: jest.fn(),
  restart: jest.fn(),
  reload: jest.fn(),
  config: { tier: 'prod', key: 'some-key' }
}

jest.mock('../context/ModalContext', () => ({
  useModal: jest.fn()
}))

describe('usePearUpdate', () => {
  let setModalMock
  let runtimeUpdatedCb

  beforeEach(() => {
    setModalMock = jest.fn()
    useModal.mockReturnValue({ setModal: setModalMock })
    runtimeUpdatedCb = null
    Pear.messages.mockClear()
    Pear.restart.mockClear()
    Pear.reload.mockClear()
    Pear.config.tier = 'prod'
    Pear.config.key = 'some-key'

    Pear.messages.mockImplementation((filter, cb) => {
      runtimeUpdatedCb = cb
      return { destroy: jest.fn() }
    })
  })

  it('subscribes to Pear runtime updated messages', () => {
    renderHook(() => usePearUpdate())
    expect(Pear.messages).toHaveBeenCalledTimes(1)
  })

  it('shows modal when runtime updated message is received', async () => {
    renderHook(() => usePearUpdate())

    expect(runtimeUpdatedCb).toBeInstanceOf(Function)
    await act(async () => runtimeUpdatedCb({ type: 'pear-runtime/updated' }))

    expect(setModalMock).toHaveBeenCalledTimes(1)
    expect(Pear.restart).not.toHaveBeenCalled()
    expect(Pear.reload).not.toHaveBeenCalled()
  })

  it('does not show modal for non-updated message types', async () => {
    renderHook(() => usePearUpdate())

    expect(runtimeUpdatedCb).toBeInstanceOf(Function)
    await act(async () => runtimeUpdatedCb({ type: 'pear-runtime/updating' }))

    expect(setModalMock).not.toHaveBeenCalled()
  })

  it('does not show modal in DEV (no Pear.config.key)', async () => {
    Pear.config.key = null
    renderHook(() => usePearUpdate())

    expect(runtimeUpdatedCb).toBeInstanceOf(Function)
    await act(async () => runtimeUpdatedCb({ type: 'pear-runtime/updated' }))

    expect(setModalMock).not.toHaveBeenCalled()
    expect(Pear.restart).not.toHaveBeenCalled()
    expect(Pear.reload).not.toHaveBeenCalled()
  })

  it('triggers restart when update handler is called', async () => {
    renderHook(() => usePearUpdate())

    expect(runtimeUpdatedCb).toBeInstanceOf(Function)
    await act(async () => runtimeUpdatedCb({ type: 'pear-runtime/updated' }))

    const modalVNode = setModalMock.mock.calls[0][0]
    modalVNode.props.onUpdate()
    expect(Pear.restart).toHaveBeenCalledWith({ platform: false })
  })
})
