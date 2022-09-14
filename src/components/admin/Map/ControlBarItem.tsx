import React from 'react'
import { Form, Input } from 'antd'
import PropTypes from 'prop-types'

import { getDefaultMapObjects } from '@/components/admin/Map/helper'
import { convertRealCoordinatesToMap, convertRealSizesToMap } from '@/components/admin/Map/map.converter'
import styles from '@/components/admin/Map/map.module.css'
import { FC } from '@/model/commonModel'
import type { MapImageObjectSizes, MapObjectOnMapType, PanelItem } from '@/model/mapModel'

type EditableFieldType = {
  fieldKey: string
  value?: string
  panelItem: PanelItem
  onChange?: (value: string) => void
}

type ControlBarItemType = {
  obj: MapObjectOnMapType
  round: boolean
  realImageSize: MapImageObjectSizes
  displayedImageSize: MapImageObjectSizes
}

const ControlBarItem: FC<ControlBarItemType> = ({ obj, round, realImageSize, displayedImageSize }) => {
  const defaultMapObjects = getDefaultMapObjects()
  const defaultObject = defaultMapObjects[obj.type]

  const EditableField = ({ fieldKey, value, panelItem, onChange }: EditableFieldType) => {
    const triggerOnChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const form = obj.formRef.current
      const value = e.target.value
      if (fieldKey === 'x' || fieldKey === 'y') {
        obj.ref.current.updatePosition(
          convertRealCoordinatesToMap(
            fieldKey === 'x' ? value : form.getFieldValue('x'),
            fieldKey === 'y' ? value : form.getFieldValue('y'),
            obj,
            realImageSize,
            displayedImageSize,
          ),
        )
      } else if (fieldKey === 'width' || fieldKey === 'height') {
        let width = fieldKey === 'width' ? value : form.getFieldValue('width')
        let height = fieldKey === 'height' ? value : form.getFieldValue('height')
        if (round) {
          width = height = value
          obj.formRef.current.setFieldsValue({ width, height })
        }
        obj.ref.current.updateSize(convertRealSizesToMap(width, height, obj, realImageSize, displayedImageSize))
      }
      onChange?.(value)
    }
    return (
      <>
        {panelItem.type === 'input' ? (
          <Input readOnly={panelItem.readonly} onChange={triggerOnChange} value={value} />
        ) : panelItem.type === 'textarea' ? (
          <Input.TextArea
            readOnly={panelItem.readonly}
            onChange={triggerOnChange}
            value={value}
            style={{ height: '200px' }}
          />
        ) : panelItem.type === 'link' ? (
          <a href={value} target={'_blank'} rel={'noreferrer'}>
            Original image
          </a>
        ) : (
          <input
            type='number'
            className={styles.antd_input}
            readOnly={panelItem.readonly}
            onChange={triggerOnChange}
            value={value}
          />
        )}
      </>
    )
  }

  return (
    <Form
      ref={obj.formRef}
      labelCol={{
        span: 7,
      }}
      wrapperCol={{
        span: 17,
      }}
      initialValues={obj}
    >
      {defaultObject.panel.map((panelItem) => (
        <div key={panelItem.key}>
          <Form.Item
            label={panelItem.name}
            name={panelItem.key}
            labelAlign='left'
            validateTrigger={['onChange', 'onBlur']}
            rules={[
              {
                required: !panelItem.partial && !panelItem.readonly,
                message: 'Field is required',
              },
            ]}
          >
            <EditableField fieldKey={panelItem.key} panelItem={panelItem} />
          </Form.Item>
        </div>
      ))}
    </Form>
  )
}

ControlBarItem.propTypes = {
  obj: PropTypes.object.isRequired,
  realImageSize: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number,
  }).isRequired,
  round: PropTypes.bool.isRequired,
  displayedImageSize: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number,
  }).isRequired,
}

export default ControlBarItem
