import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'

import FooterSocialIcons from '@/components/FooterSocialIcons'
import { Logo } from '@/lib/svg'
import { FC } from '@/model/commonModel'

type Props = {
  footerLogoColor?: string
}
const Footer: FC<Props> = ({ footerLogoColor }) => {
  const { t } = useTranslation('common')
  const year = new Date().getFullYear()
  const color = footerLogoColor || 'rgba(0, 0, 0, 0.32)'
  return (
    <footer className='block s-sm footer gray'>
      <div className='container align-center'>
        <Link href='/'>
          <a title={t('logo-title')}>
            <Logo color={[color, color]} width={30} className='footer__logo' id='footer' />
          </a>
        </Link>
        <div>&copy; 2019–{year} Connect.Club</div>
        <FooterSocialIcons />
      </div>
    </footer>
  )
}

export default Footer
