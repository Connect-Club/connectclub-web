import React, { useCallback, useEffect, useState } from 'react'
import { DndProvider, DropTargetMonitor, useDrop } from 'react-dnd'
import { HTML5Backend, NativeTypes } from 'react-dnd-html5-backend'
import { InboxOutlined, UploadOutlined } from '@ant-design/icons'
import { Button, Form, Input, Upload } from 'antd'
import { UploadChangeParam } from 'antd/lib/upload'
import { UploadFile } from 'antd/lib/upload/interface'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'

import { getBackground, getBackgrounds } from '@/api/backgroundApi'
import BackLink from '@/components/admin/common/BackLink'
import global_styles from '@/components/admin/css/admin.module.css'
import popup from '@/components/admin/InfoPopup'
import { validateFile } from '@/components/admin/Map/helper'
import map_styles from '@/components/admin/Map/map.module.css'
import BackgroundEdit from '@/components/admin/pages/backgrounds/BackgroundEdit'
import BackgroundObjects from '@/components/admin/pages/backgrounds/BackgroundObjects'
import styles from '@/components/admin/pages/backgrounds/backgrounds.module.css'
import { apiUploadFile } from '@/lib/Api'
import { getUrlWithSizes } from '@/lib/helpers'
import { Loader } from '@/lib/svg'
import { setWindowHistoryState } from '@/lib/utils'
import { Background } from '@/model/backgroundModel'
import { FC } from '@/model/commonModel'
import { SaveMapObject } from '@/model/mapModel'

type Props = {
  args: string[]
}
type BackgroundId = string | undefined
type SearchValues = {
  backgroundId: BackgroundId
}

