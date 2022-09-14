import React, { useCallback, useMemo } from 'react'
import { Checkbox } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'

import global_styles from '@/components/admin/css/admin.module.css'
import styles from '@/components/admin/Map/map.module.css'
import { FC } from '@/model/commonModel'

const HideSystemObjects: FC<unknown> = () => {
  const stylesClassName = 'temp-system-styles'
  const addStyles = () => {
    const node = document.createElement('div')
    node.insertAdjacentHTML(
      'beforeend',
      `
                <style>
                    .${styles.rnd_inactive} { visibility: hidden }
                </style>
            `,
    )
    node.className = stylesClassName
    document.body.appendChild(node)
  }
  const removeStyles = () => {
    const stylesBlock = document.querySelector(`.${stylesClassName}`)
    stylesBlock && document.body.removeChild(stylesBlock)
  }

  const onChange = useCallback((e: CheckboxChangeEvent) => {
    const isChecked = e.target.checked
    if (isChecked) {
      addStyles()
    } else {
      removeStyles()
    }
  }, [])

  return useMemo(
    () => (
      <Checkbox onChange={onChange} className={global_styles['ml-1']}>
        Hide system objects
      </Checkbox>
    ),
    [onChange],
  )
}

export default HideSystemObjects
