import React, { useEffect, useMemo, useState } from 'react'
import { CheckCircleTwoTone } from '@ant-design/icons'
import { Button, Col, Form, Input, Row, Select, Tabs } from 'antd'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'

import { useClub } from '@/api/clubApi'
import { useInterests } from '@/api/interestApi'
import BackLink from '@/components/admin/common/BackLink'
import UploadFile from '@/components/admin/common/UploadFile'
import global_styles from '@/components/admin/css/admin.module.css'
import ClubEvents from '@/components/admin/pages/club/ClubEvents'
import JoinRequests from '@/components/admin/pages/club/JoinRequests'
import Members from '@/components/admin/pages/club/Members'
import UsersSearch from '@/components/admin/pages/users/UsersSearch'
import { doRequest } from '@/lib/Api'
import flattenInput from '@/lib/flattenInput'
import { getAvatar, getHumanDate, getUrlWithSizes, shareClubLink } from '@/lib/helpers'
import { Loader } from '@/lib/svg'
import { isDevelopment } from '@/lib/utils'
import { Club } from '@/model/clubModel'
import { FC } from '@/model/commonModel'
import { ImageType } from '@/model/imageModel'
import { SingleInterestType } from '@/model/interestModel'
import { UsersSearchReturn } from '@/model/usersModel'

type Props = {
  clubId: string
}

type ClubSaveData = {
  title: string
  description: string
  interests: Array<Omit<SingleInterestType, 'isLanguage'>>
  imageId?: number
  ownerId?: number
}

type InitialData = {
  title: string
  description: string
  imageId: number
  interests: string[]
  avatar: string
  owner?: UsersSearchReturn
}

