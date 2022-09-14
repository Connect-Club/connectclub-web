import React, { CSSProperties } from 'react'
import moment from 'moment-timezone'
import Image from 'next/image'

import { isDevelopment } from '@/lib/utils'
import { EventParticipant } from '@/model/eventModel'
import { CleanUserDataType, SearchUser, User, UsersSearchReturn } from '@/model/usersModel'
import noImage from '@/public/img/svg/no-image.svg'

type DataType = {
  avatar: User['avatar']
  name?: User['name']
  surname?: User['surname']
  styles?: CSSProperties
}

export const getAvatar = (data: DataType, size: number, alt = '', styles = {}): JSX.Element => {
  const fullName = getFullName(data)
  const replaceSize = (size * 4).toString()

  return (
    <div className='avatar-wrapper' style={{ ...styles, ...{ width: size, height: size, padding: 0 } }}>
      {data?.avatar ? (
        <div
          style={{
            backgroundImage: `url(${data.avatar.replace(':WIDTH', replaceSize).replace(':HEIGHT', replaceSize)})`,
          }}
        />
      ) : (
        <Image src={noImage} width={size} height={size} alt={alt || fullName} quality={100} />
      )}
    </div>
  )
}

export const getUrlWithSizes = (url: string, width: number, height: number): string => {
  return url.replace(':WIDTH', width.toString()).replace(':HEIGHT', height.toString())
}

export const getFullName = (user: Omit<DataType, 'avatar'>, noName = '<No name>'): string => {
  return (!user.name && !user.surname ? noName : user.name + ' ' + user.surname).trim()
}

export const getUsersParams = (limit = 20, filter = {}, lastId = 0, orderBy = 'id:DESC'): string => {
  const cleanedFilter = Object.entries(filter).reduce(
    // @ts-ignore
    (a, [k, v]) => (v == null ? a : ((a[k] = v), a)),
    {},
  )
  return (
    `?limit=${limit}&lastValue=${lastId}` +
    (Object.keys(cleanedFilter).length > 0 ? `&filter=${JSON.stringify(cleanedFilter)}` : '') +
    '&orderBy=' +
    orderBy
  )
}

export const onlyNumbers = (e: React.ChangeEvent<HTMLInputElement>): boolean => {
  e.preventDefault()
  const { value } = e.target
  const reg = /^-?\d*(\.\d*)?$/
  return (!isNaN(Number(value)) && reg.test(value)) || value === ''
}

type AnyUser = SearchUser | User | EventParticipant

export const cleanUserData = (user: AnyUser): CleanUserDataType => {
  const allowed: CleanUserDataType = {
    about: '',
    avatar: null,
    createdAt: 0,
    displayName: '',
    id: '0',
    isDeleted: false,
    name: '',
    online: false,
    surname: '',
    username: '',
  }

  return Object.keys(user)
    .filter((key) => key in allowed)
    .sort()
    .reduce((obj, key) => {
      return {
        ...obj,
        // @ts-ignore
        [key]: user[key],
      }
    }, {} as CleanUserDataType)
}

export const prepareInitialUsersForSearchField = (users: AnyUser[]): UsersSearchReturn[] => {
  return users.map((user) => {
    const cleanUser = JSON.stringify(cleanUserData(user))
    return {
      key: cleanUser,
      label: `${user.displayName} (#${user.id})`,
      value: cleanUser,
    }
  })
}

export const convertTwoDigits = (digit: number): string => {
  return (digit < 10 ? '0' : '') + digit
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getClientIp = (req: any) => {
  return (req.headers['x-forwarded-for'] || '').split(',').shift().trim() || req.socket.remoteAddress
}

export const shareClubLink = (clubId: string, clubSlug: string, utmCampaign = ''): string => {
  const af_r = encodeURIComponent(
    `https://${isDevelopment ? `stage.` : ``}connect.club/club/${clubSlug}${
      utmCampaign ? `?utm_campaign=${utmCampaign}` : ``
    }`,
  )
  return (
    `https://app.connect.club/W0Im/${isDevelopment ? '3d6351c7' : 'ecff227c'}?deep_link_value=clubId_${clubId}` +
    `${utmCampaign ? `&deep_link_sub1=~${utmCampaign}` : ``}` +
    `&af_r=${af_r}`
  )
}

export const shareEventLink = (eventId: string, utmCampaign = '', clubId = '', clubSlug = ''): string => {
  const af_r = encodeURIComponent(
    `https://${isDevelopment ? `stage.` : ``}connect.club/club/${clubSlug}?id=${eventId}${
      utmCampaign ? `&utm_campaign=${utmCampaign}` : ``
    }`,
  )
  return (
    `https://app.connect.club/W0Im/${isDevelopment ? '3d6351c7' : 'ecff227c'}?deep_link_value=${
      clubId ? `clubId_${clubId}_` : ``
    }eventId_${eventId}` +
    `${utmCampaign ? `&deep_link_sub1=~${utmCampaign}` : ``}` +
    `${clubId && clubSlug ? `&af_r=${af_r}` : ``}`
  )
}

export const getHumanDate = (date: number): string => {
  const dateObj = new Date(date * 1000)
  const hours = convertTwoDigits(dateObj.getHours())
  const minutes = convertTwoDigits(dateObj.getMinutes())
  return `${moment(date * 1000)
    .tz('Europe/Moscow')
    .format('DD.MM.YYYY')} ${hours}:${minutes}`
}

export const getImageSize = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((res, rej) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event: ProgressEvent) => {
      const _loadedImageUrl = (event.target as FileReader).result
      const image = document.createElement('img')
      if (typeof _loadedImageUrl === 'string') {
        image.src = _loadedImageUrl
      } else {
        rej()
      }
      image.onload = () => {
        const { width, height } = image
        res({ width, height })
      }
      image.onerror = image.onabort = rej
    }
    reader.onerror = reader.onabort = rej
  })
}

export const truncateWalletAddress = (address: string) => {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}
