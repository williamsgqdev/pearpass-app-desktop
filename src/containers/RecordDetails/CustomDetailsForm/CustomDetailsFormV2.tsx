import { useEffect, useMemo } from 'react'

import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import {
  AttachmentField,
  MultiSlotInput,
  PasswordField,
  Text,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { html } from 'htm/react'

import { ATTACHMENTS_FIELD_KEY } from '../../../constants/formFields'
import { useModal } from '../../../context/ModalContext'
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard.electron'
import { useGetMultipleFiles } from '../../../hooks/useGetMultipleFiles'
import { useTranslation } from '../../../hooks/useTranslation'
import { DisplayPictureModalContentV2 } from '../../Modal/DisplayPictureModalContentV2/DisplayPictureModalContentV2'
import { createStyles } from './CustomDetailsFormV2.styles'

type Attachment = {
  id?: string
  tempId?: string
  name: string
  buffer?: ArrayBuffer | Uint8Array
}

type CustomField = {
  type: string
  name?: string
  note?: string
}

type CustomRecord = {
  id: string
  folder?: string
  attachments?: Attachment[]
  data: {
    title?: string
    customFields?: CustomField[]
  }
}

type CustomDetailsFormV2Props = {
  initialRecord?: CustomRecord
  selectedFolder?: string
}

type CustomDetailsFormValues = {
  customFields: CustomField[]
  folder?: string
  attachments: Attachment[]
}

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']

const getExtension = (filename?: string) =>
  filename?.split('.').pop()?.toLowerCase() ?? ''

export const CustomDetailsFormV2 = ({
  initialRecord,
  selectedFolder
}: CustomDetailsFormV2Props) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const styles = createStyles()
  const { setModal } = useModal()
  const { copyToClipboard } = useCopyToClipboard()

  const initialValues = useMemo<CustomDetailsFormValues>(
    () => ({
      customFields: initialRecord?.data?.customFields ?? [],
      folder: selectedFolder ?? initialRecord?.folder,
      attachments: initialRecord?.attachments ?? []
    }),
    [initialRecord, selectedFolder]
  )

  const { setValues, values, setValue } = useForm({ initialValues })

  useGetMultipleFiles({
    fieldNames: [ATTACHMENTS_FIELD_KEY],
    updateValues: setValue,
    initialRecord
  })

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues, setValues])

  const hasCustomFields = !!values.customFields?.length
  const hasAttachments = !!values.attachments?.length

  const handleAttachmentPress = (attachment: Attachment) => {
    if (!attachment?.buffer || !attachment?.name) return

    const blob = new Blob([attachment.buffer as BlobPart])
    const url = URL.createObjectURL(blob)
    const isImage = IMAGE_EXTENSIONS.includes(getExtension(attachment.name))

    if (isImage) {
      setModal(
        html`<${DisplayPictureModalContentV2}
          url=${url}
          name=${attachment.name}
        />`
      )
      return
    }

    const a = document.createElement('a')
    a.href = url
    a.download = attachment.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div style={styles.container}>
      {(hasAttachments || hasCustomFields) && (
        <div style={styles.section}>
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t('Additional')}
          </Text>

          {hasAttachments && (
            <MultiSlotInput testID="attachments-multi-slot-input">
              {(values.attachments as Attachment[]).map((attachment, index) => (
                <AttachmentField
                  key={attachment?.id || attachment?.tempId || attachment.name}
                  label={t('Attachment')}
                  value={attachment?.name ?? ''}
                  isGrouped
                  testID={`attachment-field-${index}`}
                  onClick={() => handleAttachmentPress(attachment)}
                />
              ))}
            </MultiSlotInput>
          )}

          {hasCustomFields && (
            <MultiSlotInput testID="hidden-messages-multi-slot-input">
              {(values.customFields as CustomField[]).map((field, index) => (
                <PasswordField
                  key={`${field.type}-${index}`}
                  label={t('Hidden Message')}
                  value={field.note ?? ''}
                  placeholder={t('Enter Hidden Message')}
                  readOnly
                  copyable
                  onCopy={copyToClipboard}
                  isGrouped
                  testID={`hidden-messages-multi-slot-input-slot-${index}`}
                />
              ))}
            </MultiSlotInput>
          )}
        </div>
      )}
    </div>
  )
}
