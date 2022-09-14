import React, { useEffect } from 'react'
import { useRouter } from 'next/router'

import global_styles from '@/components/admin/css/admin.module.css'
import { Loader } from '@/lib/svg'
import { FC } from '@/model/commonModel'

const Dashboard: FC = () => {
  const router = useRouter()
  useEffect(() => {
    router.push('/admin/users')
  }, [router])
  return (
    <>
      <div className={global_styles.block}>
        <Loader />
      </div>
    </>
  )
}

export default Dashboard
