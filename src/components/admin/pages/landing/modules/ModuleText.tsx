import React from 'react'
import { Checkbox, Form, Select } from 'antd'

import Colorpicker from '@/components/admin/pages/landing/Colorpicker'
import styles from '@/components/admin/pages/landing/landing.module.css'
import WysiwygEditor from '@/components/admin/pages/landing/WysiwygEditor'
import { FC } from '@/model/commonModel'
import { ModuleProps } from '@/model/landingModel'

const ModuleText: FC<ModuleProps> = () => {
  return (
    <>
      <div className={styles.modal_settings}>
        <Form.Item label='Border' name={['params', 'border']} valuePropName='checked'>
          <Checkbox />
        </Form.Item>
        <Form.Item label='Columns' name={['params', 'columns']}>
          <Select>
            <Select.Option value={1}>1</Select.Option>
            <Select.Option value={2}>2</Select.Option>
            <Select.Option value={3}>3</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.params.columns !== currentValues.params.columns}
        >
          {({ getFieldValue }) =>
            getFieldValue(['params', 'columns']) > 1 && (
              <Form.Item name={['params', 'columns_justify_content']} label='Justify content'>
                <Select>
                  <Select.Option value={'flex-start'}>Start</Select.Option>
                  <Select.Option value={'flex-end'}>End</Select.Option>
                  <Select.Option value={'center'}>Center</Select.Option>
                  <Select.Option value={'space-around'}>Space around</Select.Option>
                  <Select.Option value={'space-between'}>Space between</Select.Option>
                  <Select.Option value={'space-evenly'}>Space evenly</Select.Option>
                </Select>
              </Form.Item>
            )
          }
        </Form.Item>
        <Form.Item label='Text' name={['params', 'text']}>
          <WysiwygEditor />
        </Form.Item>
      </div>
      <div className={styles.modal_appearance}>
        <Form.Item label='Border color' name={['params', 'appearance', 'border_color']}>
          <Colorpicker />
        </Form.Item>
      </div>
    </>
  )
}

export default ModuleText
