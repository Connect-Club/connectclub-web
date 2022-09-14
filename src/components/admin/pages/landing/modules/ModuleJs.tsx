import React from 'react'
import { Form, Input, Radio, Select } from 'antd'

import { FC } from '@/model/commonModel'
import { ModuleProps } from '@/model/landingModel'

const ModuleJs: FC<ModuleProps> = () => {
  const fieldIsRequired = {
    required: true,
    message: 'Field is required!',
  }
  return (
    <>
      <Form.Item label='Test 2' name={['params', 'type']}>
        <Radio.Group>
          <Radio.Button value='src'>Link</Radio.Button>
          <Radio.Button value='inline'>Inline script</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) => prevValues.params.type !== currentValues.params.type}
      >
        {({ getFieldValue }) =>
          getFieldValue(['params', 'type']) === 'src' ? (
            <Form.Item name={['params', 'value']} label='Link' rules={[fieldIsRequired]}>
              <Input />
            </Form.Item>
          ) : (
            <Form.Item
              name={['params', 'value']}
              label='Inline script'
              rules={[fieldIsRequired]}
              extra={`DO NOT specify <script> tags inside!`}
            >
              <Input.TextArea />
            </Form.Item>
          )
        }
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) => prevValues.params.type !== currentValues.params.type}
      >
        {({ getFieldValue }) =>
          getFieldValue(['params', 'type']) === 'src' ? (
            <Form.Item label='Strategy of loading' name={['params', 'strategy']}>
              <Select>
                <Select.Option value={'beforeInteractive'}>Load before the page is interactive</Select.Option>
                <Select.Option value={'afterInteractive'}>
                  (recommended): Load immediately after the page becomes interactive
                </Select.Option>
                <Select.Option value={'lazyOnload'}>Load during idle time</Select.Option>
              </Select>
            </Form.Item>
          ) : (
            <Form.Item label='Strategy of loading' name={['params', 'strategy']}>
              <Select>
                <Select.Option value={'afterInteractive'}>
                  (recommended): Load immediately after the page becomes interactive
                </Select.Option>
                <Select.Option value={'lazyOnload'}>Load during idle time</Select.Option>
              </Select>
            </Form.Item>
          )
        }
      </Form.Item>
    </>
  )
}

export default ModuleJs
