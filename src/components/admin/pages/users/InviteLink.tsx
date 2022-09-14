import React, { useRef, useState } from 'react'
import { Modal } from 'antd'
import clsx from 'clsx'
import PropTypes from 'prop-types'

import global_styles from '@/components/admin/css/admin.module.css'
import { doRequest } from '@/lib/Api'
import { FC } from '@/model/commonModel'

type Props = {
  id?: string
  name?: string
  phone?: string
  onSuccess?: (id: string, phone: string) => void
}
const InviteLink: FC<Props> = ({ id = '0', name = '<No name>', phone = '', onSuccess }: Props) => {
  const [errors, setErrors] = useState<string[]>([])
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false)
  const [isLoading, setLoading] = useState<boolean>(false)

  const modalTitle = `Are you sure to create invite${id !== '0' ? ` to user #${id}` : ''}?`
  const inputPhoneRef = useRef<HTMLInputElement>(null)

  const handleOnClick = (e: React.FormEvent) => {
    e.preventDefault()
    setIsModalVisible(true)
  }

  const hideDialog = () => {
    setIsModalVisible(false)
    setErrors([])
    if (inputPhoneRef.current) {
      inputPhoneRef.current.value = ''
    }
  }

  const handleCreateInvite = async () => {
    if (id === '0' && (!inputPhoneRef.current || inputPhoneRef.current.value.trim() === '')) {
      setErrors(['Specify phone number'])
    } else {
      const phoneNumber = id === '0' ? inputPhoneRef.current!.value.trim() : phone
      setErrors([])
      setLoading(true)
      const response = await doRequest({
        endpoint:
          id !== '0' && !phoneNumber?.length
            ? process.env.NEXT_PUBLIC_API_POST_INVITE_BY_USER_ID!.replace('{userId}', id)
            : process.env.NEXT_PUBLIC_API_POST_INVITE_BY_PHONE!,
        data: { phone: phoneNumber },
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
          return error
        })
        setErrors(responseErrors)
      } else {
        hideDialog()
        onSuccess && onSuccess(id, phoneNumber)
      }
      setLoading(false)
    }
  }

  return (
    <>
      <a onClick={handleOnClick} href='#' title='Create invite'>
        Create invite
      </a>
      <Modal
        title={modalTitle}
        destroyOnClose={true}
        visible={isModalVisible}
        onOk={handleCreateInvite}
        onCancel={hideDialog}
        okButtonProps={{ loading: isLoading }}
        okText='Yes'
        cancelText='No'
      >
        <div className='d-flex align-items-center'>
          <div className={global_styles['ml-1']}>
            You are going to create invite
            {id !== '0' ? (
              <>
                {' '}
                to user &quot;{name} (#{id})&quot;
                {phone ? `with phone ${phone}` : ``}
              </>
            ) : (
              <>
                .
                <div className={clsx(global_styles['mt-1'], 'd-flex gutter-1 align-items-center')}>
                  Specify phone number:
                  <input type='text' ref={inputPhoneRef} />
                </div>
              </>
            )}
          </div>
        </div>
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
    case 'v1.invite.user_already_registered':
      return 'User has already been registered'
    case 'v1.invite.no_free_invites':
      return "You don't have free invites"
    case 'phone:not_valid_mobile_phone_number':
      return 'Not valid phone number'
    case 'v1.invite.already_exists':
      return 'Invite already exists'
    default:
      return 'Error'
  }
}

InviteLink.propTypes = {
  id: PropTypes.string,
  phone: PropTypes.string,
  name: PropTypes.string,
  onSuccess: PropTypes.func,
}

export default InviteLink
