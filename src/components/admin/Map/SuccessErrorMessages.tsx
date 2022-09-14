import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { CheckCircleTwoTone } from '@ant-design/icons'

import global_styles from '@/components/admin/css/admin.module.css'
import { FC } from '@/model/commonModel'

type Props = {
  onMount: (dispatchers: Dispatchers) => void
}

const SuccessErrorMessages: FC<Props> = ({ onMount }: Props) => {
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [errorMessages, setErrorMessages] = useState<string[]>([])

  /* Clear text about successful save */
  useEffect(() => {
    let inited = true
    let timeoutID: ReturnType<typeof setTimeout>
    if (inited && successMessage.length) {
      timeoutID = setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
    }
    return () => {
      inited = false
      timeoutID && clearTimeout(timeoutID)
    }
  }, [successMessage])

  useEffect(() => {
    onMount([setSuccessMessage, setErrorMessages])
  }, [onMount])

  return (
    <>
      {successMessage.length > 0 && (
        <span className={global_styles.success_text}>
          <CheckCircleTwoTone twoToneColor='#52c41a' /> {successMessage}
        </span>
      )}
      {errorMessages.length > 0 && (
        <div className={global_styles.error_text} dangerouslySetInnerHTML={{ __html: errorMessages.join('<br />') }} />
      )}
    </>
  )
}

export type Dispatchers = [Dispatch<SetStateAction<string>>, Dispatch<SetStateAction<string[]>>]

export default SuccessErrorMessages
