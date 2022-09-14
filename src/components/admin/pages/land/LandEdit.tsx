import React, { useEffect, useState } from 'react'
import { CheckCircleTwoTone } from '@ant-design/icons'
import { Button, Checkbox, Col, Form, Input, Row } from 'antd'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'

import { useParcel } from '@/api/landApi'
import { getUser } from '@/api/userApi'
import BackLink from '@/components/admin/common/BackLink'
import UploadFile from '@/components/admin/common/UploadFile'
import global_styles from '@/components/admin/css/admin.module.css'
import RoomSearch from '@/components/admin/pages/rooms/RoomSearch'
import UsersSearch from '@/components/admin/pages/users/UsersSearch'
import { doRequest } from '@/lib/Api'
import flattenInput from '@/lib/flattenInput'
import { cleanUserData, getAvatar, getUrlWithSizes } from '@/lib/helpers'
import { isAdmin } from '@/lib/store'
import { Loader } from '@/lib/svg'
import { isDevelopment } from '@/lib/utils'
import { FC } from '@/model/commonModel'
import { ImageType } from '@/model/imageModel'
import { Parcel } from '@/model/landModel'
import { RoomsSearchReturn } from '@/model/roomModel'

type Props = {
  landId: string
}

type ParcelSaveData = {
  name: string
  description: string
  available: boolean
  imageId?: number | null
  thumbId?: number | null
  ownerId?: number | null
  roomId?: number | null
  x?: number
  y?: number
  sector?: number
}

type InitialData = {
  name: string
  description: string
  thumb: string
  image: string
  sector: number
  x?: number
  y?: number
  available: boolean
}

