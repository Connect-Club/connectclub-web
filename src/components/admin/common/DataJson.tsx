import React, { useState } from 'react'
import { CaretRightOutlined } from '@ant-design/icons'

import global_styles from '@/components/admin/css/admin.module.css'
import { FC, Params } from '@/model/commonModel'

type Props = {
  data: Params
  children: React.ReactNode
  className?: string
}

const DataJson: FC<Props> = ({ data, children, className = '' }: Props) => {
  const [isVisible, setVisible] = useState<boolean>(false)
  const toggleHiddenBlock = (e: React.FormEvent) => {
    e.preventDefault()
    setVisible(!isVisible)
  }
  return (
    <div className={className}>
      <a href='#' onClick={toggleHiddenBlock} className='d-flex align-items-center'>
        {isVisible}
        <CaretRightOutlined rotate={isVisible ? 90 : 0} className={global_styles.ease_transition} />
        {` `} {children}
      </a>
      <div className={global_styles['mt-1']} style={{ display: isVisible ? 'grid' : 'none' }}>
        <pre>{JSON.stringify(data, null, 4)}</pre>
      </div>
    </div>
  )
}

export default DataJson
