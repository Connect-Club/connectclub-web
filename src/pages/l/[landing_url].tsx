import React, { useEffect, useState } from 'react'
import { ColorResult } from 'react-color'
import { CheckCircleTwoTone } from '@ant-design/icons'
import { Form, Input } from 'antd'
import clsx from 'clsx'
import { GetStaticPaths, GetStaticPathsResult, GetStaticProps } from 'next'
import { ScriptProps } from 'next/dist/client/script'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import Script from 'next/script'

import { getLanding, getLandings } from '@/api/landingsApi'
import Footer from '@/components/Footer'
import LandingLayout from '@/components/layout/LandingLayout'
import { getUrlWithSizes } from '@/lib/helpers'
import { Loader } from '@/lib/svg'
import { isDevelopment } from '@/lib/utils'
import { FC, FCWithLayout, Params } from '@/model/commonModel'
import { FormAdditionalData, FormField, Landing, Module, Table } from '@/model/landingModel'
import { Speaker } from '@/model/speakerModel'
import noImage from '@/public/img/svg/no-image.svg'

import styles from './landing_frontend.module.css'

export const getStaticPaths: GetStaticPaths = async () => {
  const [landings, errors] = await getLandings()
  let paths: GetStaticPathsResult['paths'] = []
  if (!errors.length && landings.length) {
    paths = landings
      .map((landing) => {
        if (landing?.url) {
          return {
            params: { landing_url: landing.url },
          }
        }
      })
      .filter((r) => r) as GetStaticPathsResult['paths']
  }
  return {
    paths: paths,
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  const { params } = ctx

  if (!params?.landing_url || typeof params.landing_url !== 'string') {
    console.log('Landing not found', params)
    return {
      notFound: true,
      revalidate: isDevelopment ? 5 : 10,
    }
  }

  /* Get landing data */
  const [landing, errors] = await getLanding(params.landing_url)

  if (errors.length || !landing || ('status' in landing && landing.status !== 'active')) {
    console.log('Landing is hidden', params, landing, errors)
    return {
      notFound: true,
      revalidate: isDevelopment ? 5 : 10,
    }
  }

  return {
    props: {
      landing,
    },
    revalidate: isDevelopment ? 5 : 10,
  }
}

type Props = {
  landing: Landing
}
const LandingFrontend: FCWithLayout<Props> = ({ landing }) => {
  return (
    <div className={clsx('container', styles.landing, !landing.params.header_image ? styles.no_image : undefined)}>
      <Head>
        {(parseInt(process.env.NEXT_PUBLIC_ROBOTS_NO_INDEX!) > 0 || !landing.params.seo.index) && (
          <>
            <meta name='robots' content='noindex, nofollow' />
            <meta name='googlebot' content='noindex,nofollow' />
          </>
        )}
        <title>{landing.params.seo.title}</title>
        <meta name='description' content={landing.params.seo.description} />

        <meta property='og:title' content={landing.params.seo.title} />
        <meta property='og:description' content={landing.params.seo.description} />
        <meta property='og:url' content={`https://${isDevelopment ? 'stage.' : ''}connect.club/l/${landing.url}`} />
      </Head>

      {landing.params.header_image && (
        <div className={styles.logo}>
          <Image
            src={getUrlWithSizes(landing.params.header_image, 2500, 2500)}
            priority={true}
            layout={'fill'}
            objectFit={landing.params?.header?.objectFit ?? 'contain'}
            quality={100}
            alt={landing.title}
          />
        </div>
      )}

      <main>
        {landing.title && (
          <h1 className={styles.h1}>
            {landing.title}
            {landing.subtitle && <div className={styles.subtitle}>{landing.subtitle}</div>}
          </h1>
        )}
        {landing.params.modules.length > 0 &&
          landing.params.modules.map((module, index) => (
            <ModuleFactory module={module} key={index} moduleIndex={index} />
          ))}
      </main>
      <Footer footerLogoColor={getRgbStyle(landing.params.colors.footer_text_color)} />
      <style global jsx>{`
        :root {
          --link-color: ${getRgbStyle(landing.params.colors.link)};
          --link-color-hover: ${getRgbStyle(landing.params.colors.link_hover)};
        }
        html,
        body,
        main {
          background: ${getRgbStyle(landing.params.colors.background)};
          color: ${getRgbStyle(landing.params.colors.text)};
        }
        p,
        ul {
          color: ${getRgbStyle(landing.params.colors.text)};
        }
        h1,
        h2,
        h3,
        h4,
        h5,
        .title_color {
          color: ${getRgbStyle(landing.params.colors.title)};
        }
        .${styles.landing} .footer {
          color: ${getRgbStyle(landing.params.colors.footer_text_color)};
          background: ${getRgbStyle(landing.params.colors.footer_background)};
        }
        .footer__social_icons svg {
          fill: ${getRgbStyle(landing.params.colors.footer_text_color)};
        }
        .${styles.logo} {
          width: ${landing.params?.header?.width ?? '100%'};
          height: ${landing.params?.header?.height ?? '156px'};
        }
        .${styles.subtitle} {
          color: ${getRgbStyle(landing.params.colors.subtitle)};
        }
      `}</style>
    </div>
  )
}

const getRgbStyle = (rgb: ColorResult['rgb'], alpha?: number): string => {
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha ?? rgb.a})`
}

type ModuleProps = {
  module: Module
  moduleIndex: number
}
const ModuleFactory: FC<ModuleProps> = (props) => {
  const { module } = props
  return (
    <>
      {module.id === 'js' ? (
        <ModuleJs {...props} />
      ) : (
        <div
          className={clsx(`module_${module.id}`, styles.module, module?.params?.border ? styles.module_bordered : null)}
          style={{
            borderColor: module?.params?.appearance?.border_color
              ? getRgbStyle(module.params.appearance.border_color)
              : 'transparent',
          }}
        >
          {module.title && <div className={clsx(styles.module_title, 'title_color')}>{module.title}</div>}
          {module.id === 'text' && <ModuleText {...props} />}
          {module.id === 'speakers' && <ModuleSpeakers {...props} />}
          {module.id === 'table' && <ModuleTable {...props} />}
          {module.id === 'button' && <ModuleButton {...props} />}
          {module.id === 'form' && <ModuleForm {...props} />}
        </div>
      )}
    </>
  )
}

const ModuleText: FC<ModuleProps> = ({ module }) => {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: module?.params?.text || '' }}
      className={clsx(styles.columns, `column_${module?.params?.columns || 1}`)}
      style={{
        justifyContent: module?.params?.columns_justify_content || 'space-between',
      }}
    />
  )
}

const ModuleSpeakers: FC<ModuleProps> = ({ module, moduleIndex }) => {
  const appearance = module?.params?.appearance
  const speakers = module?.params?.speakers || []
  let preparedSpeakers: Speaker[] = []
  if (speakers.length) {
    preparedSpeakers = speakers
      .map((speaker: Speaker) => {
        if (speaker.status) {
          return {
            ...speaker,
            image: speaker.image ? getUrlWithSizes(speaker.image, 1000, 1000) : '',
          }
        }
      })
      .filter((r: Speaker) => r)
  }
  return (
    <>
      {preparedSpeakers.length > 0 && (
        <>
          <div className={clsx(styles.landing__speakers, 'd-flex flex-flow-wrap justify-content-center')}>
            {preparedSpeakers.map((speaker, index) => (
              <div
                className={clsx(styles.speaker)}
                style={{
                  background: appearance?.background ? getRgbStyle(appearance?.background) : undefined,
                }}
                key={index}
              >
                <div
                  className={clsx(styles.speaker__image, !appearance?.image_filter ? styles.without_filter : undefined)}
                >
                  <Image
                    src={speaker.image || noImage}
                    quality={100}
                    alt={speaker.name}
                    layout='fill'
                    objectFit='cover'
                  />
                </div>
                <div className={clsx(styles.speaker__info, !speaker.image ? styles.no_image : '')}>
                  <div
                    className={styles.speaker__name}
                    style={{
                      color: appearance?.name ? getRgbStyle(appearance?.name) : undefined,
                    }}
                  >
                    {speaker.name}
                  </div>
                  <div
                    className={styles.speaker__description}
                    style={{
                      color: appearance?.description ? getRgbStyle(appearance?.description) : undefined,
                    }}
                  >
                    {speaker.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {module?.params?.show_more_button && module?.params?.link_url && module?.params?.link_text && (
            <div className='align-center'>
              <a
                href={module.params.link_url}
                rel='noreferrer'
                target='_blank'
                title={module.params.link_text}
                className={clsx(styles.landing__button, `b-${moduleIndex}`)}
                style={{
                  color: appearance?.button_text_color ? getRgbStyle(appearance?.button_text_color) : undefined,
                  borderColor: appearance?.button_border_color
                    ? getRgbStyle(appearance?.button_border_color)
                    : undefined,
                }}
              >
                {module.params.link_text}
              </a>
              <style global jsx>
                {`
                  .${styles.landing__button}.b-${moduleIndex}:hover {
                    ${appearance?.button_text_color
                      ? `color: ${getRgbStyle(appearance?.button_text_color, 0.8)} !important;`
                      : ''}
                    ${appearance?.button_border_color
                      ? `border-color: ${getRgbStyle(appearance?.button_border_color, 0.8)} !important;`
                      : ''}
                  }
                `}
              </style>
            </div>
          )}
        </>
      )}
    </>
  )
}

const ModuleTable: FC<ModuleProps> = ({ module, moduleIndex }) => {
  const appearance = module?.params?.appearance
  const tables = module?.params?.tables || []
  let preparedTables: Table[] = []
  if (tables.length) {
    preparedTables = tables
      .map((table: Table) => {
        if (table.rows.length) {
          return { ...table, rows: table.rows.filter((r) => r) }
        }
      })
      .filter((r: Table) => r)
  }
  return (
    <>
      {preparedTables.length > 0 && (
        <>
          <section className={clsx(styles.scenes, `t_${moduleIndex}`, 'd-flex')}>
            <div className={clsx(styles.scenes_inner_wrapper, 'd-flex')}>
              {preparedTables.map((table, index) => (
                <div className={clsx(styles.events__scenes)} key={index}>
                  <div
                    className={clsx(
                      styles.events__scenes_item,
                      `${styles.events__scenes_item}_${index}`,
                      table.description === '' ? styles.events__scenes_without_subtitle : null,
                    )}
                    style={{
                      background: getRgbStyle(table.color),
                    }}
                  >
                    <div
                      className={styles.events__scenes_heading}
                      style={{
                        color: appearance?.title_color ? getRgbStyle(appearance?.title_color) : undefined,
                        background: appearance?.title_background
                          ? getRgbStyle(appearance?.title_background)
                          : undefined,
                      }}
                    >
                      {table.title}
                    </div>
                    {table.description !== '' && (
                      <div>
                        <div
                          className={styles.events__scenes_heading_subtitle}
                          style={{
                            color: appearance?.title_color ? getRgbStyle(appearance?.title_color) : undefined,
                            background: appearance?.title_background
                              ? getRgbStyle(appearance?.title_background)
                              : undefined,
                          }}
                        >
                          {table.description}
                        </div>
                      </div>
                    )}
                    {table.rows.map((rowContent, index2) => (
                      <div className={clsx(styles.events__scenes_row, 'd-flex')} key={index2}>
                        <div
                          className={styles.events__scenes_time}
                          style={{
                            color: getRgbStyle(table.color),
                            background: getRgbStyle(table.color),
                          }}
                        />
                        <div className={styles.events__scenes_content}>
                          <div className={styles.events__scenes_name}>{rowContent}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <style jsx global>
                    {`
                      .t_${moduleIndex} .${styles.events__scenes_item}_${index}:before {
                        ${appearance?.title_background ? `background: ${getRgbStyle(appearance.title_background)}` : ``}
                      }
                    `}
                  </style>
                </div>
              ))}
              <style>
                {`
                                .t_${moduleIndex} .${styles.events__scenes_name} { ${
                  appearance?.text ? `color: ${getRgbStyle(appearance.text)}` : ``
                } }
                                .t_${moduleIndex} .${styles.events__scenes_name}:hover { ${
                  appearance?.text ? `color: ${getRgbStyle(appearance.text, 0.8)}` : ``
                } }
                            `}
              </style>
            </div>
          </section>
        </>
      )}
    </>
  )
}

const ModuleJs: FC<ModuleProps> = ({ module, moduleIndex }) => {
  const props: {
    strategy: ScriptProps['strategy']
    src?: string
    dangerouslySetInnerHTML?: { __html: string }
  } = {
    strategy: module?.params?.strategy || 'afterInteractive',
  }
  if (module?.params?.type && module.params.type === 'src') {
    props['src'] = module.params?.value
  } else {
    props['dangerouslySetInnerHTML'] = { __html: module.params?.value }
  }
  return <>{module?.params?.value && <Script id={`script-${moduleIndex}`} {...props} />}</>
}

const ModuleButton: FC<ModuleProps> = ({ module, moduleIndex }) => {
  const router = useRouter()
  const [urlParams, setUrlParams] = useState('')

  useEffect(() => {
    const pathname = window.location.pathname
    let params: Record<string, string> = {}
    let searchParams = ''

    if (Object.keys(router.query).length) {
      params = Object.keys(router.query).reduce((accum, curVal) => {
        if (curVal.includes('utm_') && router.query[curVal]) {
          accum[curVal] = router.query[curVal] as string
        }
        return accum
      }, params)

      if (Object.keys(params).length) {
        searchParams = new URLSearchParams(params).toString()
        setUrlParams(searchParams)
      }
    }

    window.history.replaceState(
      window.history.state,
      document.title,
      pathname + (searchParams ? '?' + searchParams : ''),
    )
  }, [router, router.query])

  const appearance = module?.params?.appearance
  const buttonStyle = {
    background: getRgbStyle(appearance.background),
    color: getRgbStyle(appearance.text),
    borderColor: getRgbStyle(appearance.border_color),
    borderRadius: `${appearance.border_radius}px`,
  }
  const handleOnClick = () => {
    if (module?.params?.onclick && document) {
      const script = document.createElement('script')
      script.text = module.params.onclick
      document.body.appendChild(script)
    }
  }
  return (
    <>
      {module?.params?.name && (
        <div className={clsx('mt-2', `b_${moduleIndex}`)} style={{ textAlign: module?.params?.alignment ?? undefined }}>
          {module?.params?.link ? (
            <a
              href={module.params.link + (urlParams ? (module.params.link.includes('?') ? '&' : '?') + urlParams : '')}
              title={module.params.name}
              target={'_blank'}
              rel='noreferrer'
              className={clsx(styles.button)}
              style={buttonStyle}
              onClick={handleOnClick}
            >
              {module.params.name}
            </a>
          ) : (
            <button
              className={clsx(styles.button)}
              title={module.params.name}
              style={buttonStyle}
              onClick={handleOnClick}
            >
              {module.params.name}
            </button>
          )}
          <style jsx>{`
            .b_${moduleIndex} .${styles.button}:hover {
              ${appearance?.text ? `color: ${getRgbStyle(appearance?.text, 0.8)} !important;` : ``}
              ${appearance?.background_hover
                ? `background: ${getRgbStyle(appearance?.background_hover)} !important;`
                : ``}
            }
          `}</style>
        </div>
      )}
    </>
  )
}

const ModuleForm: FC<ModuleProps> = ({ module, moduleIndex }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [successText, setSuccessText] = useState('')
  const [form] = Form.useForm()

  const appearance = module?.params?.appearance
  const fields: FormField[] = module?.params?.fields || []
  const data: FormAdditionalData[] = module?.params?.data || []

  const availableTypes = ['email', 'input:text']

  const buttonStyle = {
    background: getRgbStyle(appearance.button_background),
    color: getRgbStyle(appearance.button_text),
    borderColor: getRgbStyle(appearance.button_border_color),
    borderRadius: `${appearance.button_border_radius}px`,
  }

  const fieldIsRequired = {
    required: true,
    message: 'Field is required!',
  }

  let preparedFields: FormField[] = []
  if (fields.length) {
    preparedFields = fields.filter((field) => availableTypes.includes(field.type))
  }

  const initialFormValues: Params = {}
  if (data.length) {
    data.forEach((d) => {
      initialFormValues[d.name] = d.value
    })
  }

  const handleOnFinish = async () => {
    setIsLoading(true)

    setTimeout(() => {
      if (module?.params?.onsuccess && document) {
        const script = document.createElement('script')
        script.text = module.params.onsuccess
        document.body.appendChild(script)
      }

      /* If success text not defined, show only tick */
      if (!module?.params?.success_text || !module.params.success_text.trim()) {
        const successIcon = document.querySelector(`.f_${moduleIndex} .${styles.success_icon}`) as HTMLSpanElement
        if (successIcon) {
          successIcon.style.display = 'inline-block'
          setTimeout(() => {
            successIcon.style.display = 'none'
            form.resetFields()
          }, 3000)
        }
      } else {
        setSuccessText(module.params.success_text)
      }
    }, 2000)

    setIsLoading(false)
  }

  return (
    <>
      {preparedFields.length > 0 && (
        <div className={clsx(styles.form_wrapper, `f_${moduleIndex}`)}>
          {successText === '' ? (
            <>
              {module?.params?.text_before && (
                <div
                  className={styles.form__text_before}
                  dangerouslySetInnerHTML={{
                    __html: module.params.text_before,
                  }}
                />
              )}
              <Form
                name={`form_${moduleIndex}`}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                labelAlign='left'
                onFinish={handleOnFinish}
                form={form}
                initialValues={initialFormValues}
              >
                {preparedFields.map((field, index) => (
                  <Form.Item
                    key={index}
                    name={field.code}
                    label={field.show_name ? field.name : undefined}
                    rules={[
                      field.required ? fieldIsRequired : {},
                      field.type === 'email'
                        ? {
                            type: 'email',
                            message: 'Email is not valid',
                          }
                        : {},
                    ]}
                    className={clsx(styles.form__field, !field.show_name ? styles.hide_label : undefined)}
                  >
                    <Input placeholder={field.placeholder || ''} />
                  </Form.Item>
                ))}

                {data.length > 0 &&
                  data.map((d, index2) => (
                    <Form.Item key={index2} hidden name={d.name}>
                      <Input type={'hidden'} />
                    </Form.Item>
                  ))}
                <Form.Item>
                  <button
                    className={clsx(styles.button, isLoading ? styles.is_loading : undefined)}
                    style={buttonStyle}
                  >
                    {module?.params?.button_name}
                    {isLoading && <Loader width={'24px'} height={'24px'} className={styles.loading_icon} />}
                    <CheckCircleTwoTone className={styles.success_icon} twoToneColor='#52c41a' />
                  </button>
                </Form.Item>
              </Form>
              {module?.params?.text_after && (
                <div
                  className={styles.form__text_after}
                  dangerouslySetInnerHTML={{ __html: module.params.text_after }}
                />
              )}
              <style jsx>{`
                .f_${moduleIndex} .${styles.button}:hover {
                  ${appearance?.button_text ? `color: ${getRgbStyle(appearance?.button_text, 0.8)} !important;` : ``}
                  ${appearance?.button_background_hover
                    ? `background: ${getRgbStyle(appearance?.button_background_hover)} !important;`
                    : ``}
                }
              `}</style>
            </>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: successText }} />
          )}
        </div>
      )}
    </>
  )
}

LandingFrontend.getLayout = LandingLayout

export default LandingFrontend