const LandEdit: FC<Props> = ({ landId }) => {
  const [isFormLoading, setFormLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState<string[]>([])
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const [successText, setSuccessText] = useState<string>('')
  const isUserAdmin = isAdmin()

  const [parcel, , isParcelLoading] = useParcel(landId)

  const [form] = Form.useForm()
  const router = useRouter()

  const requiredField = {
    required: true,
    message: 'The field is required!',
  }

  const initialFormValues: InitialData = {
    name: '',
    description: '',
    thumb: '',
    image: '',
    x: undefined,
    y: undefined,
    sector: 0,
    available: true,
  }

  const UploadParcelImage = ({ field }: { field: 'image' | 'thumb' }) => {
    const onImageSaved = (responseData: ImageType) => {
      form.setFieldsValue({
        [field]: responseData.resizerUrl,
        [`${field}Id`]: responseData.id,
      })
    }

    const ParcelImage: FC<{ image: string }> = ({ image }) => {
      const onDelete = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault()
        form.setFieldsValue({
          [field]: null,
          [`${field}Id`]: null,
        })
      }
      return (
        <div className={clsx(global_styles['mb-1'])} style={{ width: 100 }}>
          <div className={'relative'} style={{ width: 100, height: 100 }}>
            <Image src={getUrlWithSizes(image, 100, 100)} layout={'fill'} objectFit={'contain'} alt={'land'} />
          </div>
          <div className={clsx('align-center', global_styles['mt-1'])}>
            <a href='#' title={'Delete'} onClick={onDelete} style={{ color: '#f00' }}>
              Delete
            </a>
          </div>
        </div>
      )
    }

    const image = form.getFieldValue(field)

    return (
      <>
        {image && <ParcelImage image={image} />}
        <UploadFile
          key='upload'
          accept={'image/*'}
          buttonName={'Upload'}
          endpoint={process.env.NEXT_PUBLIC_API_POST_UPLOAD_IMAGE!}
          fileName={'image'}
          onSuccess={onImageSaved}
        />
      </>
    )
  }

  const onSubmit = async (
    values: InitialData & {
      imageId?: number
      thumbId?: number
      ownerId?: number
      roomId?: number | null
      room?: { value: number } | null
      owner?: RoomsSearchReturn
    },
  ) => {
    setSuccessText('')
    setFormLoading(true)
    setErrors([])

    const data: ParcelSaveData = {
      name: values.name,
      description: values.description,
      sector: Number(values.sector),
      x: Number(values.x),
      y: Number(values.y),
      available: values.available,
    }
    if (values.imageId !== undefined) {
      data['imageId'] = values.imageId
    }
    if (values.thumbId !== undefined) {
      data['thumbId'] = values.thumbId
    }
    if (values.room !== undefined) {
      data['roomId'] = values.room?.value || null
    } else if (values.roomId === null) {
      data['roomId'] = null
    }

    if (values.owner !== undefined) {
      const owner = JSON.parse(values.owner.value)
      data['ownerId'] = Number(owner.id)
    } else if (values.ownerId === null) {
      data['ownerId'] = null
    }

    const url =
      isEdit && parcel?.id
        ? process.env.NEXT_PUBLIC_API_PATCH_LAND!.replace(/{id}/, encodeURIComponent(parcel.id))
        : process.env.NEXT_PUBLIC_API_POST_CREATE_LAND

    const response = await doRequest<Parcel>({
      method: isEdit && parcel?.id ? 'PATCH' : 'POST',
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
        await router.push(`/admin/land/${response.data.response.id}`)
        return
      }
    }

    if (isEdit) {
      setFormLoading(false)
    }
  }

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
  /* Set initial values */
  useEffect(() => {
    if (!isParcelLoading && parcel && parcel?.id) {
      if (parcel.ownerUsername) {
        getUser(parcel.ownerUsername).then(([user]) => {
          if (user) {
            form.setFieldsValue({
              owner: {
                key: user.id,
                value: JSON.stringify(cleanUserData(user)),
                label: `${user.displayName} (#${user.id})`,
              },
            })
          }
        })
      }
      if (parcel.roomId) {
        form.setFieldsValue({
          room: {
            key: parcel.roomId,
            value: parcel.roomId,
            label: parcel.roomId,
          },
        })
      }
      form.setFieldsValue({
        ...parcel,
      })
      setIsEdit(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, flattenInput(isParcelLoading, parcel))

  return (
    <>
      {isParcelLoading ? (
        <Loader />
      ) : (
        <>
          <p className={global_styles.h3}>
            <BackLink url='/admin/land'>Back</BackLink>
            {parcel && parcel.id
              ? `Editing of parcel "${parcel.name || `<Parcel # ${parcel.number}>`}"`
              : 'Creating of new parcel'}
          </p>
          {isEdit && parcel?.id && (
            <div className={clsx(global_styles['m-1'], global_styles.info_block)}>
              Parcel will be available on web via link: {` `}
              <a
                href={`https://${isDevelopment ? `stage.` : ``}connect.club/land/?id=${parcel?.number}`}
                title={'Web link'}
                rel={'noreferrer'}
                target={'_blank'}
              >
                {`https://${isDevelopment ? `stage.` : ``}connect.club/land/?id=${parcel?.number}`}
              </a>
            </div>
          )}
          <Form
            name='land_edit'
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
            labelAlign='left'
            onFinish={onSubmit}
            form={form}
            initialValues={initialFormValues}
          >
            <Form.Item label={'Parcel name'} name='name' rules={[requiredField]}>
              <Input />
            </Form.Item>
            <Form.Item label={'Description'} name='description'>
              <Input.TextArea rows={8} maxLength={900} showCount />
            </Form.Item>
            {isUserAdmin && (
              <>
                <Form.Item label={'For sale'} name='available' valuePropName='checked'>
                  <Checkbox />
                </Form.Item>
                <Form.Item label={'Coords'}>
                  <Input.Group compact>
                    <Form.Item name='x' rules={[requiredField]} style={{ width: '75px' }}>
                      <Input type={'number'} placeholder={'x'} />
                    </Form.Item>
                    <Form.Item name='y' rules={[requiredField]} style={{ width: '75px' }}>
                      <Input type={'number'} placeholder={'y'} />
                    </Form.Item>
                  </Input.Group>
                </Form.Item>
                <Form.Item label={'Sector'} name='sector' rules={[requiredField]}>
                  <Input type={'number'} style={{ width: '75px' }} />
                </Form.Item>
              </>
            )}
            <Form.Item
              label={'Land preview image'}
              shouldUpdate={(prevValues, currentValues) => prevValues.thumb !== currentValues.thumb}
            >
              {() => (
                <div>
                  <UploadParcelImage field={'thumb'} />
                </div>
              )}
            </Form.Item>
            <Form.Item
              label={'Big image'}
              shouldUpdate={(prevValues, currentValues) => prevValues.image !== currentValues.image}
            >
              {() => (
                <div>
                  <UploadParcelImage field={'image'} />
                </div>
              )}
            </Form.Item>

            <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.owner !== currentValues.owner}>
              {({ getFieldValue }) => {
                const owner = getFieldValue('owner')
                if (isUserAdmin) {
                  return (
                    <Form.Item
                      label="Parcel's owner"
                      name='owner'
                      extra={
                        'If you decide to leave this field empty, then Connect club will be the owner of the parcel'
                      }
                    >
                      <UsersSearch
                        mode={''}
                        allowClear
                        onSelect={() => {
                          form.setFieldsValue({
                            room: null,
                          })
                        }}
                        onClear={() => {
                          form.setFieldsValue({
                            ownerId: null,
                            room: null,
                          })
                        }}
                      />
                    </Form.Item>
                  )
                } else {
                  const ownerData = JSON.parse(owner.value)
                  return (
                    <Form.Item label="Parcel's owner">
                      <div className='d-flex'>
                        <Link href={`/admin/users?id=${ownerData.id}`}>
                          <a className='d-flex align-items-center gutter-03 flex-flow-wrap'>
                            {getAvatar(ownerData, 32, '', { marginRight: 0 })}
                            <span className={global_styles.small}>(# {ownerData.id})</span>
                            <div style={{ width: '100%' }}>{ownerData.displayName}</div>
                          </a>
                        </Link>
                      </div>
                      {parcel?.ownerAddress && <div className={global_styles.grey}>Wallet: {parcel.ownerAddress}</div>}
                    </Form.Item>
                  )
                }
              }}
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => {
                if (isUserAdmin) {
                  return prevValues.owner !== currentValues.owner
                } else {
                  return prevValues.roomId !== currentValues.roomId
                }
              }}
            >
              {({ getFieldValue }) => {
                const ownerObj = getFieldValue('owner')
                return (
                  <Form.Item
                    label={'Room'}
                    name='room'
                    extra={'Specify one of the room, that will be connected to your parcel'}
                  >
                    <RoomSearch
                      mode={''}
                      allowClear
                      userId={ownerObj?.key || 0}
                      onClear={() => {
                        form.setFieldsValue({
                          roomId: null,
                        })
                      }}
                    />
                  </Form.Item>
                )
              }}
            </Form.Item>

            <Form.Item name='thumbId' noStyle>
              <Input type={'hidden'} />
            </Form.Item>
            <Form.Item name='imageId' noStyle>
              <Input type={'hidden'} />
            </Form.Item>
            <Form.Item name='ownerId' noStyle>
              <Input type={'hidden'} />
            </Form.Item>
            <Form.Item name='roomId' noStyle>
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

LandEdit.propTypes = {
  landId: PropTypes.string.isRequired,
}

export default LandEdit
