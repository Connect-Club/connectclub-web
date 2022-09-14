import React, { useState } from 'react'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Modal } from 'antd'
import PropTypes from 'prop-types'

import global_styles from '@/components/admin/css/admin.module.css'
import { Delete } from '@/lib/svg'
import type { FC } from '@/model/commonModel'

type DeleteButtonType = {
  onSuccess?: () => void
}
const DeleteModuleButton: FC<DeleteButtonType> = ({ onSuccess }: DeleteButtonType) => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false)

  const handleOnClick = (e: React.FormEvent) => {
    e.preventDefault()
    setIsModalVisible(true)
  }

  const hideDeleteDialog = () => {
    setIsModalVisible(false)
  }

  const handleDeleteEvent = async () => {
    onSuccess && onSuccess()
    hideDeleteDialog()
  }

  return (
    <>
      <a onClick={handleOnClick} href='#' title={'Delete'}>
        <Delete color={'#f00'} />
      </a>
      <Modal
        title={'Are you sure to delete module?'}
        visible={isModalVisible}
        destroyOnClose={true}
        onOk={handleDeleteEvent}
        onCancel={hideDeleteDialog}
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
          <div className={global_styles['ml-1']}>Module will be deleted without the ability to restore it</div>
        </div>
      </Modal>
    </>
  )
}

DeleteModuleButton.propTypes = {
  onSuccess: PropTypes.func,
}

export default DeleteModuleButton
