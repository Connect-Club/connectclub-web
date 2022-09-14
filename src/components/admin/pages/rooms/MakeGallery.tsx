import React, { useEffect, useState } from 'react'
import { CheckCircleTwoTone, ExclamationCircleOutlined } from '@ant-design/icons'
import { Modal } from 'antd'
import clsx from 'clsx'
import PropTypes from 'prop-types'

import { useDrafts } from '@/api/eventApi'
import global_styles from '@/components/admin/css/admin.module.css'
import { doRequest } from '@/lib/Api'
import { Loader, LoaderSpin } from '@/lib/svg'
import { FC } from '@/model/commonModel'
import { EventDraft } from '@/model/eventModel'
import { Room } from '@/model/roomModel'

type Props = {
  children: React.ReactNode
  roomName: Room['name']
}
const MakeGalleryBackground: FC<Props> = ({ roomName, children }) => {
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

  const handleOnOk = async () => {
    setSuccessText('')
    setErrors([])
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
        setSuccessText('Background uploaded! Reloading, wait, please...')
      } else {
        setErrors(['Something goes wrong'])
        console.error(response._cc_errors)
      }
    }
    location.reload()
  }

  useEffect(() => {
    if (drafts && drafts.length) {
      const findDraft = drafts.find((dr) => dr.type === 'gallery')
      setDraft(findDraft)
    }
  }, [drafts])

  return (
    <>
      <a onClick={handleOnClick} href='#' title={'Use gallery background'}>
        {children}
      </a>
      <Modal
        title={'Use gallery background'}
        destroyOnClose={true}
        visible={isModalVisible}
        onCancel={hideDialog}
        okButtonProps={{ loading: isLoading }}
        onOk={handleOnOk}
        cancelText={'Cancel'}
        okText={'Submit'}
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
                  Be careful, your current background will be changed to the {` `}
                  {draft && (
                    <a href={draft.backgroundSrc} title={'show the background'} target={'_blank'} rel={'noreferrer'}>
                      following
                    </a>
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

MakeGalleryBackground.propTypes = {
  roomName: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}

export default MakeGalleryBackground