const ClubEdit: FC<Props> = ({ clubId }) => {
  const [isFormLoading, setFormLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState<string[]>([])
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const [successText, setSuccessText] = useState<string>('')

  const [club, , isClubLoading] = useClub(clubId)
  const [interests] = useInterests()

  const [form] = Form.useForm()
  const router = useRouter()

  const requiredField = {
    required: true,
    message: 'The field is required!',
  }

  const initialFormValues: InitialData = {
    title: '',
    description: '',
    avatar: '',
    interests: [],
    imageId: 0,
  }

  // eslint-disable-next-line react/display-name
  const ClubImage: FC<{ image: string }> = useMemo(
    () =>
      ({ image }) =>
        (
          <div className={clsx('d-flex gutter-03 align-items-center', global_styles['mb-1'])}>
            <div className={'relative'} style={{ width: 100, height: 100 }}>
              <Image src={getUrlWithSizes(image, 100, 100)} layout={'fill'} objectFit={'contain'} alt={'speaker'} />
            </div>
          </div>
        ),
    [],
  )

  const ClubLink: FC = () => {
    const link = `https://${isDevelopment ? `stage.` : ``}connect.club/club/${
      club?.slug
    }?utm_campaign=share_club_direct`
    return (
      <>
        Club will be available on web via link: {` `}
        <a href={link} title={'Web link'} rel={'noreferrer'} target={'_blank'}>
          {link}
        </a>
      </>
    )
  }

  const onImageSaved = (responseData: ImageType) => {
    form.setFieldsValue({
      avatar: responseData.resizerUrl,
      imageId: responseData.id,
    })
  }

  const onSubmit = async (values: InitialData) => {
    setSuccessText('')
    setFormLoading(true)
    setErrors([])

    const data: ClubSaveData = {
      title: values.title,
      description: values.description,
      interests: values.interests.map((interestJson: string) => JSON.parse(interestJson)),
    }
    if (values.imageId) {
      data['imageId'] = values.imageId
    }

    if (values.owner) {
      const owner = JSON.parse(values.owner.value)
      data['ownerId'] = Number(owner.id)
    }

    const url =
      isEdit && club?.id
        ? process.env.NEXT_PUBLIC_API_PATCH_EDIT_CLUB!.replace(/{id}/, encodeURIComponent(club.id))
        : process.env.NEXT_PUBLIC_API_POST_CREATE_CLUB
    const response = await doRequest<Club>({
      method: isEdit && club?.id ? 'PATCH' : 'POST',
      endpoint: url!,
      data: data,
    })

    if (response._cc_errors.length) {
      const responseErrors = response._cc_errors.map((error) => {
        if (typeof error !== 'string') {
          if (error.statusCode && error.statusCode > 400 && error?.body?.length) {
            return getErrorText(error.body[0])
          } else {
            return error.text
          }
        } else {
          return getErrorText(error)
        }
      })
      setErrors(responseErrors)
      setFormLoading(false)
    } else if (response.data && response.data.response.id) {
      setSuccessText('Saved successfully!')

      if (!isEdit) {
        await router.push(`/admin/club/${response.data.response.id}`)
        return
      }
    }

    if (isEdit) {
      setFormLoading(false)
    }
  }

  /* Set initial values */
  useEffect(() => {
    if (!isClubLoading && club && club?.id) {
      form.setFieldsValue({
        ...club,
        interests: club.interests.map((interest) => {
          return JSON.stringify({
            id: interest.id,
            name: interest.name,
          })
        }),
      })
      setIsEdit(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, flattenInput(club, isClubLoading))

  /* Clear text about successful save */
  useEffect(() => {
    let timeoutID: ReturnType<typeof setTimeout>
    if (successText.length) {
      timeoutID = setTimeout(() => {
        setSuccessText('')
      }, 3000)
    }
    return () => {
      timeoutID && clearTimeout(timeoutID)
    }
  }, [successText])

  return (
    <>
      {isClubLoading ? (
        <Loader />
      ) : (
        <>
          <p className={global_styles.h3}>
            <BackLink url='/admin/club'>Back</BackLink>
            {club && club.id ? `Editing of club "${club.title}"` : 'Creating of new club'}
          </p>
          {isEdit && club?.id && (
            <div className={clsx(global_styles['m-1'], global_styles.info_block)}>
              Club link: {` `}
              <a href={shareClubLink(club.id, club.slug, 'share_club_admin')} title='Club link'>
                {shareClubLink(club.id, club.slug, 'share_club_admin')}
              </a>
            </div>
          )}
          <Form
            name='club'
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
            labelAlign='left'
            onFinish={onSubmit}
            form={form}
            initialValues={initialFormValues}
          >
            <Form.Item label={'Title'} name='title' rules={[requiredField]}>
              <Input maxLength={60} />
            </Form.Item>
            {isEdit && (
              <Form.Item label={'Slug'} name='slug' extra={<ClubLink />}>
                <Input disabled />
              </Form.Item>
            )}
            <Form.Item label={'Description'} name='description'>
              <Input.TextArea rows={8} maxLength={900} showCount />
            </Form.Item>
            <Form.Item
              label={'Image'}
              shouldUpdate={(prevValues, currentValues) => prevValues.avatar !== currentValues.avatar}
            >
              {({ getFieldValue }) => (
                <div>
                  {getFieldValue('avatar') && <ClubImage image={getFieldValue('avatar')} />}
                  <UploadFile
                    key='upload'
                    accept={'image/*'}
                    buttonName={'Upload'}
                    endpoint={process.env.NEXT_PUBLIC_API_POST_UPLOAD_IMAGE!}
                    fileName={'image'}
                    onSuccess={onImageSaved}
                  />
                </div>
              )}
            </Form.Item>

            {!isEdit && (
              <>
                <Form.Item
                  label="Club's owner"
                  name='owner'
                  extra={'If you decide to leave this field empty, then you will be the owner of the club'}
                >
                  <UsersSearch mode={''} allowClear />
                </Form.Item>
                {/*<Form.Item label="Moderators" name="moderators">*/}
                {/*    <UsersSearch />*/}
                {/*</Form.Item>*/}
              </>
            )}

            <Form.Item label='Choose interests' name='interests'>
              <Select mode='multiple'>
                {interests &&
                  interests.map((interest) => (
                    <Select.Option value={JSON.stringify(interest)} key={interest.id}>
                      {interest.name}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>

            {isEdit && club && (
              <Form.Item label={'Owner'}>
                <div className='d-flex'>
                  <Link href={`/admin/users?id=${club.owner.id}`}>
                    <a className='d-flex align-items-center gutter-03 flex-flow-wrap'>
                      {getAvatar(club.owner, 32, '', { marginRight: 0 })}
                      <span className={global_styles.small}>(# {club.owner.id})</span>
                      <div style={{ width: '100%' }}>{club.owner.displayName}</div>
                    </a>
                  </Link>
                  <div className={clsx(global_styles.hint, 'align-items-end')}>
                    created at {getHumanDate(club.createdAt)}
                  </div>
                </div>
              </Form.Item>
            )}
            <Form.Item name='avatar' noStyle>
              <Input type={'hidden'} />
            </Form.Item>
            <Form.Item name='imageId' noStyle>
              <Input type={'hidden'} />
            </Form.Item>
            <Form.Item wrapperCol={{ span: 19 }} className={global_styles['mt-1']}>
              <Row>
                <Col span={16}>
                  <Button type='primary' htmlType='submit' loading={isFormLoading}>
                    Save
                  </Button>
                  {successText.length > 0 && (
                    <span className={global_styles.success_text}>
                      <CheckCircleTwoTone twoToneColor='#52c41a' /> {successText}
                    </span>
                  )}
                </Col>
              </Row>
              {errors.length > 0 && (
                <Row className={global_styles.error_text} dangerouslySetInnerHTML={{ __html: errors.join('<br />') }} />
              )}
            </Form.Item>
          </Form>
          {isEdit && club?.id && (
            <Tabs type='card'>
              {(club.clubRole === 'moderator' || club.clubRole === 'owner') && (
                <Tabs.TabPane tab='Join requests' key='1'>
                  <JoinRequests id={club.id} />
                </Tabs.TabPane>
              )}
              <Tabs.TabPane tab={`Members (${club.countParticipants})`} key='2'>
                <Members id={club.id} totalCount={club.countParticipants} clubRole={club.clubRole} />
              </Tabs.TabPane>
              <Tabs.TabPane tab='Events' key='3'>
                <ClubEvents id={club.id} club={club} />
              </Tabs.TabPane>
            </Tabs>
          )}
        </>
      )}
    </>
  )
}

const getErrorText = (errorCode: string): string => {
  switch (errorCode) {
    case 'title:Title value should not be blank':
      return 'Specify the title of the club'
    case 'v1.club.photo_not_found':
      return 'Select the image of the club'
    default:
      return errorCode
  }
}

ClubEdit.propTypes = {
  clubId: PropTypes.string.isRequired,
}

export default ClubEdit
