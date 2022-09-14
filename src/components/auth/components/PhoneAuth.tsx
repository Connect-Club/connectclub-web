import React, { useEffect, useRef, useState } from 'react'
import { Button, Input, InputRef, Select } from 'antd'
import clsx from 'clsx'
import Script from 'next/script'
import PropTypes from 'prop-types'
import Cookies from 'universal-cookie'

import AntdDefaultStyles from '@/components/auth/style/AntdDefaultStyles'
import styles from '@/components/auth/style/auth.module.css'
import { doRequest } from '@/lib/Api'
import flattenInput from '@/lib/flattenInput'
import { Loader } from '@/lib/svg'
import { useApiResponse } from '@/lib/useApi'
import type { FC } from '@/model/commonModel'
import { TokenApiResponse } from '@/model/commonModel'
import { LocationPhoneNumberFormats } from '@/model/locationModel'

import 'antd/lib/button/style/index.css'
import 'antd/lib/input/style/index.css'
import 'antd/lib/select/style/index.css'

type Props = {
  onSuccess?: () => void
}

const PhoneAuth: FC<Props> = ({ onSuccess }) => {
  const [region, setRegion] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [code, setCode] = useState<string>('')
  const [isCodeSent, setCodeSent] = useState<boolean>(false)
  const [showResendCode, setVisibilityResendCode] = useState<boolean>(false)
  const [isButtonActive, setButtonActive] = useState<boolean>(false)
  const [isButtonLoading, setButtonLoading] = useState<boolean>(false)
  const [apiErrors, setApiErrors] = useState<string[]>([])
  const inputPhoneField = useRef<InputRef>(null)

  const cookies = new Cookies()

  const [phoneNumberFormats, , isLoading] = useApiResponse<LocationPhoneNumberFormats>(
    process.env.NEXT_PUBLIC_API_GET_LOCATION_PHONE_NUMBERS_FORMATS!,
  )
  const { Option } = Select

  const handleOnChangePrefix = (value: string) => {
    setRegion(value)
  }

  const handleOnPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value.replace(/[^\d]/g, ''))
  }
  const handleOnCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value)
  }

  const handleOnSelect = () => {
    if (inputPhoneField !== null) {
      inputPhoneField.current!.focus()
    }
  }

  const handleFilterOption = (input: string, option: any): boolean => {
    return option.label.indexOf(input) !== -1
  }

  const getFullNumber = () => {
    return `+${phoneNumberFormats?.availableRegions[region].regionPrefix}${phone}`.replace(/[\s-]/g, '')
  }

  const checkButtonActive = () => {
    let status = false
    if (!isLoading && !isButtonLoading) {
      status = !!code.length
      if (!isCodeSent) {
        status = !!phone.length
        if (phoneNumberFormats?.availableRegions[region].possibleLength.length) {
          status = false
          if (
            phoneNumberFormats?.availableRegions[region].possibleLength.includes(phone.replace(/[\s-]/g, '').length)
          ) {
            status = true
          }
        } else if (phoneNumberFormats?.availableRegions[region].example) {
          status = false
          if (
            phoneNumberFormats?.availableRegions[region].example.replace(/[\s-]/g, '').length === getFullNumber().length
          ) {
            status = true
          }
        }
      }
    }

    setButtonActive(status)
  }

  const handleSubmitPhone = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isButtonActive || showResendCode) {
      setButtonLoading(true)
      setVisibilityResendCode(false)
      setApiErrors([])

      const jwtToken = await getJwtToken()

      const response = await doRequest({
        endpoint: process.env.NEXT_PUBLIC_API_POST_SMS_VERIFICATION!,
        data: { phone: getFullNumber() },
        params: {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        },
      })

      setButtonLoading(false)
      if (response?._cc_errors?.length) {
        setApiErrors(
          response._cc_errors.map((error) => {
            return typeof error === 'string' ? error : (error.statusCode ? `[${error.statusCode}] ` : '') + error.text
          }),
        )
      } else {
        setCodeSent(true)
        setButtonActive(false)
      }
      if (isCodeSent || !response._cc_errors.length) {
        setTimeout(() => {
          setVisibilityResendCode(true)
        }, 30000)
      }
    }
  }

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isButtonActive && isCodeSent && code) {
      setButtonLoading(true)
      setVisibilityResendCode(false)
      setApiErrors([])
      const response = await doRequest<TokenApiResponse, TokenApiResponse>({
        endpoint: process.env.NEXT_PUBLIC_API_POST_GET_TOKEN!,
        data: {
          phone: getFullNumber(),
          code,
        },
      })

      setButtonLoading(false)
      if (response?._cc_errors?.length) {
        setApiErrors(
          response._cc_errors.map((error) => {
            return typeof error === 'string' ? error : (error.statusCode ? `[${error.statusCode}] ` : '') + error.text
          }),
        )
      }

      if (!response._cc_errors.length && response.data) {
        cookies.set('cc_user', response.data.data, { path: '/' })
        if (onSuccess) {
          onSuccess()
        } else {
          window.location.reload()
        }
      } else if (response._cc_errors.length) {
        cookies.remove('cc_user')
      }

      if (isCodeSent || !response._cc_errors.length) {
        setTimeout(() => {
          setVisibilityResendCode(true)
        }, 30000)
      }
    }
  }

  const getJwtToken = async () => {
    const loadWasm = () =>
      new Promise((resolve) => {
        // @ts-ignore
        const go = new window.global.Go() // Defined in wasm_exec.js
        const WASM_URL = '/js/generate_jwt.wasm'
        if ('instantiateStreaming' in WebAssembly) {
          WebAssembly.instantiateStreaming(fetch(WASM_URL), go.importObject).then((obj) => {
            go.run(obj.instance)
            resolve(true)
          })
        } else {
          fetch(WASM_URL)
            .then((resp) => resp.arrayBuffer())
            .then((bytes) =>
              WebAssembly.instantiate(bytes, go.importObject).then((obj) => {
                go.run(obj.instance)
                resolve(true)
              }),
            )
        }
      })
    await loadWasm()
    // @ts-ignore
    return generateJwt()
  }

  useEffect(() => {
    if (phoneNumberFormats?.detectRegionCode && !region) {
      setRegion(phoneNumberFormats.detectRegionCode)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, flattenInput(phoneNumberFormats))

  useEffect(() => {
    checkButtonActive()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone, region, code])

  return (
    <form className={styles.loginBlock__form}>
      <Script src={'/js/wasm_exec.js'}></Script>
      <div className={styles.loginBlock__body}>
        <div className={clsx(styles.mb_1, 'align-center')}>
          {isCodeSent ? `Enter the code we just texted you` : 'Enter phone number'}
        </div>
        <div className={clsx('d-flex', styles.loginBlock__fields)}>
          {!isCodeSent ? (
            <>
              {isLoading ? (
                <div className='align-center'>
                  <Loader width='32px' height='32px' />
                </div>
              ) : (
                <>
                  {phoneNumberFormats?.availableRegions && (
                    <Select
                      showSearch
                      onChange={handleOnChangePrefix}
                      onSelect={handleOnSelect}
                      value={region}
                      optionLabelProp='label'
                      dropdownMatchSelectWidth={false}
                      className={styles.loginBlock__fields_select}
                      filterOption={handleFilterOption}
                    >
                      {Object.keys(phoneNumberFormats.availableRegions).map((countryCode) => (
                        <Option
                          value={countryCode}
                          key={countryCode}
                          label={`+${phoneNumberFormats.availableRegions[countryCode].regionPrefix}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            className={styles.loginBlock__flag}
                            src={`https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/4x3/${countryCode.toLowerCase()}.svg`}
                            alt={`[${countryCode}]`}
                          />{' '}
                          [{countryCode}] +{phoneNumberFormats.availableRegions[countryCode].regionPrefix}
                        </Option>
                      ))}
                    </Select>
                  )}
                </>
              )}
              <Input
                placeholder='Enter your phone'
                value={phone}
                className={styles.loginBlock__fields_input}
                onChange={handleOnPhoneChange}
                onPressEnter={handleSubmitPhone}
                ref={inputPhoneField}
              />
            </>
          ) : (
            <Input
              placeholder='Enter the code'
              value={code}
              onChange={handleOnCodeChange}
              onPressEnter={handleSubmitCode}
              autoFocus
            />
          )}
        </div>
      </div>
      <div className={styles.loginBlock__footer}>
        <div className='d-flex'>
          <Button
            type='primary'
            disabled={!isButtonActive}
            onClick={isCodeSent ? handleSubmitCode : handleSubmitPhone}
            loading={isButtonLoading}
            className={styles.loginBlock__button}
          >
            Send
          </Button>
          {isCodeSent && showResendCode ? (
            <a
              href='@/components/auth/components/PhoneAuth#'
              title='Send code one more time'
              onClick={handleSubmitPhone}
            >
              Send code one more time
            </a>
          ) : (
            ''
          )}
        </div>
        {apiErrors.length ? (
          <div className={clsx(styles.loginBlock__errors, styles.mt_1)}>{apiErrors.join(', ')}</div>
        ) : (
          ''
        )}
      </div>
      <AntdDefaultStyles />
    </form>
  )
}

PhoneAuth.propTypes = {
  onSuccess: PropTypes.func,
}

export default PhoneAuth
