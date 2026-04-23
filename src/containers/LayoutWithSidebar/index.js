import { useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { html } from 'htm/react'

import {
  ContentWrapper,
  LayoutWrapper,
  SideBarWrapper,
  SideViewWrapper
} from './styles'
import { isV2 } from '../../utils/designVersion'
import { Sidebar } from '../Sidebar'

/**
 * @typedef LayoutWithSidebarProps
 * @property {import('react').ReactNode} mainView
 * @property {import('react').ReactNode} sideView
 */

/**
 * @param {LayoutWithSidebarProps} props
 */

export const LayoutWithSidebar = ({ mainView, sideView }) => {
  const { theme } = useTheme()
  const v2 = isV2()

  const v2SideViewStyle = {
    flex: 1,
    overflowY: 'auto',
    backgroundColor: theme.colors.colorSurfacePrimary,
    borderLeft: `1px solid ${theme.colors.colorBorderPrimary}`
  }

  return html`
    <${LayoutWrapper}>
      <${SideBarWrapper}>
        <${Sidebar} />
      <//>

      <${ContentWrapper}> ${mainView} <//>

      ${sideView &&
      (v2
        ? html`<div style=${v2SideViewStyle}>${sideView}</div>`
        : html`<${SideViewWrapper}>${sideView}<//>`)}
    <//>
  `
}