const Backgrounds: FC<Props> = ({ args }: Props) => {
  const [isLoading, setLoading] = useState<boolean>(true)
  const [isUploading, setUploading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [background, setBackground] = useState<Background>({} as Background)
  const [backgrounds, setBackgrounds] = useState<Background[]>([])

  const [form] = Form.useForm()

  const backgroundId: BackgroundId = args[0]

  const uploadProps = {
    beforeUpload: (file: UploadFile) => {
      // Return false, because we will proceed custom request
      return validateFile(file) ? false : Upload.LIST_IGNORE
    },
    maxCount: 1,
    showUploadList: false,
    onChange: async (info: UploadChangeParam<any>) => {
      !isUploading && (await uploadFile(info.file))
    },
  }

  const DropArea = () => {
    const [{ canDrop }, drop] = useDrop(() => ({
      accept: [NativeTypes.FILE],
      async drop(item: { files: any[] }) {
        if (item.files.length && validateFile(item.files[0])) {
          await uploadFile(item.files[0])
        }
      },
      collect: (monitor: DropTargetMonitor) => ({
        canDrop: monitor.canDrop(),
      }),
    }))

    return (
      <div className={clsx(global_styles.droppable, canDrop ? global_styles.droppable_active : '')} ref={drop}>
        <div className={global_styles.droppable_text}>
          <p className='mb-4'>
            <InboxOutlined />
          </p>
          <p>Drag file to this area to upload</p>
        </div>
      </div>
    )
  }

  const onSearch = useCallback(
    async (values: SearchValues) => {
      setError('')
      if (values.backgroundId) {
        setLoading(true)
        const response = await getBackground(Number(values.backgroundId))
        setLoading(false)
        if (response) {
          setBackgrounds([])
          form.setFieldsValue({ backgroundId: values.backgroundId })
          setBackground(response)
          setWindowHistoryState('/admin/backgrounds/' + response.background.id)
        } else {
          setError('Background not found')
        }
      }
    },
    [form],
  )

  const uploadFile = async (file: File) => {
    setUploading(true)

    /* Upload image right after the selection */
    const formData = new FormData()
    formData.append('photo', file)
    const response = await apiUploadFile<SaveMapObject>(
      process.env.NEXT_PUBLIC_API_POST_UPLOAD_BACKGROUND_IMAGE!,
      formData,
    )

    if (response._cc_errors.length) {
      popup.error(response._cc_errors.join(', '))
    } else if (response?.data?.response?.id) {
      refreshBackgrounds()
    }
    setUploading(false)
  }

  const refreshBackgrounds = () => {
    const getBackgroundsList = async () => {
      return await getBackgrounds()
    }
    getBackgroundsList().then((backgroundsList) => {
      setLoading(false)
      if (!backgroundsList._cc_errors.length) {
        backgroundsList.data &&
          setBackgrounds(backgroundsList.data.response.sort((a, b) => b.background.id - a.background.id))
      } else {
        setError(backgroundsList._cc_errors.map((error) => (typeof error !== 'string' ? error.text : error)).join(', '))
      }
    })
  }

  useEffect(() => {
    if (backgroundId !== undefined) {
      onSearch({ backgroundId }).then()
    } else {
      refreshBackgrounds()
    }
  }, [onSearch, backgroundId])

  return (
    <>
      <div className={clsx(global_styles.block)}>
        <div className={clsx('relative', isUploading ? map_styles.is_loading : '')}>
          <p className={global_styles.h3}>
            {(backgroundId || error) && <BackLink url='/admin/backgrounds'>Back</BackLink>}
            Backgrounds:
          </p>
          <div className='d-flex gutter-1'>
            <Form
              name='backgrounds'
              layout='inline'
              onFinish={onSearch}
              initialValues={{
                backgroundId: backgroundId,
              }}
              form={form}
            >
              <Input.Group compact>
                <Form.Item
                  style={{ width: '250px' }}
                  name='backgroundId'
                  rules={[
                    {
                      required: true,
                      message: 'Please input background ID!',
                    },
                  ]}
                >
                  <Input placeholder='Enter background ID' />
                </Form.Item>
                <Button type='primary' htmlType='submit' loading={isLoading}>
                  Load
                </Button>
              </Input.Group>
            </Form>
            <Upload {...uploadProps} className={clsx(global_styles['mr-1'])}>
              <Button icon={<UploadOutlined />} loading={isUploading}>
                Upload background
              </Button>
            </Upload>
          </div>

          {!error && !isLoading && backgrounds.length > 0 && (
            <DndProvider backend={HTML5Backend}>
              <DropArea />
            </DndProvider>
          )}

          {error ? (
            <div className={clsx(global_styles.error_text, global_styles['my-1'])}>{error}</div>
          ) : (
            <>
              {isLoading ? (
                <Loader />
              ) : (
                <>
                  {backgrounds.length > 0 ? (
                    <div className={'d-flex gutter-1 flex-flow-wrap relative'}>
                      {backgrounds.map((backgroundItem) => (
                        <div key={backgroundItem.background.id} className={clsx(global_styles['mb-1'], 'align-center')}>
                          <div className={global_styles['mb-1-sm']}>
                            <Link href={`/admin/backgrounds/${backgroundItem.background.id}`} shallow={true}>
                              <a title={`Edit background ${backgroundItem.background.id}`}>
                                #{backgroundItem.background.id}
                              </a>
                            </Link>
                            {Object.keys(backgroundItem.objects).length > 0 && (
                              <BackgroundObjects objects={backgroundItem.objects} />
                            )}
                          </div>
                          <Link href={`/admin/backgrounds/${backgroundItem.background.id}`} shallow={true}>
                            <a title={`Edit background ${backgroundItem.background.id}`}>
                              <div className={styles.preview}>
                                <Image
                                  src={getUrlWithSizes(backgroundItem.background.resizerUrl, 256, 256)}
                                  layout='fill'
                                  objectFit='contain'
                                  alt={`Edit background ${backgroundItem.background.id}`}
                                />
                              </div>
                            </a>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      {background?.background?.id ? (
                        <BackgroundEdit key={background.background.id} background={background} />
                      ) : (
                        <p>Upload background</p>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default Backgrounds
