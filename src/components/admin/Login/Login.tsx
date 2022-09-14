import React, { useState } from 'react'
import clsx from 'clsx'

import global_styles from '@/components/admin/css/admin.module.css'
import PhoneAuth from '@/components/auth/components/PhoneAuth'
import WalletAuth from '@/components/auth/components/WalletAuth'
import styles from '@/components/auth/style/auth.module.css'
import { FC } from '@/model/commonModel'

const Login: FC = () => {
  const [showPhone, setShowPhone] = useState(false)

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setShowPhone(true)
  }
  return (
    <div className={styles.loginBlock_wrapper}>
      <div className={styles.loginBlock__header}>
        <h4 className={global_styles.h4} style={{ fontSize: '1.6rem', marginBottom: '14px' }}>
          Admin panel
        </h4>
      </div>

      <WalletAuth className={global_styles.mb2}>
        <button className={clsx(global_styles.button, 'w100')} title={'Connect using crypto wallet'}>
          Use wallet to enter
        </button>
      </WalletAuth>

      {!showPhone ? (
        <a onClick={onClick} className={'align-center'} href={'#'} title={'Enter by phone'}>
          Enter by phone
        </a>
      ) : (
        <PhoneAuth />
      )}
    </div>
  )
}

export default Login
