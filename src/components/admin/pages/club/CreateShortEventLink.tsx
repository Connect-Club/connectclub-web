import React, { useState } from 'react'
import { Button, Form, Input, Modal } from 'antd'
import clsx from 'clsx'
import PropTypes from 'prop-types'

import global_styles from '@/components/admin/css/admin.module.css'
import { doRequest } from '@/lib/Api'
import { shareEventLink } from '@/lib/helpers'
import { FC } from '@/model/commonModel'

type Props = {
  eventName: string
  clubSlug: string
  clubId: string
  eventId: string
  children: React.ReactNode
}
type Values = {
  utm_campaign: string
}
type BitlyResponse = {
  archived: boolean
  created_at: string
  custom_bitlinks: []
  deeplinks: []
  id: string
  link: string
  long_url: string
  references: {
    group: string
  }
  tags: []
}
const CreateShortEventLink: FC<Props> = ({ eventName, clubSlug, clubId, eventId, children }: Props) => {
  const [errors, setErrors] = useState<string[]>([])
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false)
  const [isLoading, setLoading] = useState<boolean>(false)
  const [shortLink, setShortLink] = useState<string>('')
  const [longLink, setLongLink] = useState<string>('')

  const initialValues: Values = {
    utm_campaign: '',
  }

  const handleOnClick = (e: React.FormEvent) => {
    e.preventDefault()
    setIsModalVisible(true)
  }

  const hideDialog = async () => {
    await setIsModalVisible(false)
  }

  const handleOnOk = async (values: Values) => {
    setErrors([])
    setLoading(true)
    setShortLink('')
    setLongLink('')

    const response = await doRequest<BitlyResponse, BitlyResponse>({
      endpoint: 'https://api-ssl.bitly.com/v4/bitlinks',
      params: {
        headers: {
          Authorization: 'Bearer bca00855f3b397178632b4a8744cb822f452a56e',
          'Content-Type': 'application/json',
        },
      },
      data: {
        long_url: shareEventLink(eventId, values.utm_campaign, clubId, clubSlug),
      },
    })

    setLoading(false)

    if (!response._cc_errors.length && response?.data?.link) {
      setShortLink(response.data.link)
      setLongLink(shareEventLink(eventId, values.utm_campaign, clubId, clubSlug))
    }
  }

  return (
    <>
      <a onClick={handleOnClick} href='#' title='Create share link for event on landing page'>
        {children}
      </a>
      <Modal
        title={`Create share link`}
        destroyOnClose={true}
        visible={isModalVisible}
        onCancel={hideDialog}
        footer={[
          <Button key='back' onClick={hideDialog}>
            Return
          </Button>,
          <Button key='submit' form='short_link' type='primary' loading={isLoading} htmlType='submit'>
            Create
          </Button>,
        ]}
      >
        <div>Event: {eventName}</div>
        <hr />
        <Form
          name='short_link'
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          labelAlign='left'
          onFinish={handleOnOk}
          initialValues={initialValues}
        >
          <Form.Item
            label='utm_campaign'
            name='utm_campaign'
            rules={[
              {
                required: true,
                message: 'Field is required!',
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
        {shortLink !== '' && (
          <div className={global_styles.info_block}>
            Short link:{' '}
            <a href={shortLink} target={'_blank'} rel={'noreferrer'} title={shortLink}>
              {shortLink}
            </a>
            <br />
            <br />
            Long link:{' '}
            <a href={longLink} target={'_blank'} rel={'noreferrer'} title={longLink}>
              {longLink}
            </a>
          </div>
        )}
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

CreateShortEventLink.propTypes = {
  eventName: PropTypes.string.isRequired,
  clubSlug: PropTypes.string.isRequired,
  clubId: PropTypes.string.isRequired,
  eventId: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}

export default CreateShortEventLink
