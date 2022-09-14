import React, { useState } from 'react'
import { Button, Form, Input, Modal } from 'antd'
import PropTypes from 'prop-types'

import styles from '@/components/admin/Map/map.module.css'
import { FC } from '@/model/commonModel'
import { MapObjectOnMapType } from '@/model/mapModel'

type Values = {
  title: Props['obj']['title']
  description: Props['obj']['description']
}

type Props = {
  obj: MapObjectOnMapType
  children: React.ReactNode
}
const EditImageMapInfo: FC<Props> = ({ obj, children }: Props) => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false)

  const initialValues: Values = {
    title: (obj.formRef.current && obj.formRef.current.getFieldValue('title')) || '',
    description: (obj.formRef.current && obj.formRef.current.getFieldValue('description')) || '',
  }

  const handleOnClick = () => {
    setIsModalVisible(true)
  }

  const hideDialog = async () => {
    await setIsModalVisible(false)
  }

  const handleOnOk = async (values: Values) => {
    obj.formRef.current &&
      obj.formRef.current.setFieldsValue({
        title: values.title,
        description: values.description,
      })
    await hideDialog()
  }

  return (
    <>
      <a onTouchStart={handleOnClick} href='#' title='Edit image'>
        {children}
      </a>
      <Modal
        title={`Edit image`}
        destroyOnClose={true}
        visible={isModalVisible}
        onCancel={hideDialog}
        wrapClassName={styles.image_modal_info}
        width={'90%'}
        footer={[
          <Button key='back' onClick={hideDialog}>
            Return
          </Button>,
          <Button key='submit' form='map_image_object_edit' type='primary' htmlType='submit'>
            Save
          </Button>,
        ]}
      >
        <Form
          name='map_image_object_edit'
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          labelAlign='left'
          onFinish={handleOnOk}
          initialValues={initialValues}
        >
          <Form.Item label='Title' name='title'>
            <Input />
          </Form.Item>
          <Form.Item label='Description' name='description'>
            <Input.TextArea style={{ height: '150px' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

EditImageMapInfo.propTypes = {
  children: PropTypes.node.isRequired,
  obj: PropTypes.object.isRequired,
}

export default EditImageMapInfo
