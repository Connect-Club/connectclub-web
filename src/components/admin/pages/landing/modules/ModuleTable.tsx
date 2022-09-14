import React from 'react'
import { Button, Form, Input } from 'antd'
import clsx from 'clsx'

import global_styles from '@/components/admin/css/admin.module.css'
import Colorpicker from '@/components/admin/pages/landing/Colorpicker'
import styles from '@/components/admin/pages/landing/landing.module.css'
import { Delete } from '@/lib/svg'
import { FC } from '@/model/commonModel'
import { ModuleProps, Table } from '@/model/landingModel'

const ModuleTable: FC<ModuleProps> = () => {
  const initialTable: Table = {
    title: '',
    description: '',
    color: { r: 102, g: 177, b: 246, a: 1 },
    rows: [],
  }

  return (
    <>
      <div className={styles.modal_settings}>
        <fieldset>
          <legend>Tables</legend>
          <Form.List name={['params', 'tables']}>
            {(tables, { add, remove }) => (
              <>
                <div>
                  {/*@ts-ignore*/}
                  {tables.map(({ key, name, ...restField }) => (
                    <div key={key} className={clsx(global_styles['mb-1'], 'relative')}>
                      <Form.Item {...restField} name={[name, 'title']} label='Title' preserve={true}>
                        <Input />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'description']} label='Description' preserve={true}>
                        <Input />
                      </Form.Item>
                      <Form.Item label='Color' name={[name, 'color']}>
                        <Colorpicker popup />
                      </Form.Item>
                      <Form.Item label='Rows'>
                        <Form.List name={[name, 'rows']}>
                          {(rows, action) => (
                            <>
                              {rows.map((row) => (
                                <div
                                  key={row.key}
                                  className={clsx(global_styles['mb-1'], 'd-flex align-items-center gutter-03')}
                                >
                                  <Form.Item
                                    {...row}
                                    key={row.fieldKey}
                                    preserve={true}
                                    className={'m-0'}
                                    style={{ flex: '1' }}
                                  >
                                    <Input />
                                  </Form.Item>
                                  <a title={'Delete row'} onClick={() => action.remove(row.name)}>
                                    <Delete color={'#f00'} />
                                  </a>
                                </div>
                              ))}
                              <Button onClick={() => action.add()} type={'primary'}>
                                + Add row
                              </Button>
                            </>
                          )}
                        </Form.List>
                      </Form.Item>
                      <Button onClick={() => remove(name)} danger style={{ position: 'absolute', right: 0, bottom: 0 }}>
                        Remove table
                      </Button>
                    </div>
                  ))}
                </div>
                <Button onClick={() => add(initialTable)} type={'primary'}>
                  + Add table
                </Button>
              </>
            )}
          </Form.List>
        </fieldset>
      </div>
      <div className={styles.modal_appearance}>
        <Form.Item label='Title background' name={['params', 'appearance', 'title_background']}>
          <Colorpicker popup />
        </Form.Item>
        <Form.Item label='Title color' name={['params', 'appearance', 'title_color']}>
          <Colorpicker popup />
        </Form.Item>
        <Form.Item label='Text' name={['params', 'appearance', 'text']}>
          <Colorpicker popup />
        </Form.Item>
      </div>
    </>
  )
}

export default ModuleTable
