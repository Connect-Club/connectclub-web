import React from 'react'
import { DeleteOutlined, PaperClipOutlined, UploadOutlined } from '@ant-design/icons'
import { Button, Checkbox, Col, Form, Input, Upload, UploadProps } from 'antd'
import { FormInstance } from 'antd/lib/form/hooks/useForm'
import { UploadFile } from 'antd/lib/upload/interface'
import PropTypes from 'prop-types'

import popup from '@/components/admin/InfoPopup'
import { getUrlWithSizes } from '@/lib/helpers'
import { FC } from '@/model/commonModel'
import { Landing } from '@/model/landingModel'

type Props = {
  landing: Landing
  form: FormInstance
}
const LandingEditCommon: FC<Props> = ({ landing, form }) => {
  const fieldIsRequired = {
    required: true,
    message: 'Field is required!',
  }
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
  }

  const nullHeaderImage = () => {
    const headerImageField = document.querySelector('.default_header_image') as HTMLDivElement
    if (headerImageField) {
      headerImageField.style.display = 'none'
    }
    if (!form.getFieldValue('header_image')) {
      form.setFieldsValue({
        header_image: [],
      })
    }
  }

  const getFile = (e: any) => {
    if (Array.isArray(e)) {
      return e
    }
    return e && e.fileList
  }

  return (
    <>
      <Form.Item label='Publish' name='status' valuePropName='checked'>
        <Checkbox />
      </Form.Item>
      <Form.Item
        label='Name'
        name='name'
        extra='Only visible in admin in the list of all landings'
        rules={[fieldIsRequired]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label='URL address'
        name='url'
        extra='Landing will be available at https://connect.club/l/{URL}'
        rules={[
          {
            validator: (_, value) =>
              value && !value.match(/[^A-z0-9\-_]/)
                ? Promise.resolve()
                : Promise.reject(new Error('Use only [A-z0-9-_]')),
          },
          fieldIsRequired,
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item label='Title (h1)' name='title' rules={[fieldIsRequired]}>
        <Input />
      </Form.Item>
      <Form.Item label='Subtitle (h2)' name='subtitle'>
        <Input />
      </Form.Item>
      <Form.Item
        name={'header_image'}
        label='Header image'
        valuePropName='fileList'
        getValueFromEvent={getFile}
        style={{ marginBottom: landing.params.header_image ? 0 : '' }}
      >
        <Upload {...uploadProps}>
          <Button icon={<UploadOutlined />}>Upload image</Button>
        </Upload>
      </Form.Item>
      {landing.params.header_image && (
        <Form.Item wrapperCol={{ offset: 4 }} className={'default_header_image'}>
          <Col span={16}>
            <div className={'d-flex align-items-center'} style={{ padding: '0 4px' }}>
              <PaperClipOutlined style={{ color: 'rgba(0, 0, 0, 0.45)', paddingRight: '8px' }} />
              <a href={getUrlWithSizes(landing.params.header_image, 2500, 2500)} target={'_blank'} rel='noreferrer'>
                header_image
              </a>
              <DeleteOutlined
                style={{
                  color: 'rgba(0, 0, 0, 0.45)',
                  marginLeft: 'auto',
                }}
                onClick={nullHeaderImage}
                title={'Delete'}
              />
            </div>
          </Col>
        </Form.Item>
      )}
      <Form.Item name={['params', 'header_image']} noStyle>
        <Input type={'hidden'} />
      </Form.Item>
      <fieldset>
        <legend>SEO</legend>
        <Form.Item label='Title' name={['params', 'seo', 'title']} rules={[fieldIsRequired]}>
          <Input maxLength={70} />
        </Form.Item>
        <Form.Item label='Description' name={['params', 'seo', 'description']} rules={[fieldIsRequired]}>
          <Input.TextArea maxLength={200} showCount />
        </Form.Item>
        <Form.Item
          label='Indexing'
          name={['params', 'seo', 'index']}
          extra='Allow to index page by search engine robots'
          valuePropName='checked'
        >
          <Checkbox />
        </Form.Item>
      </fieldset>
    </>
  )
}

LandingEditCommon.propTypes = {
  landing: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
}

export default LandingEditCommon
