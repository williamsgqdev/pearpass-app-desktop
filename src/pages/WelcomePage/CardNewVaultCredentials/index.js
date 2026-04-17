import { useEffect } from 'react'

import { html } from 'htm/react'

import { NAVIGATION_ROUTES } from '../../../constants/navigation'
import { CreateOrEditVaultModalContentV2 } from '../../../containers/Modal/CreateOrEditVaultModalContentV2/CreateOrEditVaultModalContentV2'
import { CreateVaultModalContent } from '../../../containers/Modal/CreateVaultModalContent'
import { useModal } from '../../../context/ModalContext'
import { useRouter } from '../../../context/RouterContext'
import { isV2 } from '../../../utils/designVersion'

export const CardNewVaultCredentials = () => {
  const { navigate, currentPage } = useRouter()
  const { closeModal, setModal } = useModal()

  useEffect(() => {
    const handleClose = () => {
      closeModal()
      navigate(currentPage, { state: NAVIGATION_ROUTES.VAULTS })
    }

    const CreateContent = isV2()
      ? CreateOrEditVaultModalContentV2
      : CreateVaultModalContent

    setModal(
      html`<${CreateContent} onClose=${handleClose} onSuccess=${closeModal} />`,
      { replace: true }
    )
  }, [closeModal, currentPage, navigate, setModal])

  return null
}
