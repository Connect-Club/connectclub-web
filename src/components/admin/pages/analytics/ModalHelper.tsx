import React, { useState } from 'react'
import { Modal } from 'antd'

import { FC } from '@/model/commonModel'

type Props = {
  link: React.ReactNode
  modalTitle: string
  children: React.ReactNode
}
const ModalHelper: FC<Props> = ({ link, modalTitle, children }) => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false)

  const handleOnClick = (e: React.FormEvent) => {
    e.preventDefault()
    setIsModalVisible(true)
  }

  const hideDialog = () => {
    setIsModalVisible(false)
  }

  return (
    <>
      <a onClick={handleOnClick} href='#'>
        {link}
      </a>
      <Modal
        title={modalTitle}
        destroyOnClose={true}
        visible={isModalVisible}
        onCancel={hideDialog}
        onOk={hideDialog}
        cancelText='No'
      >
        {children}
      </Modal>
    </>
  )
}

// ModalHelper.propTypes = {
// }

export default ModalHelper
