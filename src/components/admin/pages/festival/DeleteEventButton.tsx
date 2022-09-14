import React, { useState } from 'react'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Modal } from 'antd'
import clsx from 'clsx'
import PropTypes from 'prop-types'

import global_styles from '@/components/admin/css/admin.module.css'
import { doRequest } from '@/lib/Api'
import { Delete } from '@/lib/svg'
import type { FC } from '@/model/commonModel'
import { FestivalEvent } from '@/model/eventModel'

type DeleteButtonType = {
  id: string
  title?: string
  onSuccess?: () => void
}
const DeleteEventButton: FC<DeleteButtonType> = ({ id, title = '', onSuccess }: DeleteButtonType) => {
  const [errors, setErrors] = useState<string[]>([])
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)

  const handleOnClick = (e: React.FormEvent) => {
    e.preventDefault()
    setIsModalVisible(true)
  }

  const hideDeleteDialog = () => {
    setIsModalVisible(false)
  }

  const handleDeleteEvent = async () => {
    setErrors([])
    if (id.length) {
      setIsDeleting(true)
      const response = await doRequest<FestivalEvent>({
        method: 'DELETE',
        endpoint: process.env.NEXT_PUBLIC_API_POST_DELETE_EVENT!.replace(/{id}/, id),
      })
      if (response._cc_errors.length) {
        const responseErrors = response._cc_errors.map((error) => (typeof error !== 'string' ? error.text : error))
        setErrors(responseErrors)
      } else {
        onSuccess && onSuccess()
        hideDeleteDialog()
      }
    }
    setIsDeleting(false)
  }

  return (
    <>
      <a onClick={handleOnClick} href='#' title='Delete event'>
        <Delete /> {title}
      </a>
      <Modal
        title='Are you sure to delete this event?'
        visible={isModalVisible}
        destroyOnClose={true}
        onOk={handleDeleteEvent}
        onCancel={hideDeleteDialog}
        okButtonProps={{ loading: isDeleting }}
        okText='Yes'
        okType='danger'
        cancelText='No'
      >
        <div className='d-flex align-items-center'>
          <ExclamationCircleOutlined
            style={{
              fontSize: '18px',
              color: '#faad14',
            }}
          />
          <div className={global_styles['ml-1']}>Event will be deleted without the ability to restore it</div>
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

DeleteEventButton.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
  onSuccess: PropTypes.func,
}

export default DeleteEventButton
