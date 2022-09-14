import React, { useEffect, useState } from 'react'
import { CheckCircleTwoTone } from '@ant-design/icons'
import { Button, Checkbox, Col, DatePicker, Form, Input, Row, Select } from 'antd'
import clsx from 'clsx'
import moment, { Moment } from 'moment'
import Image from 'next/image'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'

import { useClubsObject, useMyClubs } from '@/api/clubApi'
import { useFestivalEvent } from '@/api/festivalApi'
import { useInterests } from '@/api/interestApi'
import { useLanguages } from '@/api/languageApi'
import BackLink from '@/components/admin/common/BackLink'
import global_styles from '@/components/admin/css/admin.module.css'
import DeleteEventButton from '@/components/admin/pages/festival/DeleteEventButton'
import styles from '@/components/admin/pages/festival/festival.module.css'
import UsersSearch from '@/components/admin/pages/users/UsersSearch'
import { doRequest } from '@/lib/Api'
import flattenInput from '@/lib/flattenInput'
import { getUrlWithSizes, prepareInitialUsersForSearchField, shareEventLink } from '@/lib/helpers'
import { Loader } from '@/lib/svg'
import type { FC } from '@/model/commonModel'
import { FestivalEvent } from '@/model/eventModel'

type OnSubmitValues = {
  title: string
  participants: Array<{ key: string; label: string; value: string }>
  interests: string[]
  festivalSceneId: string
  description: string
  date: [Moment, Moment]
  clubId: string | null
  forMembersOnly: boolean
  language: number
}
type EventTypeSave = Omit<FestivalEvent, 'festivalScene' | 'id' | 'language' | 'club'> & {
  id?: string
  clubId: string | null
  festivalSceneId: string
  language: number
}
type Props = {
  eventId: string
}
const FestivalEventPage: FC<Props> = ({ eventId }: Props) => {
  const [isFormLoading, setFormLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState<string[]>([])
  const [isEventEdit, setEventEdit] = useState<boolean>(false)
  const [successText, setSuccessText] = useState<string>('')

  const festivalCode = process.env.NEXT_PUBLIC_FESTIVAL_CODE3!

  const router = useRouter()
  const [form] = Form.useForm()

  /* Get event data by ID */
  const [event, , isEventLoading] = useFestivalEvent(eventId)

  /* Get all stages */
  // const [cleanScenes] = useFestivalScenes(festivalCode);

  const [myClubs] = useMyClubs()
  const [clubs] = useClubsObject({ limit: 1000 })

  /* Get all interests */
  const [interests] = useInterests()

  const [languages] = useLanguages()

  const onSubmit = async (values: OnSubmitValues) => {
    setSuccessText('')
    setFormLoading(true)
    setErrors([])
    const data: EventTypeSave = {
      title: values.title,
      participants: values.participants.map((participantJson) => JSON.parse(participantJson.value)),
      date: values.date[0].unix().valueOf(),
      dateEnd: values.date[1].unix().valueOf(),
      description: values.description,
      interests: values.interests.map((interestJson: string) => JSON.parse(interestJson)),
      festivalSceneId: values.festivalSceneId,
      festivalCode: festivalCode,
      clubId: values?.clubId || null,
      forMembersOnly: values.forMembersOnly ?? false,
      language: values.language,
    }
    if (isEventEdit) {
      data['id'] = event?.id
    }

    const url = event?.id
      ? process.env.NEXT_PUBLIC_API_PATCH_CHANGE_EVENT!.replace(/{id}/, encodeURIComponent(event.id))
      : process.env.NEXT_PUBLIC_API_POST_CREATE_EVENT
    const response = await doRequest<FestivalEvent>({
      method: event?.id ? 'PATCH' : 'POST',
      endpoint: url!,
      data,
    })
    if (response._cc_errors.length) {
      const responseErrors = response._cc_errors.map((error) => {
        if (typeof error !== 'string') {
          if ((error.statusCode === 422 || error.statusCode === 404) && error?.body?.length) {
            return getErrorText(error.body[0])
          } else {
            return error.text
          }
        } else {
          return error
        }
      })
      setErrors(responseErrors)
    } else if (response.data && response.data.response.id) {
      setSuccessText('Saved successfully!')
      if (!isEventEdit) {
        await router.push(`/admin/festival/${response.data.response.id}`)
        return
      }
    }

    if (isEventEdit) {
      setFormLoading(false)
    }
  }

  /* Set initial values */
  useEffect(() => {
    if (event && event?.id) {
      form.setFieldsValue({
        title: event.title,
        description: event.description,
        festivalSceneId: '',
        date: [moment(event.date * 1000), moment(event.dateEnd * 1000)],
        participants: prepareInitialUsersForSearchField(event.participants),
        clubId: event?.club?.id || null,
        forMembersOnly: event.forMembersOnly,
        interests: event.interests.map((interest) => {
          return JSON.stringify({
            id: interest.id,
            name: interest.name,
          })
        }),
        language: event.language.id || 0,
      })
      setEventEdit(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, flattenInput(event, form))

  /* Show loader on submit button, while event tries to load */
  useEffect(() => {
    setFormLoading(isEventLoading)
  }, [isEventLoading])

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
      {isEventLoading ? (
        <Loader />
      ) : (
        <>
          <p className={global_styles.h3}>
            <BackLink url='/admin/festival'>Back</BackLink>
            {event?.id ? `Editing of event "${event.title}"` : 'Creating of new event'}
          </p>
          {isEventEdit && (
            <div className={clsx(global_styles['m-1'], styles.info_block)}>
              Event link: {` `}
              <a href={shareEventLink(eventId, 'share_event_admin')} title='Event link'>
                {shareEventLink(eventId, 'share_event_admin')}
              </a>
            </div>
          )}
          <div className={global_styles['m-1']}>
            <Form
              name='event'
              labelCol={{ span: 3 }}
              wrapperCol={{ span: 16 }}
              labelAlign='left'
              onFinish={onSubmit}
              form={form}
            >
              <Form.Item label='Event name' name='title' rules={[fieldIsRequired]}>
                <Input />
              </Form.Item>

              <Form.Item label='Description' name='description' rules={[fieldIsRequired]}>
                <Input.TextArea autoSize={{ minRows: 3, maxRows: 5 }} showCount maxLength={500} />
              </Form.Item>

              {/*<Form.Item label="Select the stage" name="festivalSceneId" rules={[fieldIsRequired]}>*/}
              {/*    <Select>*/}
              {/*        {cleanScenes && cleanScenes.map(scene => (*/}
              {/*            <Select.Option value={scene.id} key={scene.id}>{scene.sceneCode}</Select.Option>*/}
              {/*        ))}*/}
              {/*    </Select>*/}
              {/*</Form.Item>*/}

              {myClubs.length > 0 && (!isEventEdit || event?.club?.id) && (
                <>
                  <Form.Item label={isEventEdit ? 'Club' : 'Select the club'} name='clubId'>
                    {isEventEdit ? (
                      <div className={'d-flex align-items-center gutter-03'}>
                        {event?.club?.id && clubs?.[event.club.id]?.avatar && (
                          <div
                            className={'relative flex-shrink-0'}
                            style={{
                              width: 50,
                              height: 50,
                            }}
                          >
                            <Image
                              src={getUrlWithSizes(clubs[event.club.id].avatar!, 50, 50)}
                              layout={'fill'}
                              objectFit={'contain'}
                              alt={'club image'}
                            />
                          </div>
                        )}
                        {event?.club?.title}
                        <Input type={'hidden'} />
                      </div>
                    ) : (
                      <Select optionLabelProp='label' allowClear>
                        {myClubs.map((club) => (
                          <Select.Option value={club.id} key={club.id} label={club.title}>
                            <div className={'d-flex align-items-center gutter-03'}>
                              {clubs?.[club.id]?.avatar && (
                                <div
                                  className={'relative flex-shrink-0'}
                                  style={{
                                    width: 50,
                                    height: 50,
                                  }}
                                >
                                  <Image
                                    src={getUrlWithSizes(clubs[club.id].avatar!, 50, 50)}
                                    layout={'fill'}
                                    objectFit={'contain'}
                                    alt={'club image'}
                                  />
                                </div>
                              )}
                              {club.title}
                            </div>
                          </Select.Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>

                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) => prevValues.clubId !== currentValues.clubId}
                  >
                    {({ getFieldValue }) =>
                      getFieldValue('clubId') && (
                        <Form.Item label='Only club members' name='forMembersOnly' valuePropName='checked'>
                          <Checkbox />
                        </Form.Item>
                      )
                    }
                  </Form.Item>
                </>
              )}

              <Form.Item label='Time' name='date' rules={[fieldIsRequired]}>
                <DatePicker.RangePicker
                  disabledDate={disabledDate}
                  showTime={{ format: 'HH:mm' }}
                  format='YYYY-MM-DD HH:mm'
                />
              </Form.Item>

              <Form.Item label='Participants' name='participants' rules={[fieldIsRequired]}>
                <UsersSearch />
              </Form.Item>

              <Form.Item label='Choose the language' name='language' rules={[fieldIsRequired]}>
                <Select>
                  {languages &&
                    languages.map((language) => (
                      <Select.Option value={language.id} key={language.id}>
                        {language.name}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>

              <Form.Item label='Choose interests' name='interests' rules={[fieldIsRequired]}>
                <Select mode='multiple'>
                  {interests &&
                    interests.map((interest) => (
                      <Select.Option value={JSON.stringify(interest)} key={interest.id}>
                        {interest.name}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>

              <Form.Item wrapperCol={{ span: 19 }} className={global_styles['mt-1']}>
                <Row>
                  <Col span={16}>
                    <Button type='primary' htmlType='submit' loading={isFormLoading}>
                      Submit
                    </Button>
                    {successText.length > 0 && (
                      <span className={global_styles.success_text}>
                        <CheckCircleTwoTone twoToneColor='#52c41a' /> {successText}
                      </span>
                    )}
                  </Col>
                  {isEventEdit && event?.id && (
                    <Col span={8} className={clsx(styles.delete_icon, 'align-right')}>
                      <DeleteEventButton
                        id={event.id}
                        title='Delete event'
                        onSuccess={() => router.push(`/admin/festival`)}
                      />
                    </Col>
                  )}
                </Row>
                {errors.length > 0 && (
                  <Row
                    className={global_styles.error_text}
                    dangerouslySetInnerHTML={{ __html: errors.join('<br />') }}
                  />
                )}
              </Form.Item>
            </Form>
          </div>
        </>
      )}
    </>
  )
}

FestivalEventPage.propTypes = {
  eventId: PropTypes.string,
}

/* You cannot schedule event on yesterday */
const disabledDate = (current: Moment) => {
  return current && current <= moment().subtract(1, 'days').endOf('day')
}

const fieldIsRequired = {
  required: true,
  message: 'Field is required!',
}

const getErrorText = (errorCode: string): string => {
  switch (errorCode) {
    case 'title:cannot_be_empty':
      return 'Title cannot be empty'
    case 'participants:cannot_be_empty':
      return 'Participants cannot be empty'
    case 'date:cannot_be_empty':
      return 'Date cannot be empty'
    case 'date:event_schedule.date_time_must_be_greater_now':
      return 'Date cannot be lesser than now'
    case 'dateEnd:event_schedule.date_time_end_must_be_grater_then_start':
      return 'Date end must be greater than start'
    case 'description:cannot_be_empty':
      return 'Description cannot be empty'
    case 'v1.user.not_found':
      return 'User not found'
    default:
      return 'Unprocessable Entity'
  }
}

export default FestivalEventPage
