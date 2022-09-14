import React from 'react'
import { LeftCircleOutlined } from '@ant-design/icons'
import Link from 'next/link'
import PropTypes from 'prop-types'

import global_styles from '@/components/admin/css/admin.module.css'
import { FC } from '@/model/commonModel'

type Props = {
  url: string
  children: React.ReactNode
}
const BackLink: FC<Props> = ({ url, children }: Props) => {
  return (
    <span className={global_styles.back}>
      <Link href={url} shallow>
        <a>
          <LeftCircleOutlined className={global_styles.back__icon} />
          {children}
        </a>
      </Link>
    </span>
  )
}
BackLink.propTypes = {
  url: PropTypes.string,
  children: PropTypes.node,
}

export default BackLink
