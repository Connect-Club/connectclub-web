import React, { useState } from 'react'
import { Button, Form, Modal, Select } from 'antd'
import clsx from 'clsx'
import Image from 'next/image'
import PropTypes from 'prop-types'

import global_styles from '@/components/admin/css/admin.module.css'
import { addImageToObjects, saveMapObjects } from '@/components/admin/Map/helper'
import { doRequest } from '@/lib/Api'
import { getUrlWithSizes } from '@/lib/helpers'
import { Errors } from '@/model/apiModel'
import { FC } from '@/model/commonModel'
import { MapImageUploadResponse, MapObjectOnMapType, MapObjectTypeOrString } from '@/model/mapModel'
import { UserToken } from '@/model/usersModel'

type Props = {
  nfts: UserToken[]
  onSuccess: () => void
  existingObjects: MapObjectOnMapType[]
  saveParams: {
    url: string
  }
  objectsToSave: MapObjectTypeOrString[]
  className?: string
}
const AddNftModal: FC<Props> = ({ nfts, className, existingObjects, saveParams, onSuccess, objectsToSave = [] }) => {
  const [errors, setErrors] = useState<Errors>([])
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false)
  const [isLoading, setLoading] = useState<boolean>(false)

  const handleOnClick = (e: React.FormEvent) => {
    e.preventDefault()
    setIsModalVisible(true)
  }

  const hideDialog = () => {
    setIsModalVisible(false)
  }

  const handleOnOk = async (values: { tokens: string[] }) => {
    setErrors([])
    setLoading(true)

    let update = 0

    if (values.tokens.length) {
      let count = 0
      for (const tokenJson of values.tokens) {
        const token = JSON.parse(tokenJson) as UserToken
        const response = await doRequest<MapImageUploadResponse>({
          endpoint: process.env.NEXT_PUBLIC_API_POST_TOKEN_ROOM_IMAGE!.replace('{id}', token.tokenId),
        })
        if (response._cc_errors.length) {
          setErrors(response._cc_errors)
        } else if (response?.data?.response?.id) {
          /* Add image to map objects */
          const errorsOnSavingObjects = await saveMapObjects(saveParams.url, existingObjects, objectsToSave, [
            addImageToObjects(
              response.data.response.id,
              null,
              existingObjects.length + count,
              { width: 1500, height: 1000 },
              {
                title: token.title,
                description: token.tokenId.split('_')[0] + '\n' + token.description,
                type: 'nft_image',
              },
            ),
          ])

          count++

          if (errorsOnSavingObjects.length) {
            setErrors(errorsOnSavingObjects)
          } else {
            update = 1
          }
        }
      }
    } else {
      setErrors(['Select at least one token'])
    }

    setLoading(false)

    if (update) {
      await onSuccess()
      hideDialog()
    }
  }

  return (
    <>
      <Button onClick={handleOnClick} className={className}>
        <div>
          <span
            style={{
              verticalAlign: 'middle',
              display: 'inline-block',
              marginRight: '5px',
            }}
          >
            <Image src='/img/svg/nft-icon.svg' width={16} height={16} alt={`NFT`} />
          </span>
          Add my NFTs
        </div>
      </Button>
      <Modal
        title={`Add your NFTs to the room`}
        destroyOnClose={true}
        visible={isModalVisible}
        onCancel={hideDialog}
        okButtonProps={{ loading: isLoading }}
        footer={[
          <Button key='back' onClick={hideDialog}>
            cancel
          </Button>,
          <Button key='submit' form='upload_nfts' type='primary' loading={isLoading} htmlType='submit'>
            Upload
          </Button>,
        ]}
      >
        <div className={global_styles['mb-1']}>Select NFTs and upload them to your room:</div>
        <Form
          name='upload_nfts'
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          labelAlign='left'
          onFinish={handleOnOk}
        >
          <Form.Item noStyle name='tokens'>
            <Select
              optionLabelProp='label'
              allowClear
              placeholder={'Start selecting...'}
              mode={'multiple'}
              style={{ width: '100%' }}
            >
              {nfts.map((nft) => (
                <Select.Option value={JSON.stringify(nft)} key={nft.tokenId} label={nft.title}>
                  <div className={'d-flex align-items-center gutter-03'}>
                    {nft.preview && (
                      <div
                        className={'relative flex-shrink-0'}
                        style={{
                          width: 50,
                          height: 50,
                        }}
                      >
                        <Image
                          src={getUrlWithSizes(nft.preview, 50, 50)}
                          layout={'fill'}
                          objectFit={'contain'}
                          alt={'nft image'}
                        />
                      </div>
                    )}
                    {nft.title}
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>

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

AddNftModal.propTypes = {
  nfts: PropTypes.array.isRequired,
  className: PropTypes.string,
  onSuccess: PropTypes.func,
  saveParams: PropTypes.shape({
    url: PropTypes.string,
    params: PropTypes.object,
  }).isRequired,
  existingObjects: PropTypes.array.isRequired,
  objectsToSave: PropTypes.array,
  userObject: PropTypes.object,
}

export default AddNftModal
