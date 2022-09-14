import React from 'react'
import { ColorResult, SketchPicker } from 'react-color'
import { Popover } from 'antd'
import PropTypes from 'prop-types'

import { FC } from '@/model/commonModel'

type EditableFieldType = {
  popup?: boolean
  value?: ColorResult['rgb']
  onChange?: (value: ColorResult['rgb']) => void
}

const Colorpicker: FC<EditableFieldType> = ({ popup = false, value, onChange }) => {
  const triggerOnChange = (color: ColorResult) => {
    onChange?.(color.rgb)
  }

  const blockStyles = {
    width: '50px',
    height: '20px',
    display: 'inline-flex',
    border: '2px solid #fff',
    boxShadow: '0 0 0 1px #ccc',
    background: `rgba(${value?.r ?? 0}, ${value?.g ?? 0}, ${value?.b ?? 0}, ${value?.a ?? 100})`,
  } as React.CSSProperties

  const pickerStyles = {
    default: {
      picker: {
        width: '250px',
        padding: '0',
        boxShadow: 'none',
        borderRadius: 0,
      },
    },
  }

  return (
    <>
      {popup ? (
        <Popover
          content={<SketchPicker color={value} onChange={triggerOnChange} styles={pickerStyles} />}
          trigger='click'
        >
          <div style={blockStyles} />
        </Popover>
      ) : (
        <SketchPicker color={value} onChange={triggerOnChange} styles={pickerStyles} />
      )}
    </>
  )
}

Colorpicker.propTypes = {
  popup: PropTypes.bool,
  value: PropTypes.shape({
    r: PropTypes.number,
    g: PropTypes.number,
    b: PropTypes.number,
    a: PropTypes.number,
  }),
  onChange: PropTypes.func,
}

export default Colorpicker
