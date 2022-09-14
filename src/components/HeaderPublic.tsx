import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'

import { FullLogo } from '@/lib/svg'
import { FC } from '@/model/commonModel'

const HeaderPublic: FC<unknown> = () => {
  const { t } = useTranslation('home')

  return (
    <header className='header'>
      <div className='container'>
        <div className='header__container d-flex'>
          <div className='logo'>
            <Link href='/'>
              <a title={t('common:logo-title')}>
                <FullLogo id='header' />
              </a>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export default HeaderPublic
