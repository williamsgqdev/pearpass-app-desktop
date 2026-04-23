import { useEffect, useMemo } from 'react'

import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { InputField, MultiSlotInput } from '@tetherto/pearpass-lib-ui-kit'

import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard.electron'
import { useTranslation } from '../../../hooks/useTranslation'
import { PassPhraseV2 } from '../../PassPhrase/PassPhraseV2'
import { createStyles } from './PassPhraseDetailsFormV2.styles'
import { toReadOnlyFieldProps } from './utils'

type CustomField = {
  type: string
  name?: string
  note?: string
}

type PassPhraseRecord = {
  id: string
  folder?: string
  data: {
    title?: string
    passPhrase?: string
    note?: string
    customFields?: CustomField[]
  }
}

type PassPhraseDetailsFormV2Props = {
  initialRecord?: PassPhraseRecord
  selectedFolder?: string
}

type PassPhraseDetailsFormValues = {
  title: string
  passPhrase: string
  note: string
  customFields: CustomField[]
  folder?: string
}

export const PassPhraseDetailsFormV2 = ({
  initialRecord,
  selectedFolder
}: PassPhraseDetailsFormV2Props) => {
  const { t } = useTranslation()
  const styles = createStyles()
  const { copyToClipboard } = useCopyToClipboard()

  const initialValues = useMemo<PassPhraseDetailsFormValues>(
    () => ({
      title: initialRecord?.data?.title ?? '',
      passPhrase: initialRecord?.data?.passPhrase ?? '',
      note: initialRecord?.data?.note ?? '',
      customFields: initialRecord?.data?.customFields ?? [],
      folder: selectedFolder ?? initialRecord?.folder
    }),
    [initialRecord, selectedFolder]
  )

  const { register, setValues, values } = useForm({ initialValues })

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues, setValues])

  const hasPassPhrase = !!values.passPhrase?.length
  const hasNote = !!values.note?.length
  const hasCustomFields = !!values.customFields?.length

  return (
    <div style={styles.container}>
      {hasPassPhrase && <PassPhraseV2 value={values.passPhrase} />}

      {(hasNote || hasCustomFields) && (
        <MultiSlotInput testID="comments-multi-slot-input">
          {hasNote && (
            <InputField
              label={t('Comment')}
              placeholder={t('Enter Comment')}
              readOnly
              copyable
              onCopy={copyToClipboard}
              isGrouped
              testID="comments-multi-slot-input-slot-0"
              {...toReadOnlyFieldProps(register('note'))}
            />
          )}

          {(values.customFields as CustomField[]).map((field, index) => (
            <InputField
              key={`${field.type}-${index}`}
              label={t('Comment')}
              value={field.note ?? ''}
              placeholder={t('Enter Comment')}
              readOnly
              copyable
              onCopy={copyToClipboard}
              isGrouped
              testID={`comments-multi-slot-input-slot-${
                hasNote ? index + 1 : index
              }`}
            />
          ))}
        </MultiSlotInput>
      )}
    </div>
  )
}
