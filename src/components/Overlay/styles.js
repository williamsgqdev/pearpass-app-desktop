import styled from 'styled-components'

import { BASE_TRANSITION_DURATION } from '../../constants/transitions'

// Modal scrim — brand "near-black" at 72% (same base RGB as the kit's `shadowMenu`).
// TODO: replace with a kit token (e.g. `colorOverlayScrim`) once one exists.
const SCRIM_DEFAULT = 'rgba(8, 10, 5, 0.72)'
const SCRIM_BLUR = 'rgba(0, 0, 0, 0.5)'

export const OverlayComponent = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isShown'].includes(prop)
})`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: ${({ isShown }) => (isShown ? 1 : 0)};
  transition: opacity ${BASE_TRANSITION_DURATION}ms ease-in-out;
  background: ${({ type }) => {
    if (type === 'default') {
      return SCRIM_DEFAULT
    }

    if (type === 'blur') {
      return SCRIM_BLUR
    }
  }};
  backdrop-filter: ${({ type }) => {
    if (type === 'default') {
      return 'none'
    }

    if (type === 'blur') {
      return 'blur(10px)'
    }
  }};
`
