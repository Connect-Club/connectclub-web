import React, { useState } from 'react'
import { Button, Form, Input, Modal, Select } from 'antd'
import PropTypes from 'prop-types'

import { FC } from '@/model/commonModel'
import { ShortUserInfo, User } from '@/model/usersModel'

type Props = {
  user: ShortUserInfo & { interests?: User['interests'] }
  children: React.ReactNode
}
const UserInfo: FC<Props> = ({ user, children }) => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false)

  const handleOnClick = (e: React.FormEvent) => {
    e.preventDefault()
    setIsModalVisible(true)
  }
  const hideDialog = () => {
    setIsModalVisible(false)
  }

  return (
    <>
      <a onClick={handleOnClick} href='#' className={'d-flex align-items-center'} title={'Show user info'}>
        {children}
      </a>
      <Modal
        title={'User info'}
        destroyOnClose={true}
        visible={isModalVisible}
        onCancel={hideDialog}
        footer={[
          <Button key='back' onClick={hideDialog}>
            Close
          </Button>,
        ]}
      >
        <Form
          initialValues={{
            ...user,
            interests: user?.interests?.length ? user.interests.map((inter) => JSON.stringify(inter)) : [],
          }}
        >
          {user.shortBio && (
            <Form.Item name={'shortBio'} label={'Short bio'}>
              <Input.TextArea readOnly />
            </Form.Item>
          )}
          {user.longBio && (
            <Form.Item name={'longBio'} label={'Long bio'}>
              <Input.TextArea readOnly />
            </Form.Item>
          )}
          {user.about && (
            <Form.Item name={'about'} label={'About'}>
              <Input.TextArea readOnly />
            </Form.Item>
          )}
          {user?.interests?.length && user.interests.length > 0 && (
            <Form.Item label={'Interests'} name={'interests'}>
              <Select mode={'multiple'} allowClear={false}>
                {user.interests.map((interest) => (
                  <Select.Option value={JSON.stringify(interest)} key={interest.id}>
                    {interest.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  )
}

UserInfo.propTypes = {
  user: PropTypes.object,
  children: PropTypes.node,
}

export default UserInfo
