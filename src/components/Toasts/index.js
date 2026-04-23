import { Snackbar } from '@tetherto/pearpass-lib-ui-kit'
import { colors } from '@tetherto/pearpass-lib-ui-theme-provider'
import { html } from 'htm/react'

import { ToastContainer, ToastStack } from './styles'
import { isV2 } from '../../utils/designVersion'

/**
 * @param {{
 *  toasts: Array.<{
 *    message: string
 *    icon?: import('react').ElementType
 *  }>
 * }} props
 */
export const Toasts = ({ toasts }) => {
  const v2 = isV2()

  return html`
    <${ToastStack}>
      ${toasts?.map((toast, index) => {
        const Icon = toast.icon
        if (v2) {
          return html`
            <${Snackbar}
              key=${index}
              text=${toast.message}
              icon=${Icon ? html`<${Icon} />` : undefined}
            />
          `
        }
        return html`
          <${ToastContainer} key=${index}>
            ${Icon && html`<${Icon} color=${colors.black.mode1} />`}
            ${toast.message}
          <//>
        `
      })}
    <//>
  `
}
