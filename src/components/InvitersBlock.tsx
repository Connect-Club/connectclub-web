import clsx from 'clsx'
import Image from 'next/image'

import styles from '@/css/inviters.module.css'
import { FC } from '@/model/commonModel'
import { PopularInvitersType } from '@/model/inviterModel'
import noImage from '@/public/img/svg/no-image.svg'

type InvitersType = {
  inviters: PopularInvitersType[]
  className?: string
}

const InvitersBlock: FC<InvitersType> = ({ inviters, className = undefined }) => {
  if (inviters) {
    const invitersKeys = Object.keys(inviters)
    if (invitersKeys.length > 0) {
      return (
        <div className={clsx(styles.table, className)}>
          <div className={clsx(styles.th, styles.inviter_id)}>#</div>
          <div className={clsx(styles.th, styles.inviter_name)}>inviter’s name</div>
          <div className={clsx(styles.th, styles.inviter_counter)}>users invited</div>
          {invitersKeys.map((key) => (
            <InviterItem key={key} inviter={inviters[Number(key)]} number={parseInt(key) + 1} />
          ))}
        </div>
      )
    }
  }
  return <></>
}

type InviterItemTypes = {
  inviter: PopularInvitersType
  number: number
}

const InviterItem = ({ inviter, number }: InviterItemTypes) => {
  const size = '96'
  const fullName: string = (
    !inviter.name && !inviter.surname ? '<No name>' : inviter.name + ' ' + inviter.surname
  ).trim()
  return (
    <>
      <div className={clsx(styles.inviter_id)}>
        <div>{number}.</div>
      </div>
      <div>
        <div className={styles.tr}>
          <div className={styles.inviter_img}>
            {inviter.avatar ? (
              <div
                style={{
                  backgroundImage: `url(${inviter.avatar.replace(':WIDTH', size).replace(':HEIGHT', size)})`,
                }}
              />
            ) : (
              <Image src={noImage} width={'3.2rem'} height={'3.2rem'} alt={fullName} quality={100} />
            )}
          </div>
          <div className={clsx('d-flex', styles.inviter_name_wrapper)}>
            <div className={styles.inviter_name}>{fullName}</div>
            <div className={styles.inviter_username}>{inviter.username ? '@' + inviter.username : ''}</div>
          </div>
        </div>
      </div>
      <div className={clsx(styles.td, styles.inviter_counter)}>
        <div>{inviter.count}</div>
      </div>
    </>
  )
}

export default InvitersBlock
