import React from 'react'
import { Button, Checkbox, Form, Input, Select } from 'antd'
import clsx from 'clsx'

import global_styles from '@/components/admin/css/admin.module.css'
import Colorpicker from '@/components/admin/pages/landing/Colorpicker'
import styles from '@/components/admin/pages/landing/landing.module.css'
import WysiwygEditor from '@/components/admin/pages/landing/WysiwygEditor'
import { Delete } from '@/lib/svg'
import { FC } from '@/model/commonModel'
import { FormAdditionalData, FormField, ModuleProps } from '@/model/landingModel'

const ModuleForm: FC<ModuleProps> = () => {
  const fieldIsRequired = {
    required: true,
    message: 'Field is required!',
  }

  const initialData: FormAdditionalData = {
    name: '',
    value: '',
  }

  const initialField: FormField = {
    type: 'input:text',
    code: '',
    required: false,
    show_name: true,
    name: '',
    placeholder: '',
  }

  return (
    <>
      <div className={styles.modal_settings}>
        <fieldset>
          <legend>Fields</legend>
          <Form.Item wrapperCol={{ span: 24 }}>
            <Form.List name={['params', 'fields']}>
              {(fields, fieldAction) => (
                <>
                  <div className={styles.speakers}>
                    {/*@ts-ignore*/}
                    {fields.map(({ key, name, ...restField }) => (
                      <div key={key} className={clsx(styles.speaker, styles.speaker_colored, global_styles['mb-1'])}>
                        <a title={'Delete'} className={styles.speaker_delete} onClick={() => fieldAction.remove(name)}>
                          <Delete color={'#f00'} />
                        </a>
                        <Form.Item
                          label='Field type'
                          {...restField}
                          name={[name, 'type']}
                          preserve={true}
                          wrapperCol={{ span: 16 }}
                          rules={[fieldIsRequired]}
                        >
                          <Select>
                            <Select.Option value={'input:text'}>Input text</Select.Option>
                            <Select.Option value={'email'}>Email</Select.Option>
                          </Select>
                        </Form.Item>
                        <Form.Item
                          label='Symbolic code'
                          {...restField}
                          name={[name, 'code']}
                          preserve={true}
                          extra={'This field needs to identify field with its value'}
                          rules={[fieldIsRequired]}
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          label='Required'
                          {...restField}
                          name={[name, 'required']}
                          valuePropName='checked'
                          preserve={true}
                        >
                          <Checkbox />
                        </Form.Item>
                        <Form.Item
                          label='Show field name'
                          {...restField}
                          name={[name, 'show_name']}
                          valuePropName='checked'
                          preserve={true}
                        >
                          <Checkbox />
                        </Form.Item>
                        <Form.Item
                          noStyle
                          shouldUpdate={(prevValues, currentValues) =>
                            !prevValues.params.fields[name] ||
                            !currentValues.params.fields[name] ||
                            (prevValues.params.fields[name] &&
                              currentValues.params.fields[name] &&
                              prevValues.params.fields[name].show_name !== currentValues.params.fields[name].show_name)
                          }
                        >
                          {({ getFieldValue }) =>
                            getFieldValue(['params', 'fields', name]) &&
                            getFieldValue(['params', 'fields', name, 'show_name']) && (
                              <Form.Item {...restField} name={[name, 'name']} label='Name' preserve={true}>
                                <Input />
                              </Form.Item>
                            )
                          }
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'placeholder']}
                          label='Placeholder'
                          preserve={true}
                          extra={'Text inside the field'}
                        >
                          <Input />
                        </Form.Item>
                      </div>
                    ))}
                  </div>
                  <Button onClick={() => fieldAction.add(initialField)} type={'primary'}>
                    + Add field
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>
        </fieldset>
        <fieldset>
          <legend>Button settings</legend>
          <Form.Item name={['params', 'button_name']} label='Button name' rules={[fieldIsRequired]}>
            <Input />
          </Form.Item>
          <Form.Item
            label='Javascript event on successfull submit'
            name={['params', 'onsuccess']}
            extra={`DO NOT specify <script> tags inside!`}
          >
            <Input.TextArea />
          </Form.Item>
        </fieldset>
        <fieldset>
          <legend>Additional data</legend>
          <Form.Item>
            <Form.List name={['params', 'data']}>
              {(data, action) => (
                <>
                  {/*@ts-ignore*/}
                  {data.map(({ key, name, ...restField }) => (
                    <div key={key} className={clsx(global_styles['mb-1'], 'd-flex align-items-center gutter-03')}>
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        preserve={true}
                        style={{ flex: '1' }}
                        className={'m-0'}
                        rules={[fieldIsRequired]}
                      >
                        <Input placeholder={'name'} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'value']}
                        preserve={true}
                        style={{ flex: '1' }}
                        className={'m-0'}
                        rules={[fieldIsRequired]}
                      >
                        <Input placeholder={'value'} />
                      </Form.Item>
                      <a title={'Delete'} onClick={() => action.remove(name)}>
                        <Delete color={'#f00'} />
                      </a>
                    </div>
                  ))}
                  <Button onClick={() => action.add(initialData)} type={'primary'}>
                    + Add additional data
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>
        </fieldset>
        <fieldset>
          <legend>Additional settings</legend>
          <Form.Item label='Text before the form' name={['params', 'text_before']}>
            <WysiwygEditor />
          </Form.Item>
          <Form.Item label='Text after the form' name={['params', 'text_after']}>
            <WysiwygEditor />
          </Form.Item>
          <Form.Item label='Text after the successful submission' name={['params', 'success_text']}>
            <WysiwygEditor />
          </Form.Item>
        </fieldset>
      </div>
      <div className={styles.modal_appearance}>
        <Form.Item label='Button background' name={['params', 'appearance', 'button_background']}>
          <Colorpicker popup />
        </Form.Item>
        <Form.Item label='Button background on hover' name={['params', 'appearance', 'button_background_hover']}>
          <Colorpicker popup />
        </Form.Item>
        <Form.Item label='Button text' name={['params', 'appearance', 'button_text']}>
          <Colorpicker popup />
        </Form.Item>
        <Form.Item label='Button border color' name={['params', 'appearance', 'button_border_color']}>
          <Colorpicker popup />
        </Form.Item>
        <Form.Item
          label='Button border radius'
          name={['params', 'appearance', 'button_border_radius']}
          extra={'Specify only digits'}
        >
          <Input type={'number'} />
        </Form.Item>
      </div>
    </>
  )
}

export default ModuleForm
