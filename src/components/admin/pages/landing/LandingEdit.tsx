import React, { useEffect, useState } from 'react'
import { CheckCircleTwoTone, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { Button, Col, Form, Row, Tabs } from 'antd'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'

import { useLanding } from '@/api/landingsApi'
import BackLink from '@/components/admin/common/BackLink'
import global_styles from '@/components/admin/css/admin.module.css'
import popup from '@/components/admin/InfoPopup'
import LandingEditAppearance from '@/components/admin/pages/landing/LandingEditAppearance'
import LandingEditCommon from '@/components/admin/pages/landing/LandingEditCommon'
import LandingEditStructure from '@/components/admin/pages/landing/LandingEditStructure'
import { apiUploadFile, doRequest } from '@/lib/Api'
import flattenInput from '@/lib/flattenInput'
import { Loader } from '@/lib/svg'
import { FC } from '@/model/commonModel'
import { ImageType } from '@/model/imageModel'
import { Landing } from '@/model/landingModel'

type Props = {
  landingId: string
}

const LandingEdit: FC<Props> = ({ landingId }) => {
  const [isFormLoading, setFormLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState<string[]>([])
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const [successText, setSuccessText] = useState<string>('')

  /* Get landing by ID */
  const [landing, isLandingLoading, setLanding] = useLanding(landingId)

  const [form] = Form.useForm()
  const router = useRouter()

  const initialFormValues = {
    status: false,
    title: '',
    subtitle: '',
    params: {
      modules: [],
      seo: {
        title: '',
        description: '',
        index: false,
      },
      header: {
        width: '100%',
        height: '156px',
        objectFit: 'contain',
      },
      colors: {
        background: { r: 10, g: 5, b: 40, a: 1 },
        title: { r: 165, g: 249, b: 129, a: 1 },
        subtitle: { r: 255, g: 255, b: 255, a: 1 },
        link: { r: 165, g: 249, b: 129, a: 1 },
        link_hover: { r: 165, g: 249, b: 129, a: 0.8 },
        text: { r: 255, g: 255, b: 255, a: 1 },
        footer_background: { r: 10, g: 5, b: 40, a: 1 },
        footer_text_color: { r: 255, g: 255, b: 255, a: 0.24 },
      },
    },
  }

  const onSubmit = async (values: Landing) => {
    setSuccessText('')
    setFormLoading(true)
    setErrors([])
    values.status = values.status ? 'active' : 'hide'

    if (isEdit) {
      values.id = landing.id
    }

    /* Delete image header */
    if (values.header_image && values.header_image.length === 0) {
      values.params.header_image = null
    }

    const url = values?.id
      ? process.env.NEXT_PUBLIC_API_POST_CHANGE_LANDING!.replace(/{id}/, values.id)
      : process.env.NEXT_PUBLIC_API_POST_CREATE_LANDING
    const response = await doRequest<Landing>({
      method: values?.id ? 'PATCH' : 'POST',
      endpoint: url!,
      data: values,
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
          return error
        }
      })
      setErrors(responseErrors)
      setFormLoading(false)
    } else if (response.data && response.data.response.id) {
      await setLanding(response.data.response)
      if (values.header_image && values.header_image.length > 0) {
        const formData = new FormData()
        formData.append('image', values.header_image[0].originFileObj as File)
        const response2 = await apiUploadFile<ImageType>(process.env.NEXT_PUBLIC_API_POST_UPLOAD_IMAGE!, formData)

        if (response2._cc_errors.length) {
          popup.error('Header image not saved, ' + response2._cc_errors.join(', '))
        } else if (response2?.data?.response?.id) {
          const response3 = await doRequest<Landing>({
            method: 'PATCH',
            endpoint: process.env.NEXT_PUBLIC_API_POST_CHANGE_LANDING!.replace(/{id}/, response.data.response.id),
            data: {
              params: {
                header_image: response2.data.response.resizerUrl,
              },
            },
          })
          if (!response3._cc_errors.length && response3.data && response3.data.response.id) {
            await setLanding({
              ...response3.data.response,
              header_image: undefined,
            })
          } else if (response3._cc_errors.length) {
            await setLanding((prev) => {
              return { ...prev, header_image: undefined }
            })
            popup.error('Header image not saved')
          }
        }
      }

      setSuccessText('Saved successfully!')

      if (!isEdit) {
        await router.push(`/admin/landing/${response.data.response.id}`)
        return
      }
    }

    if (isEdit) {
      setFormLoading(false)
    }
  }

  const onFailed = () => {
    setErrors(['Specify all values of the form correctly before submitting. Check tabs for more information'])
  }

  /* Set initial values */
  useEffect(() => {
    if (!isLandingLoading) {
      if (landing && landing?.id) {
        form.setFieldsValue({ ...landing, status: landing.status === 'active' })
        setIsEdit(true)
      } else {
        // form.setFieldsValue(initialFormValues);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, flattenInput(landing, isLandingLoading, form))

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
      {isLandingLoading ? (
        <Loader />
      ) : (
        <>
          <p className={global_styles.h3}>
            <BackLink url='/admin/landing'>Back</BackLink>
            {landing.id ? `Editing of landing "${landing.name}"` : 'Creating of new landing'}
          </p>
          <div className={global_styles['m-1']}>
            <div className={clsx('d-flex align-items-center', global_styles.info_block, global_styles['m-1'])}>
              {landing?.params?.seo?.index ? (
                <>
                  <ExclamationCircleOutlined
                    style={{
                      fontSize: '18px',
                      color: '#faad14',
                    }}
                  />
                  <div className={global_styles['ml-1']}>Page will be indexing by search engines</div>
                </>
              ) : (
                <>
                  <CloseCircleOutlined
                    style={{
                      fontSize: '18px',
                      color: '#ccc',
                    }}
                  />
                  <div className={global_styles['ml-1']}>
                    Page is not indexing by search engines. It will not be visible in search results
                  </div>
                </>
              )}
            </div>
            <Form
              name='landing'
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              labelAlign='left'
              onFinish={onSubmit}
              onFinishFailed={onFailed}
              form={form}
              initialValues={initialFormValues}
            >
              <Tabs type='card'>
                <Tabs.TabPane tab='Common' key='1'>
                  <LandingEditCommon landing={landing} form={form} />
                </Tabs.TabPane>
                <Tabs.TabPane tab='Appearance' key='2' forceRender>
                  <LandingEditAppearance />
                </Tabs.TabPane>
                <Tabs.TabPane tab='Structure' key='3' forceRender>
                  <LandingEditStructure landing={landing} form={form} />
                </Tabs.TabPane>
              </Tabs>

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

const getErrorText = (errorCode: string): string => {
  switch (errorCode) {
    case 'v1.landing.url.already_reserved':
      return 'Url already exists. Please, specify unique URL address for the page'
    default:
      return 'Error'
  }
}

LandingEdit.propTypes = {
  landingId: PropTypes.string.isRequired,
}

export default LandingEdit
