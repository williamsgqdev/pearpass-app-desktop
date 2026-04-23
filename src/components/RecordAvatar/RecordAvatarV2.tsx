import React from 'react'

// @ts-expect-error - declaration file is missing
import { generateAvatarInitials } from '@tetherto/pear-apps-utils-avatar-initials'
import { rawTokens, useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { useFavicon } from '@tetherto/pearpass-lib-vault'

import { RECORD_COLOR_BY_TYPE } from '../../constants/recordColorByType'

const SIZE = 24

interface Props {
  type: string
  title?: string
  websiteDomain?: string
  testId?: string
}

export const RecordAvatarV2 = ({
  type,
  title,
  websiteDomain,
  testId
}: Props): React.ReactElement => {
  const { theme } = useTheme()
  const { faviconSrc, isLoading } = useFavicon({ url: websiteDomain ?? '' }) as {
    faviconSrc?: string
    isLoading?: boolean
  }

  if (faviconSrc && !isLoading) {
    return (
      <img
        src={faviconSrc}
        width={SIZE}
        height={SIZE}
        style={{
          borderRadius: `${rawTokens.radius8}px`,
          objectFit: 'cover',
          display: 'block'
        }}
        data-testid={testId}
        alt=""
      />
    )
  }

  const initials = generateAvatarInitials(title ?? '')
  const color = (RECORD_COLOR_BY_TYPE as Record<string, string>)[type]

  return (
    <div
      data-testid={testId}
      style={{
        width: SIZE,
        height: SIZE,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: `${rawTokens.radius8}px`,
        backgroundColor: theme.colors.colorSurfaceHover,
        color,
        fontFamily: rawTokens.fontPrimary,
        fontSize: `${rawTokens.fontSize12}px`,
        fontWeight: rawTokens.weightMedium,
        flexShrink: 0,
        lineHeight: 1
      }}
    >
      {initials}
    </div>
  )
}
