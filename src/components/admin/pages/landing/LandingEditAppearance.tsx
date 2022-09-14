import React from 'react'
import { Form, Input, Select } from 'antd'

import Colorpicker from '@/components/admin/pages/landing/Colorpicker'
import { FC } from '@/model/commonModel'

const LandingEditAppearance: FC<unknown> = () => {
  return (
    <>
      <fieldset>
        <legend>Header image</legend>
        <Form.Item
          label='Width'
          name={['params', 'header', 'width']}
          extra={'Specify pixels (500px or 600px) or percentage (30% or 100%)'}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label='Height'
          name={['params', 'header', 'height']}
          extra={'Specify pixels (500px or 600px) or percentage (30% or 100%)'}
        >
          <Input />
        </Form.Item>
        <Form.Item label='Object fit' name={['params', 'header', 'objectFit']}>
          <Select>
            <Select.Option value={'contain'}>Contain</Select.Option>
            <Select.Option value={'cover'}>Cover</Select.Option>
            <Select.Option value={'fill'}>Fill</Select.Option>
            <Select.Option value={'none'}>None</Select.Option>
          </Select>
        </Form.Item>
      </fieldset>
      <fieldset>
        <legend>Colors</legend>
        <Form.Item label='Background' name={['params', 'colors', 'background']}>
          <Colorpicker popup />
        </Form.Item>
        <Form.Item label='Footer background' name={['params', 'colors', 'footer_background']}>
          <Colorpicker popup />
        </Form.Item>
        <Form.Item label='Footer text color' name={['params', 'colors', 'footer_text_color']}>
          <Colorpicker popup />
        </Form.Item>
        <Form.Item label='Titles color' name={['params', 'colors', 'title']}>
          <Colorpicker popup />
        </Form.Item>
        <Form.Item label='Subtitle color' name={['params', 'colors', 'subtitle']}>
          <Colorpicker popup />
        </Form.Item>
        <Form.Item label='Links color' name={['params', 'colors', 'link']}>
          <Colorpicker popup />
        </Form.Item>
        <Form.Item label='Hover links color' name={['params', 'colors', 'link_hover']}>
          <Colorpicker popup />
        </Form.Item>
        <Form.Item label='Text color' name={['params', 'colors', 'text']}>
          <Colorpicker popup />
        </Form.Item>
      </fieldset>
    </>
  )
}

export default LandingEditAppearance
