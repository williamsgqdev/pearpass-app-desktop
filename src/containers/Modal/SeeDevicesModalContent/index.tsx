import React, { useMemo } from 'react'

import { formatDate } from '@tetherto/pear-apps-utils-date'
import {
  Button,
  Dialog,
  ListItem,
  Text,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import {
  Devices,
  LaptopMac,
  LaptopWindows,
  PhoneIphone,
  Tablet
} from '@tetherto/pearpass-lib-ui-kit/icons'
import { useVault } from '@tetherto/pearpass-lib-vault'

import { createStyles } from './styles'
import { useModal } from '../../../context/ModalContext'
import { useTranslation } from '../../../hooks/useTranslation'

const getDeviceDisplayName = (
  deviceName: string | undefined,
  t: (value: string) => string
): string => {
  if (!deviceName) return t('Unknown Device')

  const lowerName = deviceName.toLowerCase()

  if (lowerName.startsWith('ios')) return t('iPhone')
  if (lowerName.startsWith('android')) return t('Android')

  return deviceName
}

const getDeviceIcon = (deviceName?: string) => {
  if (!deviceName) return Devices

  const lowerName = deviceName.toLowerCase()

  if (lowerName.startsWith('ios') || lowerName.includes('iphone'))
    return PhoneIphone
  if (lowerName.startsWith('android')) return PhoneIphone
  if (lowerName.includes('ipad') || lowerName.includes('tablet')) return Tablet
  if (
    lowerName.includes('mac') ||
    lowerName.includes('imac') ||
    lowerName.includes('darwin') ||
    lowerName.includes('macbook')
  )
    return LaptopMac
  if (lowerName.includes('windows')) return LaptopWindows

  return Devices
}

export const SeeDevicesModalContent = () => {
  const { t } = useTranslation()
  const { closeModal } = useModal()
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)

  const { data: vaultData } = useVault()

  const devices = useMemo(
    () => (Array.isArray(vaultData?.devices) ? vaultData.devices : []),
    [vaultData]
  )

  return (
    <Dialog
      title={t('Devices')}
      onClose={closeModal}
      testID="see-devices-dialog"
      closeButtonTestID="see-devices-close"
      footer={
        <Button
          variant="secondary"
          size="small"
          type="button"
          onClick={closeModal}
          data-testid="see-devices-close-button"
        >
          {t('Close')}
        </Button>
      }
    >
      {devices.length === 0 ? (
        <div style={styles.emptyState}>
          <Text as="p" variant="body" color={theme.colors.colorTextSecondary}>
            {t('No devices synced yet')}
          </Text>
        </div>
      ) : (
        <div style={styles.list}>
          {devices.map((device, index) => {
            const deviceName = getDeviceDisplayName(device.name, t)
            const DeviceIcon = getDeviceIcon(device.name)
            const createdAt = device.createdAt
              ? formatDate(device.createdAt, 'dd-mmm-yyyy', ' ')
              : null

            return (
              <ListItem
                key={device.id ?? `${deviceName}-${index}`}
                icon={
                  <div style={styles.iconWrap}>
                    <DeviceIcon
                      width={16}
                      height={16}
                      color={theme.colors.colorAccentActive}
                    />
                  </div>
                }
                title={deviceName}
                subtitle={
                  createdAt ? `${t('Paired on')} ${createdAt}` : undefined
                }
                testID={`see-devices-item-${device.id ?? index}`}
              />
            )
          })}
        </div>
      )}
    </Dialog>
  )
}
