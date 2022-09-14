import React, { useState } from 'react'
import { Button, Form, Input, Modal, Select } from 'antd'
import clsx from 'clsx'
import PropTypes from 'prop-types'

import global_styles from '@/components/admin/css/admin.module.css'
import { doRequest } from '@/lib/Api'
import { FC } from '@/model/commonModel'
import { Subscription } from '@/model/subscriptionModel'

type Data = Omit<Subscription, 'createdAt' | 'price' | 'currency' | 'id' | 'authorId'> & {
  id?: Subscription['id']
  price?: Subscription['price']
  currency?: Subscription['currency']
}

type Props = {
  children: React.ReactNode
  subscription?: Subscription
  onSuccess?: (id: string | undefined) => void
}
const CreateEditSubscription: FC<Props> = ({ children, subscription, onSuccess }: Props) => {
  const [errors, setErrors] = useState<string[]>([])
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false)
  const [isLoading, setLoading] = useState<boolean>(false)

  const initialValues = subscription

  const handleOnClick = (e: React.FormEvent) => {
    e.preventDefault()
    setIsModalVisible(true)
  }

  const hideDialog = () => {
    setIsModalVisible(false)
  }

  const handleOnOk = async (values: Subscription) => {
    setErrors([])
    setLoading(true)

    const data: Data = {
      name: values.name,
      description: values.description,
      isActive: true,
    }

    if (!subscription?.id) {
      data['price'] = values.price
      // data['currency'] = values.currency;
    } else {
      data['id'] = subscription.id
    }

    const url = !subscription?.id
      ? process.env.NEXT_PUBLIC_API_POST_CREATE_SUPERCREATOR_SUBSCRIPTION
      : process.env.NEXT_PUBLIC_API_POST_CHANGE_SUPERCREATOR_SUBSCRIPTION
    const response = await doRequest<{ id: string }>({
      method: !subscription?.id ? 'POST' : 'PATCH',
      endpoint: url!,
      data,
    })
    setLoading(false)
    if (response._cc_errors.length) {
      const responseErrors = response._cc_errors.map((error) => {
        if (typeof error !== 'string') {
          if (error?.body?.length) {
            return getErrorText(error.body[0])
          } else {
            return error.text
          }
        }
        return error
      })
      setErrors(responseErrors)
    } else {
      hideDialog()
      if (onSuccess) {
        onSuccess(subscription?.id ?? response?.data?.response?.id)
      }
    }
  }

  const title = subscription?.id ? 'Edit your subscription' : 'Create new subscription'
  const requiredField = {
    required: true,
    message: 'The field is required!',
  }

  return (
    <>
      <a onClick={handleOnClick} href='#' title={title}>
        {children}
      </a>
      <Modal
        title={title}
        destroyOnClose={true}
        visible={isModalVisible}
        onCancel={hideDialog}
        footer={[
          <Button key='back' onClick={hideDialog}>
            cancel
          </Button>,
          <Button key='submit' form='subscription_edit' type='primary' loading={isLoading} htmlType='submit'>
            Submit
          </Button>,
        ]}
      >
        <Form
          name='subscription_edit'
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          labelAlign='left'
          onFinish={handleOnOk}
          initialValues={initialValues}
        >
          <Form.Item label='Name' name='name' rules={[requiredField]}>
            <Input maxLength={150} />
          </Form.Item>
          <Form.Item label='Description' name='description' rules={[requiredField]}>
            <Input.TextArea showCount maxLength={1000} />
          </Form.Item>
          {!subscription?.id && (
            <>
              <Form.Item label='Price' required>
                <Input.Group compact>
                  <Form.Item name='price' rules={[{ required: true, message: '' }]}>
                    <Select placeholder='Price'>
                      <Select.Option value={500}>500</Select.Option>
                      <Select.Option value={1000}>1000</Select.Option>
                      <Select.Option value={1500}>1500</Select.Option>
                      <Select.Option value={2000}>2000</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name='currency' rules={[{ required: true, message: '' }]}>
                    <Select placeholder='Select the currency'>
                      <Select.Option value={'RUB'}>RUB</Select.Option>
                      <Select.Option value={'USD'}>USD</Select.Option>
                    </Select>
                  </Form.Item>
                </Input.Group>
              </Form.Item>
            </>
          )}
        </Form>
        {errors.length > 0 && (
          <div
            className={clsx(global_styles['mt-1'], global_styles.error_text)}
            dangerouslySetInnerHTML={{ __html: errors.join('<br />') }}
          />
        )}
        {!subscription?.id && (
          <div className={clsx(global_styles['mt-1'], global_styles.error_text)}>
            After saving the subscription you will not be able to change the price
          </div>
        )}
      </Modal>
    </>
  )
}

const getErrorText = (errorCode: string): string => {
  switch (errorCode) {
    case 'v1.subscription.active_limit':
      return 'You have reached the limit of the subscriptions'
    case 'price:is_not_a_valid_choice':
      return 'Price is not valid'
    case 'name:cannot_be_empty':
      return 'Name cannot be empty'
    case 'price:cannot_be_empty':
      return 'Price cannot be empty'
    default:
      return 'Error'
  }
}

CreateEditSubscription.propTypes = {
  children: PropTypes.node.isRequired,
  subscription: PropTypes.object,
  onSuccess: PropTypes.func,
}

export default CreateEditSubscription
