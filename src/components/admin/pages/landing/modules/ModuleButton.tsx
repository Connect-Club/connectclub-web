import React from 'react'
import { Form, Input, Select } from 'antd'

import Colorpicker from '@/components/admin/pages/landing/Colorpicker'
import styles from '@/components/admin/pages/landing/landing.module.css'
import { FC } from '@/model/commonModel'
import { ModuleProps } from '@/model/landingModel'

const ModuleButton: FC<ModuleProps> = () => {
  return (
    <>
      <div className={styles.modal_settings}>
        <Form.Item label='Button name' name={['params', 'name']}>
          <Input />
        </Form.Item>
        <Form.Item label='URL' name={['params', 'link']}>
          <Input />
        </Form.Item>
        <Form.Item label='Alignment' name={['params', 'alignment']}>
          <Select>
            <Select.Option value={'left'}>Left</Select.Option>
            <Select.Option value={'center'}>Center</Select.Option>
            <Select.Option value={'right'}>Right</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label='Javascript event on click'
          name={['params', 'onclick']}
          extra={`DO NOT specify <script> tags inside!`}
        >
          <Input.TextArea />
        </Form.Item>
      </div>
      <div className={styles.modal_appearance}>
        <Form.Item label='Background' name={['params', 'appearance', 'background']}>
          <Colorpicker popup />
        </Form.Item>
        <Form.Item label='Background on hover' name={['params', 'appearance', 'background_hover']}>
          <Colorpicker popup />
        </Form.Item>
        <Form.Item label='Text' name={['params', 'appearance', 'text']}>
          <Colorpicker popup />
        </Form.Item>
        <Form.Item label='Border color' name={['params', 'appearance', 'border_color']}>
          <Colorpicker popup />
        </Form.Item>
        <Form.Item label='Border radius' name={['params', 'appearance', 'border_radius']} extra={'Specify only digits'}>
          <Input type={'number'} />
        </Form.Item>
      </div>
    </>
  )
}

export default ModuleButton
