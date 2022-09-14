import React, { useState } from 'react'
import { UploadOutlined } from '@ant-design/icons'
import { Button, Checkbox, Form, Input, Upload, UploadProps } from 'antd'
import { UploadChangeParam } from 'antd/lib/upload'
import { UploadFile } from 'antd/lib/upload/interface'
import clsx from 'clsx'
import Image from 'next/image'
import PropTypes from 'prop-types'

import global_styles from '@/components/admin/css/admin.module.css'
import popup from '@/components/admin/InfoPopup'
import Colorpicker from '@/components/admin/pages/landing/Colorpicker'
import styles from '@/components/admin/pages/landing/landing.module.css'
import { apiUploadFile } from '@/lib/Api'
import { getUrlWithSizes } from '@/lib/helpers'
import { Delete } from '@/lib/svg'
import { FC } from '@/model/commonModel'
import { ImageType } from '@/model/imageModel'
import { ModuleProps } from '@/model/landingModel'
import { Speaker } from '@/model/speakerModel'

const ModuleSpeakers: FC<ModuleProps> = ({ form }) => {
  const initialSpeaker: Speaker = {
    status: false,
    name: '',
    description: '',
    image: '',
  }

  const UploadFile: FC<{ index: number }> = ({ index }) => {
    const [isLoading, setLoading] = useState(false)

    const uploadProps: UploadProps = {
      maxCount: 1,
      accept: 'image/*',
      showUploadList: true,
      beforeUpload: (file: UploadFile) => {
        /* Upload only images */
        if (!file.type || !/image\/*/.test(file.type)) {
          popup.error(`${file.name} is not an image file`)
          return Upload.LIST_IGNORE
        }
        /* Return false in order to upload manually */
        return false
      },
      onChange: async (info: UploadChangeParam<any>) => {
        setLoading(true)

        const formData = new FormData()
        formData.append('image', info.file as File)

        const response = await apiUploadFile<ImageType>(process.env.NEXT_PUBLIC_API_POST_UPLOAD_IMAGE!, formData)

        setLoading(false)

        if (response._cc_errors.length) {
          popup.error('Image not saved, ' + response._cc_errors.join(', '))
        } else if (response?.data?.response?.id) {
          updateSpeaker(index, { image: response.data!.response.resizerUrl })
        }
      },
    }

    return (
      <Upload {...uploadProps}>
        <Button icon={<UploadOutlined />} loading={isLoading}>
          Upload image
        </Button>
      </Upload>
    )
  }

  const SpeakerImage: FC<{ index: number; image: string }> = ({ index, image }) => {
    const handleOnDelete = async () => {
      updateSpeaker(index, { image: '' })
    }
    return (
      <div className={clsx('d-flex gutter-03 align-items-center', global_styles['mb-1'])}>
        <div className={styles.speaker_image}>
          <Image src={getUrlWithSizes(image, 50, 50)} layout={'fill'} objectFit={'contain'} alt={'speaker'} />
        </div>
        <a title={'delete image'} onClick={handleOnDelete}>
          <Delete color={'#f00'} width={'12px'} height={'12px'} />
        </a>
      </div>
    )
  }

  const updateSpeaker = (index: number, field: { [key: string]: any }) => {
    const newValue = form.getFieldValue(['params', 'speakers'])
    newValue.splice(index, 1, {
      ...form.getFieldValue(['params', 'speakers', index]),
      ...field,
    })
    form.setFieldsValue(newValue)
  }

  return (
    <>
      <div className={styles.modal_settings}>
        <fieldset>
          <legend>More speakers button</legend>
          <Form.Item label='Show' name={['params', 'show_more_button']} valuePropName='checked'>
            <Checkbox />
          </Form.Item>
          <Form.Item label='Link URL' name={['params', 'link_url']}>
            <Input />
          </Form.Item>
          <Form.Item label='Text' name={['params', 'link_text']}>
            <Input />
          </Form.Item>
        </fieldset>
        <fieldset>
          <legend>Speakers</legend>
          <Form.List name={['params', 'speakers']}>
            {(speakers, { add, remove }) => (
              <>
                <div className={styles.speakers}>
                  {/*@ts-ignore*/}
                  {speakers.map(({ key, name, ...restField }) => (
                    <div key={key} className={clsx(styles.speaker, global_styles['mb-1'])}>
                      <a title={'Delete'} className={styles.speaker_delete} onClick={() => remove(name)}>
                        <Delete color={'#f00'} />
                      </a>
                      <Form.Item
                        label='Publish'
                        {...restField}
                        name={[name, 'status']}
                        valuePropName='checked'
                        preserve={true}
                      >
                        <Checkbox />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'name']} label='Name' preserve={true}>
                        <Input />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'description']} label='Description' preserve={true}>
                        <Input />
                      </Form.Item>
                      <Form.Item
                        label={'Image'}
                        shouldUpdate={(prevValues, currentValues) =>
                          prevValues.params.image !== currentValues.params.image
                        }
                      >
                        {({ getFieldValue }) => (
                          <div>
                            {getFieldValue(['params', 'speakers', name, 'image']) && (
                              <SpeakerImage index={name} image={getFieldValue(['params', 'speakers', name, 'image'])} />
                            )}
                            <UploadFile index={name} />
                          </div>
                        )}
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'image']} preserve={true} noStyle>
                        <Input type={'hidden'} />
                      </Form.Item>
                    </div>
                  ))}
                </div>
                <Button onClick={() => add(initialSpeaker)} type={'primary'}>
                  + Add speaker
                </Button>
              </>
            )}
          </Form.List>
        </fieldset>
      </div>
      <div className={styles.modal_appearance}>
        <Form.Item label='Use image filter' name={['params', 'appearance', 'image_filter']} valuePropName='checked'>
          <Checkbox />
        </Form.Item>
        <Form.Item label='Name' name={['params', 'appearance', 'name']}>
          <Colorpicker popup />
        </Form.Item>
        <Form.Item label='Description' name={['params', 'appearance', 'description']}>
          <Colorpicker popup />
        </Form.Item>
        <Form.Item label='Background' name={['params', 'appearance', 'background']}>
          <Colorpicker popup />
        </Form.Item>
        <Form.Item label='Button text color' name={['params', 'appearance', 'button_text_color']}>
          <Colorpicker popup />
        </Form.Item>
        <Form.Item label='Button border color' name={['params', 'appearance', 'button_border_color']}>
          <Colorpicker popup />
        </Form.Item>
        <Form.Item
          label='Button border radius'
          name={['params', 'appearance', 'button_border_radius']}
          extra={'Specify only digits'}
        >
          <Input type={'number'} />
        </Form.Item>
      </div>
    </>
  )
}

ModuleSpeakers.propTypes = {
  form: PropTypes.object.isRequired,
}

export default ModuleSpeakers
