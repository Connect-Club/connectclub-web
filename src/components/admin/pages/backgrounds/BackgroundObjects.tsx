import React, { useState } from 'react'
import { Button, Modal } from 'antd'
import clsx from 'clsx'
import PropTypes from 'prop-types'

import global_styles from '@/components/admin/css/admin.module.css'
import styles from '@/components/admin/pages/backgrounds/backgrounds.module.css'
import { FC } from '@/model/commonModel'
import { MapObjectType } from '@/model/mapModel'

type Props = {
  objects: { [key: string]: MapObjectType }
}
const BackgroundObjects: FC<Props> = ({ objects }: Props) => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false)

  const quantity = Object.keys(objects).length

  const handleOnClick = (e: React.FormEvent) => {
    e.preventDefault()
    setIsModalVisible(true)
  }

  const hideDialog = () => {
    setIsModalVisible(false)
  }

  return (
    <>
      <a
        onClick={handleOnClick}
        href='#'
        title='Show objects'
        className={clsx(global_styles.black, global_styles.hint)}
      >
        {' '}
        (
        <span className={clsx(styles.dashed, global_styles.black)}>
          {quantity} {quantity > 1 ? 'objects' : 'object'}
        </span>
        )
      </a>
      <Modal
        title='Objects'
        destroyOnClose={true}
        visible={isModalVisible}
        onCancel={hideDialog}
        footer={[
          <Button key='back' onClick={hideDialog}>
            Close
          </Button>,
        ]}
      >
        {Object.keys(objects).map((index) => (
          <div className={clsx(global_styles['mb-1-sm'], 'd-flex gutter-1 flex-1')} key={index}>
            <span>{objects[index].type}</span>
            <span>
              x: {objects[index].x}, y: {objects[index].y}
            </span>
            <span>
              w: {objects[index].width}, h: {objects[index].height}
            </span>
          </div>
        ))}
      </Modal>
    </>
  )
}

BackgroundObjects.propTypes = {
  objects: PropTypes.object.isRequired,
}

export default BackgroundObjects
