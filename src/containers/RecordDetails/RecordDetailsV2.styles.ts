import { rawTokens, type ThemeColors } from '@tetherto/pearpass-lib-ui-kit'

export const createStyles = (colors: ThemeColors) => ({
  root: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    width: '100%',
    height: '100%',
    backgroundColor: colors.colorSurfacePrimary,
    boxSizing: 'border-box' as const,
    overflowY: 'auto' as const
  },
  header: {
    padding: `${rawTokens.spacing12}px`,
    borderBottom: `1px solid ${colors.colorBorderPrimary}`
  },
  body: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: `${rawTokens.spacing8}px`,
    padding: `${rawTokens.spacing16}px`
  }
})
