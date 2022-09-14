import React, { useState } from 'react'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Button, Form, Input, InputNumber, Modal, Select, Tooltip } from 'antd'
import clsx from 'clsx'
import PropTypes from 'prop-types'

import global_styles from '@/components/admin/css/admin.module.css'
import { doRequest } from '@/lib/Api'
import { FC } from '@/model/commonModel'
import { User } from '@/model/usersModel'

type Props = {
  user: {
    id: string
    name: string
    surname: string
    username: string
    shortBio: string
    about: string
    freeInvites?: number
    badges: User['badges']
  }
  rowId?: string
  children: React.ReactNode
  onSuccess?: (id: string[]) => void
}
const EditUserInfo: FC<Props> = ({ user, children, rowId = '0', onSuccess }: Props) => {
  const [errors, setErrors] = useState<string[]>([])
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false)
  const [isLoading, setLoading] = useState<boolean>(false)
  const [disabledUsername, setDisabledUsername] = useState(true)

  const initialValues: Omit<Props['user'], 'id'> = {
    name: user.name,
    surname: user.surname,
    username: user.username,
    about: user.about,
    freeInvites: user.freeInvites,
    badges: user.badges,
    shortBio: user.shortBio,
  }

  const handleOnClick = (e: React.FormEvent) => {
    e.preventDefault()
    setIsModalVisible(true)
  }

  const hideDialog = async () => {
    await setIsModalVisible(false)
  }

  const handleOnOk = async (values: Props['user']) => {
    setErrors([])
    setLoading(true)

    const data: Omit<Props['user'], 'freeInvites'> & { countInvites?: number } = {
      id: user.id,
      name: values.name,
      surname: values.surname,
      username: values.username,
      countInvites: values.freeInvites || 0,
      badges: values.badges || [],
      shortBio: values.shortBio || '',
      about: values.about || '',
    }

    const response = await doRequest({
      method: 'PATCH',
      endpoint: process.env.NEXT_PUBLIC_API_POST_CHANGE_USER!.replace(/{id}/, data.id),
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
        await onSuccess([user.id, rowId])
      }
      await hideDialog()
    }
  }

  return (
    <>
      <a onClick={handleOnClick} href='#' title='Edit user info'>
        {children}
      </a>
      <Modal
        title={`Edit "${user.name || '<No name>'}" (#${user.id}) info`}
        destroyOnClose={true}
        visible={isModalVisible}
        onCancel={hideDialog}
        footer={[
          <Button key='back' onClick={hideDialog}>
            Return
          </Button>,
          <Button key='submit' form='user_edit' type='primary' loading={isLoading} htmlType='submit'>
            Submit
          </Button>,
        ]}
      >
        <Form
          name='user_edit'
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          labelAlign='left'
          onFinish={handleOnOk}
          initialValues={initialValues}
        >
          <Form.Item label='Name' name='name'>
            <Input />
          </Form.Item>
          <Form.Item label='Surname' name='surname'>
            <Input />
          </Form.Item>
          <Form.Item
            label={
              <>
                Username
                <Tooltip
                  title={
                    "All user's invite links and profile page with old username will be broken. Are you sure? Ok, double click on input field"
                  }
                >
                  <ExclamationCircleOutlined
                    style={{
                      color: '#faad14',
                      fontSize: '16px',
                      marginLeft: '5px',
                    }}
                  />
                </Tooltip>
              </>
            }
            name='username'
          >
            <Input
              className={disabledUsername ? global_styles.disabled : undefined}
              readOnly={disabledUsername}
              onDoubleClick={() => {
                setDisabledUsername(false)
              }}
            />
          </Form.Item>
          <Form.Item label='Short bio' name='shortBio'>
            <Input.TextArea />
          </Form.Item>
          <Form.Item label='About' name='about'>
            <Input.TextArea />
          </Form.Item>
          <Form.Item label='Number of invites' name='freeInvites'>
            <InputNumber />
          </Form.Item>
          <Form.Item label='Badges' name='badges'>
            <Select mode='multiple' style={{ width: '100%' }}>
              <Select.Option value='team'>Team</Select.Option>
              <Select.Option value='press'>Press</Select.Option>
              <Select.Option value='speaker'>Speaker</Select.Option>
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

const getErrorText = (errorCode: string): string => {
  switch (errorCode) {
    case 'v1.user.username.already_exists':
      return 'Username already exists'
    default:
      return errorCode
  }
}

EditUserInfo.propTypes = {
  rowId: PropTypes.string,
  onSuccess: PropTypes.func,
  children: PropTypes.node,
  user: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    surname: PropTypes.string,
    username: PropTypes.string,
    shortBio: PropTypes.string,
    about: PropTypes.string,
    freeInvites: PropTypes.number,
    badges: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
}

export default EditUserInfo
