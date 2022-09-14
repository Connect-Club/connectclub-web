import { DiscordIcon, LinkedinIcon, TwitterIcon, YoutubeIcon } from '@/lib/svg'
import { FC } from '@/model/commonModel'

const FooterSocialIcons: FC<unknown> = () => {
  return (
    <div className='d-flex footer__social_icons'>
      {/*<a href="https://t.me/connect_club_official" title='Telegram'>*/}
      {/*    <TelegramIcon />*/}
      {/*</a>*/}
      {/*<a href="https://www.facebook.com/team.connect.club/" title='Facebook'>*/}
      {/*    <FacebookIcon />*/}
      {/*</a>*/}
      {/*<a href="https://instagram.com/connect_club" title='Instagram'>*/}
      {/*    <InstagramIcon />*/}
      {/*</a>*/}
      <a href='https://www.youtube.com/channel/UC90lxRGNNq4ppReyuwm1Tng' title='Youtube'>
        <YoutubeIcon />
      </a>
      <a href='https://twitter.com/ConnectClubHQ' title='Twitter'>
        <TwitterIcon />
      </a>
      <a href='https://www.linkedin.com/company/c0nnectclub/' title='Linkedin'>
        <LinkedinIcon />
      </a>
      <a href='https://discord.gg/kK3A9Bs8KV' title='Discord'>
        <DiscordIcon />
      </a>
    </div>
  )
}

export default FooterSocialIcons
