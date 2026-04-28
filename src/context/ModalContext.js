import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo
} from 'react'

import { generateUniqueId } from '@tetherto/pear-apps-utils-generate-unique-id'
import { html } from 'htm/react'

import { Overlay } from '../components/Overlay'
import { BASE_TRANSITION_DURATION } from '../constants/transitions'
import { ModalWrapper } from '../containers/Modal'
import { SideDrawer } from '../containers/Modal/SideDrawer'

// Safety pad past the overlay's `transitionend` so we unmount strictly after
// the fade completes. Mirrors `SAFETY_BUFFER` in `useAnimatedVisibility.js`.
export const STACK_CLEANUP_BUFFER = 100

const ModalContext = createContext()

const getTopModal = (modalStack) => modalStack[modalStack.length - 1]

const DEFAULT_MODAL_PARAMS = {
  hasOverlay: true,
  overlayType: 'default',
  modalType: 'default',
  closable: true,
  replace: false
}

/**
 * @param {{
 *  children: import('react').ReactNode
 * }} props
 */
export const ModalProvider = ({ children }) => {
  const [modalStack, setModalStack] = useState([])

  const isOpen = !!modalStack.length

  // Use useCallback to create stable function references
  const setModal = useCallback((content, params) => {
    setModalStack((prevState) => {
      if (params?.replace) {
        return [
          {
            content,
            id: generateUniqueId(),
            isOpen: true,
            params: { ...DEFAULT_MODAL_PARAMS, ...params }
          }
        ]
      }

      return [
        ...prevState,
        {
          content,
          id: generateUniqueId(),
          isOpen: true,
          params: { ...DEFAULT_MODAL_PARAMS, ...params }
        }
      ]
    })
  }, [])

  const closeModal = useCallback(() => {
    let closingId = null

    setModalStack((prevState) => {
      if (prevState.length === 0) return prevState
      const topIdx = prevState.length - 1
      const top = prevState[topIdx]
      if (!top.isOpen) return prevState

      closingId = top.id
      return [...prevState.slice(0, topIdx), { ...top, isOpen: false }]
    })

    if (!closingId) return

    const idToRemove = closingId
    setTimeout(() => {
      setModalStack((prevState) => prevState.filter((m) => m.id !== idToRemove))
    }, BASE_TRANSITION_DURATION + STACK_CLEANUP_BUFFER)
  }, [])

  useEffect(() => {
    const handleKeydown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        const topModal = getTopModal(modalStack)
        if (topModal?.params?.closable !== false) {
          void closeModal()
        }
      }
    }

    window.addEventListener('keydown', handleKeydown)

    return () => {
      window.removeEventListener('keydown', handleKeydown)
    }
  }, [isOpen])

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({ isOpen, setModal, closeModal }),
    [isOpen, setModal, closeModal]
  )

  return html`
    <${ModalContext.Provider} value=${contextValue}>
      ${children}
      ${modalStack?.map(
        ({ content, id, isOpen, params }) => html`
          <${ModalWrapper} key=${id}>
            ${params.hasOverlay &&
            html`<${Overlay}
              onClick=${params?.closable ? closeModal : undefined}
              type=${params.overlayType}
              isOpen=${isOpen}
            /> `}
            ${params.modalType === 'sideDrawer' &&
            html`<${SideDrawer} isOpen=${isOpen}> ${content} <//>`}
            ${params.modalType === 'default' && isOpen && content}
          <//>
        `
      )}
    <//>
  `
}

/**
 * @returns {{
 *   isOpen: boolean,
 *   setModal: (content: any, params?: any) => void,
 *   closeModal: () => void
 * }}
 */
export const useModal = () => useContext(ModalContext)
