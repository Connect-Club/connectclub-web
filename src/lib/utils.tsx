import React from 'react'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import { NextRouter } from 'next/router'
import platform from 'platform-detect'

declare const window: Window & {
  opera?: string
}

export const isDevelopment =
  (process && process.env.NODE_ENV === 'development') || parseInt(process.env.NEXT_PUBLIC_ROBOTS_NO_INDEX!) > 0

export const setWindowHistoryState = (url: string): void => {
  window.history.replaceState(
    {
      ...window.history.state,
      as: url,
      url: url,
    },
    '',
    url,
  )
}

export const getHrefUTM = (router?: NextRouter): Record<string, string> => {
  let utm: Record<string, string> = {}
  if (router?.query) {
    utm = Object.keys(router.query).reduce((accum, curVal) => {
      if (curVal.includes('utm_')) {
        accum[curVal] = router.query[curVal] as string
      }
      return accum
    }, {} as Record<string, string>)
  } else {
    const search = window.location.search
    if (search !== '') {
      const params = new URLSearchParams(search.substring(1))
      for (const p of Array.from(params.entries())) {
        if (p[0].includes('utm_')) {
          utm[p[0]] = p[1]
        }
      }
    }
  }
  if (!utm['utm_source'] && document.referrer) {
    utm['utm_source'] = new URL(document.referrer).hostname
  }
  if (!utm['utm_campaign']) {
    utm['utm_campaign'] = `without_utm${utm['utm_source'] ? `[${utm['utm_source']}]` : ``}`
  }

  return utm
}

export const isMobileDevice = (): boolean => {
  try {
    document.createEvent('TouchEvent')
    return true
  } catch (e) {
    return false
  }
}

export const getMobileOS = (): string => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera
  return platform.android
    ? 'android'
    : platform.ios
    ? 'ios'
    : platform.linux
    ? 'linux'
    : platform.linuxBased
    ? 'linuxBased'
    : platform.macos
    ? 'macos'
    : platform.chromeos
    ? 'chromeos'
    : platform.tizen
    ? 'tizen'
    : platform.windows
    ? 'windows'
    : userAgent
    ? userAgent
    : 'unknown'
}

export const getCellValueWithPercentage = (
  value: number,
  total: number,
  subtotal?: number,
  checkIntegrity: number[] = [],
  integrityText = '',
): JSX.Element => {
  const isDescSorted = (arr: number[]) => arr.every((v, i, a) => !i || a[i - 1] >= v)
  return (
    <>
      {checkIntegrity.length > 0 && !isDescSorted([...checkIntegrity, value]) && (
        <Tooltip title={integrityText || 'Integrity check is false'}>
          <ExclamationCircleOutlined
            style={{
              color: '#faad14',
              fontSize: '22px',
              marginRight: '10px',
            }}
          />
        </Tooltip>
      )}
      {value} {` `}
      <span className={'cell-percentage'} style={{ fontSize: '0.8rem', color: '#bbb' }}>
        ({total ? Math.round((value * 100) / total) : 0}%
        {subtotal !== undefined ? ' / ' + (subtotal ? Math.round((value * 100) / subtotal) : 0) + '%' : ''})
      </span>
    </>
  )
}
