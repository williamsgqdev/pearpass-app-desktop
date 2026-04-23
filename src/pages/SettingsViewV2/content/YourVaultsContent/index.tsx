import React, { useCallback, useMemo } from 'react'

import {
  Button,
  ContextMenu,
  ListItem,
  MultiSlotInput,
  NavbarListItem,
  PageHeader,
  Text,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import {
  Add,
  Devices,
  Edit,
  LockOutlined,
  MoreVert,
  PersonAdd
} from '@tetherto/pearpass-lib-ui-kit/icons'
import {
  useRecords,
  useVault,
  useVaults,
  type Vault
} from '@tetherto/pearpass-lib-vault'

import { AddDeviceModalContentV2 } from '../../../../containers/Modal/AddDeviceModalContentV2/AddDeviceModalContentV2'
import { CreateOrEditVaultModalContentV2 } from '../../../../containers/Modal/CreateOrEditVaultModalContentV2/CreateOrEditVaultModalContentV2'
import { SeeDevicesModalContent } from '../../../../containers/Modal/SeeDevicesModalContent'
import { useModal } from '../../../../context/ModalContext'
import { useTranslation } from '../../../../hooks/useTranslation'
import { sortByName } from '../../../../utils/sortByName'
import { createStyles } from './styles'

export const YourVaultsContent = () => {
  const { t } = useTranslation()
  const { setModal, closeModal } = useModal()
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)

  const { data: vault } = useVault()
  const { data: allVaults } = useVaults()

  const { data: records } = useRecords({
    shouldSkip: true,
    variables: {
      filters: {
        searchPattern: '',
        type: undefined,
        folder: undefined,
        isFavorite: undefined
      },
      sort: { key: 'updatedAt', direction: 'desc' }
    }
  })

  const itemCount = records?.length ?? 0

  const otherVaults = useMemo(() => {
    if (!allVaults || !vault) return []
    return sortByName(allVaults.filter((v) => v.id !== vault.id))
  }, [allVaults, vault])

  const openAddDeviceModal = useCallback(() => {
    setModal(<AddDeviceModalContentV2 />)
  }, [setModal])

  const openDevicesModal = useCallback(() => {
    setModal(<SeeDevicesModalContent />)
  }, [setModal])

  const openCreateModal = useCallback(() => {
    setModal(
      <CreateOrEditVaultModalContentV2
        shouldRedirectToMain={false}
        onClose={closeModal}
        onSuccess={closeModal}
      />
    )
  }, [closeModal, setModal])

  const openEditModal = useCallback(
    (v: Vault) => {
      setModal(
        <CreateOrEditVaultModalContentV2
          onClose={closeModal}
          onSuccess={closeModal}
          vault={v}
        />
      )
    },
    [closeModal, setModal]
  )

  const ItemCount = t('{count, plural, one {# Item} other {# Items}}', {
    count: itemCount
  })

  const DevicesMeta = vault?.devices?.length
    ? t('{count, plural, one {# Device} other {# Devices}}', {
        count: vault?.devices?.length ?? 0
      })
    : t('Private')

  if (!vault) {
    return null
  }

  return (
    <div style={styles.root} data-testid="settings-card-your-vault">
      <div style={styles.header}>
        <PageHeader
          as="h1"
          title={t('Your Vaults')}
          subtitle={t(
            'Manage your vaults, control access permissions, and take protective measures if needed.'
          )}
        />
      </div>

      <div style={styles.section}>
        <Text variant="caption" color={theme.colors.colorTextSecondary}>
          {t('Current Vault')}
        </Text>
        <div style={styles.cardList}>
          <ListItem
            subtitleLayout="horizontal"
            testID="settings-vault-item"
            selectable={false}
            title={vault.name}
            subtitle={{ primary: ItemCount, secondary: DevicesMeta }}
            icon={
              <div style={styles.iconWrap}>
                <LockOutlined
                  color={theme.colors.colorPrimary}
                  width={16}
                  height={16}
                />
              </div>
            }
            rightElement={
              <div style={styles.actions} onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="tertiary"
                  size="small"
                  aria-label={t('Invite members')}
                  data-testid="settings-vault-invite-button"
                  onClick={openAddDeviceModal}
                  iconBefore={
                    <PersonAdd color={theme.colors.colorTextPrimary} />
                  }
                />
                <ContextMenu
                  testID="settings-vault-context-menu"
                  menuWidth={200}
                  trigger={
                    <Button
                      variant="tertiary"
                      size="small"
                      aria-label={t('Vault actions')}
                      data-testid="settings-vault-more-button"
                      iconBefore={
                        <MoreVert color={theme.colors.colorTextPrimary} />
                      }
                    />
                  }
                >
                  <NavbarListItem
                    testID="settings-vault-edit-button"
                    variant="secondary"
                    size="small"
                    label={t('Rename Vault')}
                    icon={
                      <Edit
                        color={theme.colors.colorTextPrimary}
                        width={24}
                        height={24}
                      />
                    }
                    onClick={() => {
                      openEditModal(vault)
                    }}
                  />
                  <NavbarListItem
                    testID="settings-vault-devices-button"
                    variant="secondary"
                    size="small"
                    label={t('See Devices')}
                    icon={
                      <Devices
                        color={theme.colors.colorTextPrimary}
                        width={24}
                        height={24}
                      />
                    }
                    onClick={() => {
                      openDevicesModal()
                    }}
                  />
                </ContextMenu>
              </div>
            }
          />
        </div>
      </div>

      {otherVaults.length > 0 ? (
        <div style={styles.section}>
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t('Other Vaults')}
          </Text>
          <MultiSlotInput testID="settings-other-vaults-multislot">
            {otherVaults.map((v, index) => {
              return (
                <ListItem
                  key={v.id}
                  withRoundedBottomBorders={false}
                  dividerColor={theme.colors.colorBorderPrimary}
                  testID={`settings-other-vault-${v.name}-${index}`}
                  selectable={false}
                  title={v.name}
                  showDivider={index < otherVaults.length - 1}
                  icon={
                    <div style={styles.iconWrap}>
                      <LockOutlined
                        color={theme.colors.colorPrimary}
                        width={16}
                        height={16}
                      />
                    </div>
                  }
                />
              )
            })}
          </MultiSlotInput>
        </div>
      ) : null}

      <div style={styles.footer}>
        <Button
          variant="primary"
          size="medium"
          data-testid="settings-your-vaults-create"
          iconBefore={<Add />}
          onClick={openCreateModal}
        >
          {t('Create new Vault')}
        </Button>
      </div>
    </div>
  )
}
