import React, { useState } from 'react'
import { FileImageOutlined } from '@ant-design/icons'
import { Button, Input, Modal } from 'antd'
import clsx from 'clsx'
import PropTypes from 'prop-types'

import global_styles from '@/components/admin/css/admin.module.css'
import { addImageToObjects, saveMapObjects } from '@/components/admin/Map/helper'
import { FC } from '@/model/commonModel'
import { MapObjectOnMapType, MapObjectType, UserMapObject } from '@/model/mapModel'

type Props = {
  existingObjects: MapObjectOnMapType[]
  saveParams: {
    url: string
  }
  objectsToSave: MapObjectType['type'][]
  onSuccess?: () => void
  userObject?: UserMapObject | null
}
const AddImageByIdModal: FC<Props> = ({
  existingObjects,
  saveParams,
  onSuccess,
  objectsToSave = [],
  userObject = null,
}) => {
  const [errors, setErrors] = useState<string[]>([])
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false)
  const [isLoading, setLoading] = useState<boolean>(false)
  const [id, setId] = useState<string>('')

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

    if (id) {
      /* Add image to map objects */
      const errorsOnSavingObjects = await saveMapObjects(saveParams.url, existingObjects, objectsToSave, [
        addImageToObjects(id, userObject, existingObjects.length),
      ])

      if (errorsOnSavingObjects.length) {
        setErrors(errorsOnSavingObjects)
      } else {
        onSuccess && onSuccess()
        hideDialog()
      }
    } else {
      setErrors(['Specify image ID'])
    }
    setLoading(false)
  }

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      await handleOnOk()
    }
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setId(e.target.value)
  }

  return (
    <>
      <Button icon={<FileImageOutlined />} onClick={handleOnClick}>
        Add image by ID
      </Button>
      <Modal
        title={`Add image by ID`}
        destroyOnClose={true}
        visible={isModalVisible}
        onOk={handleOnOk}
        onCancel={hideDialog}
        okButtonProps={{ loading: isLoading }}
        okText='Yes'
        cancelText='No'
      >
        <div className='d-flex align-items-center'>
          <div className={global_styles['ml-1']}>Specify image ID, uploaded recently:</div>
          <Input onChange={onChange} onKeyDown={handleKeyDown} />
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

AddImageByIdModal.propTypes = {
  saveParams: PropTypes.shape({
    url: PropTypes.string,
    params: PropTypes.object,
  }).isRequired,
  existingObjects: PropTypes.array.isRequired,
  objectsToSave: PropTypes.array,
  userObject: PropTypes.object,
  onSuccess: PropTypes.func,
}

export default AddImageByIdModal
