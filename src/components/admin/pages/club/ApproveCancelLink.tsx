import React, { useState } from 'react'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Modal } from 'antd'
import clsx from 'clsx'
import PropTypes from 'prop-types'

import global_styles from '@/components/admin/css/admin.module.css'
import { doRequest } from '@/lib/Api'
import { FC } from '@/model/commonModel'

type Props = {
  id: string
  requestId: string
  children: React.ReactNode
  action: 'approve' | 'cancel'
  name?: string
  onSuccess?: (id: string) => void
}
const ApproveCancelLink: FC<Props> = ({
  id,
  name = '<No name>',
  children,
  action = 'approve',
  requestId,
  onSuccess,
}: Props) => {
  const [errors, setErrors] = useState<string[]>([])
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false)
  const [isLoading, setLoading] = useState<boolean>(false)

  const linkTitle = `${action[0].toUpperCase()}${action.substring(1)} user`
  const modalTitle = `Are you sure to ${action} user #${id}?`

  const handleOnClick = (e: React.FormEvent) => {
    e.preventDefault()
    setIsModalVisible(true)
  }

  const hideDialog = () => {
    setIsModalVisible(false)
  }

  const handleOnOk = async () => {
    setErrors([])
    setLoading(true)

    const url =
      action === 'approve'
        ? process.env.NEXT_PUBLIC_API_POST_APPROVE_CLUB_REQUEST!
        : process.env.NEXT_PUBLIC_API_POST_CANCEL_CLUB_REQUEST!
    const response = await doRequest({
      endpoint: url.replace(/{joinRequestId}/, requestId),
    })
    if (response._cc_errors.length) {
      const responseErrors = response._cc_errors.map((error) => {
        if (typeof error !== 'string') {
          if (error?.body?.length) {
            return getErrorText(error.body[0])
          } else {
            return error.text
          }
        }
        return error
      })
      setErrors(responseErrors)
    } else {
      if (onSuccess) {
        await onSuccess(id)
      }
      await hideDialog()
    }
    setLoading(false)
  }

  return (
    <>
      <a onClick={handleOnClick} href='#' title={linkTitle}>
        {children}
      </a>
      <Modal
        title={modalTitle}
        destroyOnClose={true}
        visible={isModalVisible}
        onOk={handleOnOk}
        onCancel={hideDialog}
        okButtonProps={{ loading: isLoading, danger: action === 'cancel' }}
        okText='Yes'
        cancelText='No'
      >
        <div className='d-flex align-items-center'>
          <ExclamationCircleOutlined
            style={{
              color: '#faad14',
              fontSize: '22px',
              marginRight: '10px',
            }}
          />
          <div className={global_styles['ml-1']}>
            You are going to {action} user &quot;{name} (#{id})&quot;
          </div>
        </div>
        {errors.length > 0 && (
          <div
            className={clsx(global_styles['mt-1'], global_styles.error_text)}
            dangerouslySetInnerHTML={{ __html: errors.join('<br />') }}
          />
        )}
      </Modal>
    </>
  )
}

const getErrorText = (errorCode: string): string => {
  switch (errorCode) {
    default:
      return 'Error'
  }
}

ApproveCancelLink.propTypes = {
  id: PropTypes.string.isRequired,
  requestId: PropTypes.string.isRequired,
  action: PropTypes.oneOf(['cancel', 'approve']).isRequired,
  children: PropTypes.node.isRequired,
  name: PropTypes.string,
  onSuccess: PropTypes.func,
}

export default ApproveCancelLink
