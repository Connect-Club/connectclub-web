import React, { useEffect, useState } from 'react'
import { Col, Form, Input, Modal, Row } from 'antd'
import clsx from 'clsx'
import Image from 'next/image'
import PropTypes from 'prop-types'

import UploadFile from '@/components/admin/common/UploadFile'
import global_styles from '@/components/admin/css/admin.module.css'
import AntdDefaultStyles from '@/components/auth/style/AntdDefaultStyles'
import styles from '@/components/auth/style/auth.module.css'
import { doRequest } from '@/lib/Api'
import { getUrlWithSizes } from '@/lib/helpers'
import { DeleteCross, Loader } from '@/lib/svg'
import { FC } from '@/model/commonModel'
import { ImageType } from '@/model/imageModel'
import noImage from '@/public/img/svg/no-image.svg'

import 'antd/es/form/style/index.css'
import 'antd/es/input/style/index.css'
import 'antd/es/modal/style/index.css'
import 'antd/es/grid/style/index.css'

type Props = {
  show: boolean
  onSuccess?: () => void
}
const ModalRegister: FC<Props> = ({ show = false, onSuccess }: Props) => {
  const [errors, setErrors] = useState<string[]>([])
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false)
  const [isLoading, setLoading] = useState<boolean>(false)
  const [form] = Form.useForm()

  const requiredField = {
    required: true,
    message: 'The field is required!',
  }

  const hideDialog = async () => {
    await setIsModalVisible(false)
  }

  const handleOnOk = async (values: { avatar: number; username: string; about: string; fullname: string }) => {
    if (isLoading) {
      return
    }

    setErrors([])
    setLoading(true)

    const [name, ...surname] = (values.fullname || '').split(' ')
    const data = {} as {
      name?: string
      surname?: string
      username?: string
      about?: string
      avatar?: number
    }

    if (name?.trim()) {
      data['name'] = name
    }
    if (surname.length) {
      data['surname'] = surname.join(' ')
    }
    if (values.username?.trim()) {
      data['username'] = values.username
    }
    if (values.about?.trim()) {
      data['about'] = values.about
    }
    if (values.avatar) {
      data['avatar'] = values.avatar
    }

    const response = await doRequest({
      method: 'PATCH',
      endpoint: process.env.NEXT_PUBLIC_API_PATCH_EDIT_FRONTEND_PROFILE!,
      data: data,
    })
    if (response._cc_errors.length) {
      const responseErrors = response._cc_errors.map((error) => {
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
      setLoading(false)
    } else {
      if (onSuccess) {
        await setLoading(false)
        await onSuccess()
      }
      await hideDialog()
    }
  }

  const UploadImage = () => {
    const image = form.getFieldValue('avatarImage')

    const onImageSaved = (responseData: ImageType) => {
      form.setFieldsValue({
        avatarImage: responseData.resizerUrl,
        avatar: responseData.id,
      })
    }

    const onDelete = (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault()
      form.setFieldsValue({
        avatarImage: '',
        avatar: 0,
      })
    }

    const AvatarImage = () => {
      const imageSize = 75
      return (
        <div style={{ width: imageSize }}>
          <div className={'relative'} style={{ width: imageSize, height: imageSize, background: '#fff' }}>
            {image ? (
              <Image
                src={getUrlWithSizes(image, imageSize, imageSize)}
                layout={'fill'}
                objectFit={'fill'}
                alt={'avatar'}
              />
            ) : (
              <Image src={noImage} width={imageSize} height={imageSize} alt={'avatar'} quality={100} />
            )}
          </div>
        </div>
      )
    }

    return (
      <div className={styles.upload_avatar_block}>
        <UploadFile
          key='upload'
          accept={'image/*'}
          endpoint={process.env.NEXT_PUBLIC_API_POST_UPLOAD_USER_AVATAR!}
          fileName={'photo'}
          onSuccess={onImageSaved}
        >
          {({ isLoading }) => <div className={styles.avatar_wrapper}>{isLoading ? <Loader /> : <AvatarImage />}</div>}
        </UploadFile>
        {image && (
          <a href='#' title={'Delete'} onClick={onDelete} className={styles.delete_avatar}>
            <DeleteCross width={'25px'} height={'25px'} />
          </a>
        )}
      </div>
    )
  }

  useEffect(() => {
    setIsModalVisible(show)
  }, [show])

  return (
    <>
      <Modal
        destroyOnClose={true}
        visible={isModalVisible}
        closable={false}
        title={<div className='align-center'>Welcome to Connect club!</div>}
        footer={[
          <button key='submit' className={clsx(global_styles.button, 'w100')} form='user_reg'>
            Continue
            {isLoading && <Loader width={'24px'} height={'24px'} />}
          </button>,
        ]}
      >
        <p style={{ fontSize: '16px' }}>This is your profile. Please, tell us about yourself</p>
        <Form
          name='user_reg'
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          labelAlign='left'
          onFinish={handleOnOk}
          form={form}
        >
          <Row>
            <Col span={5}>
              <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.avatar !== currentValues.avatar}>
                {() => (
                  <div>
                    <UploadImage />
                  </div>
                )}
              </Form.Item>
            </Col>
            <Col span={19}>
              <Form.Item
                name='username'
                wrapperCol={{
                  span: 24,
                }}
                rules={[requiredField]}
                extra={'Use letters and digits (A-z0-9_.-)'}
              >
                <Input placeholder={'Username (required)'} />
              </Form.Item>
              <Form.Item
                name='fullname'
                wrapperCol={{
                  span: 24,
                }}
                rules={[requiredField]}
              >
                <Input placeholder={'Fullname (required)'} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name='about'
            wrapperCol={{
              span: 24,
            }}
          >
            <Input.TextArea placeholder={'About (optional)'} rows={4} />
          </Form.Item>
          <Form.Item name='avatar' noStyle>
            <Input type={'hidden'} />
          </Form.Item>
        </Form>
        {errors.length > 0 && (
          <div
            className={clsx(global_styles['mt-1'], global_styles.error_text)}
            dangerouslySetInnerHTML={{ __html: errors.join('<br />') }}
          />
        )}
      </Modal>
      <AntdDefaultStyles />
    </>
  )
}

const getErrorText = (errorCode: string): string => {
  switch (errorCode) {
    case 'v1.user.username.already_exists':
      return 'Username already exists'
    case 'name:cannot_be_empty':
      return 'Name cannot be empty'
    case 'surname:cannot_be_empty':
      return 'Surname cannot be empty'
    case 'about:cannot_be_empty':
      return 'About field cannot be empty'
    case 'username:incorrect_value':
      return 'Username is incorrect'
    default:
      return errorCode
  }
}

ModalRegister.propTypes = {
  show: PropTypes.bool,
  onSuccess: PropTypes.func,
}

export default ModalRegister
