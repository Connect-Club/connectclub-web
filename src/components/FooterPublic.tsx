import clsx from 'clsx'
import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'

import FooterSocialIcons from '@/components/FooterSocialIcons'
import public_styles from '@/css/public.module.css'
import { Logo } from '@/lib/svg'
import { FC } from '@/model/commonModel'

const FooterPublic: FC<unknown> = () => {
  const { t } = useTranslation('common')
  const year = new Date().getFullYear()
  const menu = [
    { url: '/contacts', title: t('common:nav.contacts') },
    { url: '/privacy', title: t('common:nav.privacy') },
    { url: '/terms', title: t('common:nav.terms') },
  ]
  return (
    <footer className={public_styles.footer}>
      <div className={clsx(public_styles.footer__inner, 'container')}>
        <div className={clsx(public_styles.hide768, 'd-flex align-items-center')}>
          <Link href='/'>
            <a title={t('logo-title')}>
              <Logo color={['#fff', '#fff']} width={40} id='footer' />
            </a>
          </Link>
          <div className={public_styles.footer__rights_text}>&copy; 2019–{year} Connect.Club. All rights reserved.</div>
        </div>
        <div className={clsx(public_styles.footer__menu, 'd-flex align-items-center')}>
          <nav>
            <ul className={public_styles.menu}>
              {menu.map((item) => (
                <li key={item.url}>
                  <Link href={item.url}>
                    <a title={item.title}>{item.title}</a>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <FooterSocialIcons />
        </div>
      </div>
    </footer>
  )
}

export default FooterPublic
