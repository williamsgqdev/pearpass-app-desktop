import React, { useMemo } from 'react'

import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { Validator } from '@tetherto/pear-apps-utils-validator'
// @ts-ignore - declaration file is incomplete
import { AUTHENTICATOR_ENABLED } from '@tetherto/pearpass-lib-constants'
import {
  AttachmentField as UiKitAttachmentField,
  Button,
  ContextMenu,
  Dialog,
  Form,
  InputField,
  MultiSlotInput,
  NavbarListItem,
  PasswordField,
  SelectField,
  Text,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { RECORD_TYPES } from '@tetherto/pearpass-lib-vault'
import { useCreateRecord, useFolders, useRecords } from '@tetherto/pearpass-lib-vault'
import {
  Add,
  CreateNewFolder,
  Folder,
  KeyboardArrowBottom,
  SyncLock,
  TrashOutlined,
  UploadFileFilled
} from '@tetherto/pearpass-lib-ui-kit/icons'
import { html } from 'htm/react'

import { createStyles } from './CreateOrEditLoginModalContentV2.styles'
import { ATTACHMENTS_FIELD_KEY } from '../../../../constants/formFields'
import { useGlobalLoading } from '../../../../context/LoadingContext'
import { useModal } from '../../../../context/ModalContext'
import { useToast } from '../../../../context/ToastContext'
import { useTranslation } from '../../../../hooks/useTranslation'
import { useCreateOrEditRecord } from '../../../../hooks/useCreateOrEditRecord'
import { useGetMultipleFiles } from '../../../../hooks/useGetMultipleFiles'
import { addHttps } from '../../../../utils/addHttps'
import { formatPasskeyDate } from '../../../../utils/formatPasskeyDate'
import { getFilteredAttachmentsById } from '../../../../utils/getFilteredAttachmentsById'
import { handleFileSelect } from '../../../../utils/handleFileSelect'
import { sortByName } from '../../../../utils/sortByName'
import { CreateFolderModalContentV2 } from '../../CreateFolderModalContentV2/CreateFolderModalContentV2'
import { UploadFilesModalContentV2 } from '../../UploadFilesModalContentV2'

export type CreateOrEditLoginModalContentV2Props = {
  initialRecord?: {
    data: {
      title: string
      username: string
      password: string
      note: string
      websites: string[]
      customFields: { type: string; name: string }[]
      attachments: { id: string; name: string }[]
      otpInput?: string
      otp?: { secret?: string }
      credential?: { id: string }
      passkeyCreatedAt?: number
      passwordUpdatedAt?: number
      [key: string]: unknown
    }
    folder?: string
    isFavorite?: boolean
    attachments?: { id: string; name: string }[]
    [key: string]: unknown
  }
  selectedFolder?: string
  isFavorite?: boolean
  onTypeChange: (type: string) => void
}

export const CreateOrEditLoginModalContentV2 = ({
  initialRecord,
  selectedFolder,
  isFavorite,
  onTypeChange: _onTypeChange
}: CreateOrEditLoginModalContentV2Props) => {
  const { t } = useTranslation()
  const { closeModal, setModal } = useModal()
  const { handleCreateOrEditRecord } = useCreateOrEditRecord()
  const { setToast } = useToast()
  const { theme } = useTheme()
  const styles = createStyles()

  const { createRecord, isLoading: isCreateLoading } = useCreateRecord({
    onCompleted: () => {
      closeModal()
      setToast({ message: t('Record created successfully') })
    }
  })

  const { updateRecords, isLoading: isUpdateLoading } = useRecords({
    onCompleted: () => {
      closeModal()
      setToast({ message: t('Record updated successfully') })
    }
  })

  const { data: folders } = useFolders()

  const folderOptions = useMemo(() => {
    return sortByName(
      Object.values(
        (folders?.customFolders ?? {}) as Record<string, { name: string }>
      )
    ).map((f) => f.name)
  }, [folders])

  const onError = (error: { message: string }) => {
    setToast({ message: error.message })
  }

  const isLoading = isCreateLoading || isUpdateLoading

  useGlobalLoading({ isLoading })

  const schema = Validator.object({
    title: Validator.string().required(t('Title is required')),
    username: Validator.string(),
    password: Validator.string(),
    otpSecret: Validator.string(),
    note: Validator.string(),
    websites: Validator.array().items(
      Validator.object({
        website: Validator.string().website('Wrong format of website')
      })
    ),
    customFields: Validator.array().items(
      Validator.object({
        note: Validator.string()
      })
    ),
    folder: Validator.string(),
    attachments: Validator.array().items(
      Validator.object({
        id: Validator.string(),
        name: Validator.string().required()
      })
    ),
    passwordUpdatedAt: Validator.number()
  })

  const { register, handleSubmit, registerArray, values, setValue } = useForm({
    initialValues: {
      title: initialRecord?.data?.title ?? '',
      username: initialRecord?.data?.username ?? '',
      password: initialRecord?.data?.password ?? '',
      otpSecret:
        initialRecord?.data?.otpInput ?? initialRecord?.data?.otp?.secret ?? '',
      note: initialRecord?.data?.note ?? '',
      websites: initialRecord?.data?.websites?.length
        ? initialRecord.data.websites.map((website: string) => ({ website }))
        : [{ name: 'website' }],
      customFields: initialRecord?.data?.customFields?.length
        ? initialRecord.data.customFields
        : [{ type: 'note', name: 'note', note: '' }],
      folder: selectedFolder ?? initialRecord?.folder,
      attachments: initialRecord?.attachments ?? [],
      credential: initialRecord?.data?.credential?.id ?? '',
      passkeyCreatedAt: initialRecord?.data?.passkeyCreatedAt
    },
    validate: (formValues: Record<string, unknown>) =>
      schema.validate(formValues)
  })

  const {
    value: websitesList,
    addItem: addWebsite,
    registerItem: registerWebsiteItem,
    removeItem: removeWebsite
  } = registerArray('websites')

  const {
    value: customFieldsList,
    addItem: addCustomField,
    registerItem: registerCustomFieldItem,
    removeItem: removeCustomFieldItem
  } = registerArray('customFields')

  useGetMultipleFiles({
    fieldNames: [ATTACHMENTS_FIELD_KEY],
    updateValues: setValue,
    initialRecord
  })

  const onSubmit = (formValues: Record<string, unknown>) => {
    const otpInput =
      (formValues.otpSecret as string)?.trim() || undefined

    const data = {
      type: RECORD_TYPES.LOGIN,
      folder: formValues.folder,
      isFavorite: initialRecord?.isFavorite ?? isFavorite,
      data: {
        ...(initialRecord?.data ? initialRecord.data : {}),
        title: formValues.title,
        username: formValues.username,
        password: formValues.password,
        note: formValues.note,
        websites: (formValues.websites as Array<{ website?: string }>)
          .filter((website) => !!website?.website?.trim().length)
          .map((website) => addHttps(website.website!)),
        customFields: (
          (formValues.customFields as Array<{ type: string; note?: string }>) ??
          []
        ).filter((f) => f.note?.trim().length),
        attachments: formValues.attachments,
        passwordUpdatedAt: initialRecord?.data?.passwordUpdatedAt,
        otpInput
      }
    }

    if (initialRecord) {
      updateRecords([{ ...initialRecord, ...data }], onError)
    } else {
      createRecord(data, onError)
    }
  }

  const handleFileLoad = () => {
    setModal(
      html`<${UploadFilesModalContentV2}
        type=${'file'}
        onFilesSelected=${(files: File[]) =>
          handleFileSelect({
            files: files as unknown as FileList,
            fieldName: ATTACHMENTS_FIELD_KEY,
            setValue,
            values
          })}
      />`
    )
  }

  const handleFolderSelect = (folder?: { name?: string }) => {
    if (!folder) return
    setValue('folder', folder.name === values.folder ? '' : (folder.name ?? ''))
  }

  const handleCreateFolder = () => {
    setModal(
      html`<${CreateFolderModalContentV2}
        onClose=${closeModal}
        onCreate=${(folderName: string) =>
          handleFolderSelect({ name: folderName })}
      />`
    )
  }

  const isEdit = !!initialRecord

  const titleField = register('title')
  const usernameField = register('username')
  const passwordField = register('password')
  const otpSecretField = register('otpSecret')
  const noteField = register('note')

  const folderSelectorContent = (
    <>
      {folderOptions.map((name) => (
        <NavbarListItem
          key={name}
          icon={<Folder width={16} height={16} color={theme.colors.colorTextPrimary} />}
          iconSize={16}
          label={name}
          selected={values?.folder === name}
          onClick={() => handleFolderSelect({ name })}
          testID={`createoredit-folder-option-v2-${name}`}
        />
      ))}
      <NavbarListItem
        icon={<CreateNewFolder width={16} height={16} color={theme.colors.colorTextPrimary} />}
        iconSize={16}
        label={t('Add New Folder')}
        onClick={handleCreateFolder}
        testID="createoredit-folder-create-v2"
      />
    </>
  )

  return (
    <Dialog
      title={isEdit ? t('Edit Login Item') : t('New Login Item')}
      onClose={closeModal}
      testID="createoredit-login-dialog-v2"
      closeButtonTestID="createoredit-login-close-v2"
      footer={
        <>
          <Button
            variant="secondary"
            size="small"
            type="button"
            onClick={closeModal}
            data-testid="createoredit-button-discard-v2"
          >
            {t('Discard')}
          </Button>
          <Button
            variant="primary"
            size="small"
            type="button"
            disabled={isLoading}
            isLoading={isLoading}
            onClick={() => handleSubmit(onSubmit)()}
            data-testid="createoredit-button-save-v2"
          >
            {isEdit ? t('Save') : t('Add Item')}
          </Button>
        </>
      }
    >
      <Form
        onSubmit={handleSubmit(onSubmit)}
        style={styles.form as React.ComponentProps<typeof Form>['style']}
        testID="createoredit-form-v2"
      >
        <InputField
          label={t('Title')}
          placeholder={t('Enter Title')}
          value={titleField.value}
          onChange={(e) => titleField.onChange(e.target.value)}
          error={titleField.error || undefined}
          testID="createoredit-input-title-v2"
        />

        <div style={styles.sectionLabel}>
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t('Credentials')}
          </Text>
        </div>

        <MultiSlotInput
          testID="createoredit-credentials-slot-v2"
          actions={
            <Button
              variant="tertiaryAccent"
              size="small"
              type="button"
              iconBefore={<SyncLock width={16} height={16} />}
              onClick={() =>
                handleCreateOrEditRecord({
                  recordType: 'password',
                  setValue: (value: string) => setValue('password', value)
                })
              }
              data-testid="createoredit-button-generatepassword-v2"
            >
              {t('Generate Password')}
            </Button>
          }
        >
          <InputField
            label={t('Email / Username')}
            placeholder={t('Enter Email / Username')}
            value={usernameField.value}
            onChange={(e) => usernameField.onChange(e.target.value)}
            error={usernameField.error || undefined}
            testID="createoredit-input-username-v2"
          />
          <PasswordField
            label={t('Password')}
            placeholder={t('Enter Password')}
            value={passwordField.value}
            onChange={(e) => passwordField.onChange(e.target.value)}
            error={passwordField.error || undefined}
            testID="createoredit-input-password-v2"
          />
        </MultiSlotInput>

        {AUTHENTICATOR_ENABLED ? (
          <MultiSlotInput testID="createoredit-authenticator-slot-v2">
            <PasswordField
              label={t('Authenticator Secret Key')}
              placeholder={t('Enter Secret Key (TOTP)')}
              value={otpSecretField.value}
              onChange={(e) => otpSecretField.onChange(e.target.value)}
              error={otpSecretField.error || undefined}
              testID="createoredit-input-otpsecret-v2"
            />
          </MultiSlotInput>
        ) : null}

        {!!values?.credential ? (
          <InputField
            label={t('Passkey')}
            value={
              formatPasskeyDate(values.passkeyCreatedAt) ||
              t('Passkey Stored')
            }
            placeholder=""
            disabled
            testID="createoredit-input-passkey-v2"
          />
        ) : null}

        <div style={styles.sectionLabel}>
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t('Details')}
          </Text>
        </div>

        <MultiSlotInput
          testID="createoredit-websites-slot-v2"
          actions={
            <Button
              variant="tertiaryAccent"
              size="small"
              type="button"
              iconBefore={<Add width={16} height={16} />}
              onClick={() => addWebsite({ name: 'website' })}
              data-testid="createoredit-button-addwebsite-v2"
            >
              {t('Add Another Website')}
            </Button>
          }
        >
          {websitesList.map(
            (website: { id: string }, index: number) => {
              const websiteField = registerWebsiteItem('website', index)
              return (
                <InputField
                  key={website.id}
                  label={t('Website')}
                  placeholder={t('Enter Website')}
                  value={websiteField.value}
                  onChange={(e) => websiteField.onChange(e.target.value)}
                  error={websiteField.error || undefined}
                  testID={`createoredit-input-website-v2-${index}`}
                  rightSlot={
                    index > 0 ? (
                      <Button
                        variant="tertiary"
                        size="small"
                        type="button"
                        aria-label={t('Remove website')}
                        iconBefore={
                          <TrashOutlined
                            width={16}
                            height={16}
                            color={theme.colors.colorTextPrimary}
                          />
                        }
                        onClick={() => removeWebsite(index)}
                        data-testid={`createoredit-button-removewebsite-v2-${index}`}
                      />
                    ) : undefined
                  }
                />
              )
            }
          )}
        </MultiSlotInput>

        <ContextMenu
          fullWidth
          trigger={
            <MultiSlotInput testID="createoredit-folder-slot-v2">
              <SelectField
                label={t('Folder')}
                value={values?.folder ?? ''}
                placeholder={t('Choose Folder')}
                testID="createoredit-select-folder-v2"
                rightSlot={
                  <KeyboardArrowBottom
                    color={theme.colors.colorTextPrimary}
                  />
                }
              />
            </MultiSlotInput>
          }
        >
          {folderSelectorContent}
        </ContextMenu>

        <div style={styles.sectionLabel}>
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t('Additional')}
          </Text>
        </div>

        <MultiSlotInput
          testID="createoredit-comment-slot-v2"
          actions={
            <Button
              variant="tertiaryAccent"
              size="small"
              type="button"
              iconBefore={<Add width={16} height={16} />}
              onClick={() =>
                addCustomField({ type: 'note', name: 'note' })
              }
              data-testid="createoredit-button-addcomment-v2"
            >
              {t('Add Another Comment')}
            </Button>
          }
        >
          <InputField
            label={t('Comment')}
            placeholder={t('Enter Comment')}
            value={noteField.value}
            onChange={(e) => noteField.onChange(e.target.value)}
            error={noteField.error || undefined}
            testID="createoredit-input-comment-v2"
          />
        </MultiSlotInput>

        <MultiSlotInput
          testID="createoredit-attachments-slot-v2"
          actions={
            <Button
              variant="tertiaryAccent"
              size="small"
              type="button"
              iconBefore={<Add width={16} height={16} />}
              onClick={handleFileLoad}
              data-testid="createoredit-button-addattachment-v2"
            >
              {t('Add Another Attachment')}
            </Button>
          }
        >
          {values.attachments.length > 0
            ? values.attachments.map(
              (
                attachment: {
                  id?: string
                  tempId?: string
                  name: string
                },
                index: number
              ) => (
                <UiKitAttachmentField
                  key={attachment.id || attachment.tempId}
                  label={t('Attachment')}
                  value={attachment.name}
                  testID={`createoredit-attachment-v2-${index}`}
                  rightSlot={
                    <Button
                      variant="tertiary"
                      size="small"
                      type="button"
                      aria-label={t('Delete File')}
                      iconBefore={
                        <TrashOutlined
                          width={16}
                          height={16}
                          color={theme.colors.colorTextPrimary}
                        />
                      }
                      onClick={() =>
                        setValue(
                          ATTACHMENTS_FIELD_KEY,
                          getFilteredAttachmentsById(
                            values.attachments,
                            attachment
                          )
                        )
                      }
                      data-testid={`createoredit-button-deleteattachment-v2-${index}`}
                    />
                  }
                />
              )
            )
            : null}
          <UiKitAttachmentField
            label={t('Attachment')}
            placeholder={t('Add or Drop File / Photos')}
            onClick={handleFileLoad}
            testID="createoredit-attachment-upload-v2"
            rightSlot={
              <UploadFileFilled
                width={16}
                height={16}
                color={theme.colors.colorTextPrimary}
              />
            }
          />
        </MultiSlotInput>

        <MultiSlotInput
          testID="createoredit-hiddenmessage-slot-v2"
          actions={
            <Button
              variant="tertiaryAccent"
              size="small"
              type="button"
              iconBefore={<Add width={16} height={16} />}
              onClick={() =>
                addCustomField({ type: 'note', name: 'note' })
              }
              data-testid="createoredit-button-addhiddenmessage-v2"
            >
              {t('Add Another Message')}
            </Button>
          }
        >
          {customFieldsList.map(
            (field: { id: string }, index: number) => {
              const fieldReg = registerCustomFieldItem('note', index)
              const canRemove = customFieldsList.length > 1
              return (
                <PasswordField
                  key={field.id}
                  label={t('Hidden Message')}
                  placeholder={t('Enter Hidden Message')}
                  value={fieldReg.value}
                  onChange={(e) => fieldReg.onChange(e.target.value)}
                  error={fieldReg.error || undefined}
                  testID={`createoredit-input-hiddenmessage-v2-${index}`}
                  rightSlot={
                    canRemove ? (
                      <Button
                        variant="tertiary"
                        size="small"
                        type="button"
                        aria-label={t('Remove')}
                        iconBefore={
                          <TrashOutlined
                            width={16}
                            height={16}
                            color={theme.colors.colorTextPrimary}
                          />
                        }
                        onClick={() => removeCustomFieldItem(index)}
                        data-testid={`createoredit-button-removehiddenmessage-v2-${index}`}
                      />
                    ) : undefined
                  }
                />
              )
            }
          )}
        </MultiSlotInput>
      </Form>
    </Dialog>
  )
}
