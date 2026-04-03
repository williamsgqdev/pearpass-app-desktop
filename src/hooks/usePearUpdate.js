/** @typedef {import('pear-interface')} */

import { useEffect, useRef } from 'react'

import { html } from 'htm/react'

import { UpdateRequiredModalContent } from '../containers/Modal/UpdateRequiredModalContent'
import { useModal } from '../context/ModalContext'
import { PEAR_RUNTIME_UPDATED_MESSAGE } from '../updater'

export const usePearUpdate = () => {
  const { setModal } = useModal()
  const modalShownRef = useRef(false)

  const showUpdateRequiredModal = () => {
    if (modalShownRef.current) {
      // eslint-disable-next-line no-console
      console.log('usePearUpdate: modal already shown, skipping')
      return
    }
    if (!Pear.config.key) {
      // eslint-disable-next-line no-console
      console.log('usePearUpdate: Pear.config.key missing, skipping modal')
      return
    }

    setModal(
      html`<${UpdateRequiredModalContent} onUpdate=${handleUpdateApp} />`,
      { closable: false }
    )

    modalShownRef.current = true
  }

  useEffect(() => {
    if (typeof Pear?.messages === 'function') {
      Pear.messages(PEAR_RUNTIME_UPDATED_MESSAGE, (msg) => {
        const type = typeof msg === 'string' ? msg : msg?.type
        if (type !== PEAR_RUNTIME_UPDATED_MESSAGE.type) return
        showUpdateRequiredModal()
      })
    }
  }, [])
}

function handleUpdateApp() {
  Pear.restart({ platform: false })
}
