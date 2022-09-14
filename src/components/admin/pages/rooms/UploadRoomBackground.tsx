import React, { useEffect, useState } from 'react'
import { CheckCircleTwoTone, ExclamationCircleOutlined } from '@ant-design/icons'
import { Button, Modal, Upload } from 'antd'
import clsx from 'clsx'
import PropTypes from 'prop-types'

import { useDrafts } from '@/api/eventApi'
import UploadFile from '@/components/admin/common/UploadFile'
import global_styles from '@/components/admin/css/admin.module.css'
import { doRequest } from '@/lib/Api'
import { getImageSize } from '@/lib/helpers'
import { Loader, LoaderSpin } from '@/lib/svg'
import { Errors } from '@/model/apiModel'
import { FC } from '@/model/commonModel'
import { EventDraft } from '@/model/eventModel'
import { Room } from '@/model/roomModel'

type Props = {
  draftType: EventDraft['type']
  children: React.ReactNode
  roomName: Room['name']
}
const UploadRoomBackground: FC<Props> = ({ draftType, roomName, children }) => {
  const [errors, setErrors] = useState<string[]>([])
  const [successText, setSuccessText] = useState('')
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [draft, setDraft] = useState<EventDraft | null | undefined>(null)

  const [drafts] = useDrafts()

  const handleOnClick = (e: React.FormEvent) => {
    e.preventDefault()
    setIsModalVisible(true)
  }

  const hideDialog = async () => {
    await setIsModalVisible(false)
  }

  const handleOnClickUploadButton = async () => {
    setErrors([])
    setSuccessText('')
  }

  const handleOnSuccess = async () => {
    setSuccessText('Background uploaded! Reloading, wait, please...')
    location.reload()
  }

  const handleonUseDefault = async () => {
    await handleOnClickUploadButton()
    setIsLoading(true)
    if (draft) {
      const response = await doRequest({
        method: 'PATCH',
        endpoint: process.env.NEXT_PUBLIC_API_PATCH_UPDATE_ROOM_CONFIG!.replace('{name}', roomName),
        data: {
          backgroundPhotoId: draft.backgroundId,
        },
      })
      if (!response._cc_errors.length) {
        await handleOnSuccess()
      } else {
        setErrors(['Something goes wrong'])
        console.error(response._cc_errors)
      }
    }
  }

  const onError = (errors: Errors) => {
    const responseErrors = errors.map((error) => {
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
  }

  const beforeUpload = async (file: File) => {
    try {
      /* Upload only JPEG */
      if (!file.type || !new RegExp('image/jpe?g').test(file.type)) {
        setErrors([`${file.name} must be JPEG file`])
        return Upload.LIST_IGNORE
      }

      const sizes = await getImageSize(file)
      if (draft && (sizes.width !== draft.requiredBackgroundWidth || sizes.height !== draft.requiredBackgroundHeight)) {
        setErrors([
          `
                        Size of the image should be ${draft.requiredBackgroundWidth}px x ${draft.requiredBackgroundHeight}px<br />
                        Your image is ${sizes.width}px x ${sizes.height}px
                    `,
        ])
        return Upload.LIST_IGNORE
      }
      /* Return false in order to upload manually */
      return false
    } catch (e) {
      setErrors([`${file.name} must be JPEG file`])
      return Upload.LIST_IGNORE
    }
  }

  useEffect(() => {
    if (drafts && drafts.length) {
      const findDraft = drafts.find((dr) => dr.type === draftType)
      setDraft(findDraft)
    }
  }, [draftType, drafts])

  return (
    <>
      <a onClick={handleOnClick} href='#' title={'Upload background'}>
        {children}
      </a>
      <Modal
        title={'Upload background'}
        destroyOnClose={true}
        visible={isModalVisible}
        onCancel={hideDialog}
        footer={[
          <Button key='back' onClick={hideDialog} className={global_styles['mr-1']}>
            Cancel
          </Button>,
          !successText.length && draft !== null && (
            <Button key='default' onClick={handleonUseDefault} loading={isLoading} className={global_styles['mr-1']}>
              Use default background
            </Button>
          ),
          !successText.length && draft !== null && (
            <UploadFile
              key='upload'
              accept={'image/jpeg, image/jpg'}
              buttonName={'Upload'}
              endpoint={process.env.NEXT_PUBLIC_API_POST_UPLOAD_ROOM_BACKGROUND!.replace('{name}', roomName)}
              fileName={'photo'}
              onClick={handleOnClickUploadButton}
              onSuccess={handleOnSuccess}
              onError={onError}
              beforeUpload={beforeUpload}
            />
          ),
        ]}
      >
        {draft === null ? (
          <Loader />
        ) : (
          <>
            {successText.length > 0 ? (
              <div className={global_styles.success_text}>
                <CheckCircleTwoTone twoToneColor='#52c41a' /> {successText}
                <LoaderSpin color={'#52c41a'} />
              </div>
            ) : (
              <div className='d-flex align-items-center'>
                <ExclamationCircleOutlined
                  style={{
                    color: '#faad14',
                    fontSize: '22px',
                    marginRight: '10px',
                  }}
                />
                <div className={global_styles['ml-1']}>
                  Make sure, that you are uploading <b>JPEG</b> image{` `}
                  {draft && (
                    <>
                      with dimensions <br />
                      (W x H):{' '}
                      <b>
                        {draft.requiredBackgroundWidth}px x {draft.requiredBackgroundHeight}px{' '}
                      </b>
                      {` `}
                      <a
                        href={draft.backgroundSrc}
                        title={'show default background'}
                        target={'_blank'}
                        rel={'noreferrer'}
                      >
                        show default background
                      </a>
                    </>
                  )}
                </div>
              </div>
            )}
            {errors.length > 0 && (
              <div
                className={clsx(global_styles['mt-1'], global_styles.error_text)}
                dangerouslySetInnerHTML={{ __html: errors.join('<br />') }}
              />
            )}
          </>
        )}
      </Modal>
    </>
  )
}

const getErrorText = (errorCode: string): string => {
  switch (errorCode) {
    case 'api.v1.background.validate_size_error':
      return 'Validation size error'
    case 'api.v1.background.incorrect_height':
      return 'Incorrect height'
    case 'api.v1.background.incorrect_width':
      return 'Incorrect width'
    default:
      return errorCode
  }
}

UploadRoomBackground.propTypes = {
  draftType: PropTypes.string.isRequired,
  roomName: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}

export default UploadRoomBackground
