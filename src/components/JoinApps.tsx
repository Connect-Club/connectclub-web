import clsx from 'clsx'
import Image from 'next/image'
import useTranslation from 'next-translate/useTranslation'
import PropTypes from 'prop-types'

import { FC } from '@/model/commonModel'
// import { useEffect, useState } from "react";

type Props = {
  className?: string
}

const JoinApps: FC<Props> = ({ className = undefined }) => {
  const { t } = useTranslation('common')
  // const [isMobile, setIsMobile] = useState<boolean>(false);

  // useEffect(() => {
  //     setIsMobile(isMobileDevice());
  // }, []);

  return (
    <div className={clsx(className, 'd-flex align-items-baseline apps_block')}>
      <div className='app-store-icon'>
        <a href='https://apps.apple.com/app/connect-club-virtual-place/id1500718006' title={t('app-store-alt')}>
          <Image src='/img/svg/app-store.svg' width={168} height={56} alt={t('app-store-alt')} />
        </a>
      </div>
      <a
        href='https://play.google.com/store/apps/details?id=com.connect.club'
        className='google-play-icon'
        title={t('google-play-alt')}
      >
        <Image src='/img/svg/google-play.svg' width={189} height={56} alt={t('google-play-alt')} />
      </a>
      {/*{!isMobile ? (*/}
      {/*    <a href="https://storage.googleapis.com/connectclub-stage-files/Connect.Club-1.0.5.dmg" title={t('mac-store-alt')}>*/}
      {/*        <Image src='/img/svg/mac-store.svg' width={180} height={56} alt={t('mac-store-alt')} />*/}
      {/*    </a>*/}
      {/*) : (*/}
      {/*    <div className="w100">*/}
      {/*        {t('mac-store-mobile')}*/}
      {/*    </div>*/}
      {/*)}*/}
    </div>
  )
}

// const isMobileDevice = () => {
//     try {
//         document.createEvent("TouchEvent");
//         return true;
//     } catch (e) {
//         return false;
//     }
// }

JoinApps.propTypes = {
  className: PropTypes.string,
}

export default JoinApps
