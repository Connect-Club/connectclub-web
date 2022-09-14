import React, { useRef, useState } from 'react'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Modal } from 'antd'
import clsx from 'clsx'
import PropTypes from 'prop-types'

import global_styles from '@/components/admin/css/admin.module.css'
import { doRequest } from '@/lib/Api'
import { FC } from '@/model/commonModel'

type Props = {
  id: string
  children: React.ReactNode
  action: 'ban' | 'unban' | 'delete'
  name?: string
  onSuccess?: (id: string) => void
}
const BanDeleteLink: FC<Props> = ({ id, name = '<No name>', children, action = 'ban', onSuccess }: Props) => {
  const [errors, setErrors] = useState<string[]>([])
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false)
  const [isLoading, setLoading] = useState<boolean>(false)

  const commentRef = useRef<HTMLTextAreaElement>(null)

  const linkTitle = `${action[0].toUpperCase()}${action.substring(1)} user`
  const modalTitle = `Are you sure to ${action} user #${id}?`

  const handleOnClick = (e: React.FormEvent) => {
    e.preventDefault()
    setIsModalVisible(true)
  }

  const hideDialog = () => {
    setIsModalVisible(false)
    if (commentRef.current) {
      commentRef.current.value = ''
    }
  }

  const handleOnOk = async () => {
    setErrors([])
    setLoading(true)
    const comment = commentRef.current ? commentRef.current.value : ''
    const url =
      action === 'ban'
        ? process.env.NEXT_PUBLIC_API_POST_BAN_USER!
        : action === 'unban'
        ? process.env.NEXT_PUBLIC_API_POST_UNBAN_USER!
        : process.env.NEXT_PUBLIC_API_POST_DELETE_USER!
    const response = await doRequest({
      method: action === 'delete' ? 'DELETE' : 'POST',
      endpoint: url.replace(/{id}/, id),
      data: {
        comment,
      },
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
      hideDialog()
      onSuccess && onSuccess(id)
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
        okButtonProps={{ loading: isLoading, danger: action === 'delete' }}
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
        {action !== 'unban' && (
          <div className={clsx(global_styles['mt-1'])}>
            <div className={global_styles['mb-1']}>Specify the reason:</div>
            <textarea ref={commentRef} style={{ width: '100%', padding: '5px' }} />
          </div>
        )}
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

BanDeleteLink.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  action: PropTypes.oneOf(['ban', 'unban', 'delete']),
  onSuccess: PropTypes.func,
  children: PropTypes.node,
}

export default BanDeleteLink
