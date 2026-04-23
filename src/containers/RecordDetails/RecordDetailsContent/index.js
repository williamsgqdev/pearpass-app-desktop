import { RECORD_TYPES } from '@tetherto/pearpass-lib-vault'
import { html } from 'htm/react'

import { isV2 } from '../../../utils/designVersion'
import { CreditCardDetailsForm } from '../CreditCardDetailsForm'
import { CreditCardDetailsFormV2 } from '../CreditCardDetailsForm/CreditCardDetailsFormV2'
import { CustomDetailsForm } from '../CustomDetailsForm'
import { CustomDetailsFormV2 } from '../CustomDetailsForm/CustomDetailsFormV2'
import { IdentityDetailsForm } from '../IdentityDetailsForm'
import { IdentityDetailsFormV2 } from '../IdentityDetailsForm/IdentityDetailsFormV2'
import { LoginRecordDetailsForm } from '../LoginRecordDetailsForm'
import { LoginRecordDetailsFormV2 } from '../LoginRecordDetailsForm/LoginRecordDetailsFormV2'
import { NoteDetailsForm } from '../NoteDetailsForm'
import { NoteDetailsFormV2 } from '../NoteDetailsForm/NoteDetailsFormV2'
import { PassPhraseDetailsForm } from '../PassPhraseDetailsForm'
import { PassPhraseDetailsFormV2 } from '../PassPhraseDetailsForm/PassPhraseDetailsFormV2'
import { WifiDetailsForm } from '../WifiDetailsForm'
import { WifiDetailsFormV2 } from '../WifiDetailsForm/WifiDetailsFormV2'

/**
 * @param {{
 *   record: {
 *      type: 'note' | 'creditCard' | 'custom' | 'identity' | 'login'
 *    }
 *  selectedFolder?: string
 * }} props
 */
export const RecordDetailsContent = ({ record, selectedFolder }) => {
  if (record?.type === RECORD_TYPES.CREDIT_CARD) {
    const CreditCardForm = isV2()
      ? CreditCardDetailsFormV2
      : CreditCardDetailsForm
    return html`<${CreditCardForm}
      initialRecord=${record}
      selectedFolder=${selectedFolder}
    />`
  }
  if (record?.type === RECORD_TYPES.CUSTOM) {
    const CustomForm = isV2() ? CustomDetailsFormV2 : CustomDetailsForm
    return html`<${CustomForm}
      initialRecord=${record}
      selectedFolder=${selectedFolder}
    />`
  }
  if (record?.type === RECORD_TYPES.IDENTITY) {
    const IdentityForm = isV2() ? IdentityDetailsFormV2 : IdentityDetailsForm
    return html`<${IdentityForm}
      initialRecord=${record}
      selectedFolder=${selectedFolder}
    />`
  }
  if (record?.type === RECORD_TYPES.LOGIN) {
    const LoginForm = isV2() ? LoginRecordDetailsFormV2 : LoginRecordDetailsForm
    return html`<${LoginForm}
      initialRecord=${record}
      selectedFolder=${selectedFolder}
    />`
  }
  if (record?.type === RECORD_TYPES.NOTE) {
    const NoteForm = isV2() ? NoteDetailsFormV2 : NoteDetailsForm
    return html`<${NoteForm}
      initialRecord=${record}
      selectedFolder=${selectedFolder}
    />`
  }
  if (record?.type === RECORD_TYPES.WIFI_PASSWORD) {
    const WifiForm = isV2() ? WifiDetailsFormV2 : WifiDetailsForm
    return html`<${WifiForm}
      initialRecord=${record}
      selectedFolder=${selectedFolder}
    />`
  }
  if (record?.type === RECORD_TYPES.PASS_PHRASE) {
    const PassPhraseForm = isV2()
      ? PassPhraseDetailsFormV2
      : PassPhraseDetailsForm
    return html`<${PassPhraseForm}
      initialRecord=${record}
      selectedFolder=${selectedFolder}
    />`
  }
}
