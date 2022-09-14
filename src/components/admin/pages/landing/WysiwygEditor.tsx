import React from 'react'
import JoditEditor, { JoditProps } from 'jodit-react'
import PropTypes from 'prop-types'
import Cookies from 'universal-cookie'

import { ApiResponse } from '@/model/apiModel'
import { FC } from '@/model/commonModel'
import { ImageType } from '@/model/imageModel'

type EditableFieldType = {
  value?: string
  onChange?: (value: string) => void
}

const WysiwygEditor: FC<EditableFieldType> = ({ value, onChange }) => {
  const triggerOnBlur = (content: string) => {
    onChange?.(content || '')
  }

  const cookies = new Cookies()

  const config: JoditProps['config'] = {
    readonly: false, // all options from https://xdsoft.net/jodit/doc/,
    removeButtons: ['font', 'classSpan', 'copyformat', 'about'],
    disablePlugins: ['clipboard'],
    filebrowser: {
      ajax: {
        url: process.env.NEXT_PUBLIC_API_POST_UPLOAD_IMAGE,
      },
    },
    uploader: {
      url: process.env.NEXT_PUBLIC_API_POST_UPLOAD_IMAGE,
      headers: {
        Authorization: 'Bearer ' + cookies.get('cc_user')?.token,
      },
      filesVariableName: function () {
        return 'image'
      },
      format: 'json',
      method: 'POST',
      isSuccess: function (response: ApiResponse<ImageType>) {
        return response?.response?.id
      },
      getMessage: function (response: ApiResponse<ImageType>) {
        return response?.errors?.length && response.errors.join('\n')
      },
      process: function (response: ApiResponse<ImageType>) {
        return response?.response
      },
      defaultHandlerSuccess: function (response: ImageType) {
        // @ts-ignore
        const j = this.j || this
        if (response?.resizerUrl) {
          const [tagName, attr] = ['img', 'src']
          const elm = j.createInside.element(tagName)
          elm.setAttribute(attr, `https://storage.googleapis.com/${response.bucket}/${response.originalName}`)
          j.s.insertImage(elm as HTMLImageElement, null)
        }
      },
    },
  }

  return <JoditEditor value={value || ''} config={config} onBlur={triggerOnBlur} />
}

WysiwygEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
}

export default WysiwygEditor
