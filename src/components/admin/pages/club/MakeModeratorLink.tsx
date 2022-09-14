import React, { useState } from 'react'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Modal } from 'antd'
import clsx from 'clsx'
import PropTypes from 'prop-types'

import global_styles from '@/components/admin/css/admin.module.css'
import { doRequest } from '@/lib/Api'
import { FC } from '@/model/commonModel'

type Props = {
  clubId: string
  userId: string
  children: React.ReactNode
  name?: string
  onSuccess?: (id: string) => void
}
const MakeModeratorLink: FC<Props> = ({ clubId, userId, name = '<No name>', children, onSuccess }: Props) => {
  const [errors, setErrors] = useState<string[]>([])
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false)
  const [isLoading, setLoading] = useState<boolean>(false)

  const handleOnClick = (e: React.FormEvent) => {
    e.preventDefault()
    setIsModalVisible(true)
  }

  const hideDialog = async () => {
    await setIsModalVisible(false)
  }

  const handleOnOk = async () => {
    setErrors([])
    setLoading(true)
    const url = process.env.NEXT_PUBLIC_API_POST_CLUB_MODERATOR!
    const response = await doRequest({
      endpoint: url.replace(/{clubId}/, clubId).replace(/{userId}/, userId),
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
        return getErrorText(error)
      })
      setErrors(responseErrors)
    } else {
      if (onSuccess) {
        await onSuccess(userId)
      }
      await hideDialog()
    }
    setLoading(false)
  }

  return (
    <>
      <a onClick={handleOnClick} href='#' title={'Make user moderator'}>
        {children}
      </a>
      <Modal
        title={'Make user moderator'}
        destroyOnClose={true}
        visible={isModalVisible}
        onOk={handleOnOk}
        onCancel={hideDialog}
        okButtonProps={{ loading: isLoading }}
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
            You are going to make user &quot;{name} (#{userId})&quot; a moderator of the club
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
    case 'v1.access_denied':
      return 'Access denied. Only owners can make user moderator'
    default:
      return errorCode
  }
}

MakeModeratorLink.propTypes = {
  clubId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  name: PropTypes.string,
  onSuccess: PropTypes.func,
}

export default MakeModeratorLink
