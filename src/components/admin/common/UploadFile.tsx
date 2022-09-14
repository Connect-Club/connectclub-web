import React, { useState } from 'react'
import { UploadOutlined } from '@ant-design/icons'
import { Button, Upload, UploadProps } from 'antd'
import { UploadChangeParam } from 'antd/lib/upload'

import popup from '@/components/admin/InfoPopup'
import { apiUploadFile } from '@/lib/Api'
import { Errors } from '@/model/apiModel'
import { FC } from '@/model/commonModel'
import { ImageType } from '@/model/imageModel'

type Props = {
  endpoint: string
  buttonName?: string
  acceptRegexp?: string
  fileName?: string
  onClick?: () => void
  onSuccess?: (responseData: any) => void
  onError?: (errors: Errors) => void
  children?: (({ isLoading }: { isLoading: boolean }) => React.ReactNode) | React.ReactNode
} & Partial<UploadProps>

const UploadFile: FC<Props> = ({
  endpoint,
  buttonName = 'Upload image',
  acceptRegexp = 'image/*',
  fileName = 'image',
  onClick,
  onSuccess,
  onError,
  children,
  ...uploadProps
}) => {
  const [isLoading, setLoading] = useState(false)

  const accept = uploadProps.accept || 'image/*'
  const initialProps: UploadProps = {
    maxCount: 1,
    accept: accept,
    showUploadList: false,
    beforeUpload: (file: File) => {
      /* Upload only images */
      if (!file.type || !new RegExp(acceptRegexp).test(file.type)) {
        popup.error(`${file.name} is not an image file`)
        return Upload.LIST_IGNORE
      }
      /* Return false in order to upload manually */
      return false
    },
    onChange: async (info: UploadChangeParam<any>) => {
      setLoading(true)

      const formData = new FormData()
      formData.append(fileName, info.file as File)

      const response = await apiUploadFile<ImageType>(endpoint, formData)

      setLoading(false)

      if (response._cc_errors.length) {
        if (onError) {
          onError(response._cc_errors)
        } else {
          popup.error('Image not saved, ' + response._cc_errors.join(', '))
        }
      } else if (response?.data?.response?.id) {
        if (onSuccess) {
          onSuccess(response.data.response)
        } else {
          popup.success('Image uploaded!')
        }
      }
    },
  }

  return (
    <Upload {...{ ...initialProps, ...uploadProps }}>
      {children ? (
        typeof children === 'function' ? (
          children({ isLoading })
        ) : (
          children
        )
      ) : (
        <Button icon={<UploadOutlined />} loading={isLoading} onClick={onClick}>
          {buttonName}
        </Button>
      )}
    </Upload>
  )
}

export default UploadFile
