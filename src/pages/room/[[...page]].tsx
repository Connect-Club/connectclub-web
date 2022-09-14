import { withIronSessionSsr } from 'iron-session/next'
import Head from 'next/head'
import PropTypes from 'prop-types'

import { getSessionUser } from '@/api/userApi'
import ConnectClubAdmin from '@/components/admin/ConnectClubAdmin'
import global_styles from '@/components/admin/css/admin.module.css'
import map_styles from '@/components/admin/Map/map.module.css'
import styles from '@/components/auth/style/auth.module.css'
import AdminLayout from '@/components/layout/AdminLayout'
import AdminRoom from '@/components/room/index'
import { sessionOptions } from '@/lib/session'
import { CurrentUser } from '@/model/usersModel'

export const getServerSideProps = withIronSessionSsr(async function ({ req }) {
  const [user, isLoggedIn] = await getSessionUser(req.session, [])

  return {
    props: {
      isLoggedIn,
      user,
      ccUser: {
        token: isLoggedIn ? req.session.token : '',
        scope: isLoggedIn ? req.session.scope : '',
        refresh_token: isLoggedIn ? req.session.refresh_token : '',
      },
    },
  }
}, sessionOptions)

type Props = {
  user: CurrentUser
  isLoggedIn: boolean
  ccUser: {
    token: string
    scope: string
    refresh_token: string
  }
}
const Admin = ({ isLoggedIn, user }: Props): JSX.Element => {
  return (
    <>
      <Head>
        <title>Connect Club rooms</title>
      </Head>
      <ConnectClubAdmin isLoggedIn={isLoggedIn} user={user} AdminComponent={AdminRoom} isFrontend={true} />
      <style global jsx>{`
        ul,
        ol {
          font-size: inherit;
        }
        html,
        body,
        .${styles.loginBlock__form}, .${styles.loginBlock__footer} {
          background: #f0f0f0 !important;
        }
        .${styles.loginBlock__header} .${global_styles.h4} {
          position: relative;
          color: #f0f0f0;
          font-size: 34px;
          line-height: 40px;
          height: 80px;
        }
        .${styles.loginBlock__header} .${global_styles.h4}:after {
          position: absolute;
          left: 0;
          top: 0;
          content: 'Welcome to room editor!';
          width: 100%;
          color: var(--second-black);
        }
        .${styles.loginBlock__fields_input} {
          margin-left: 0 !important;
        }

        .${styles.loginBlock},
          .${styles.loginBlock__header},
          .${styles.loginBlock__footer},
          .${styles.loginBlock__form}
          .ant-input,
        .${styles.loginBlock__form} .ant-select-single:not(.ant-select-customize-input) .ant-select-selector,
        .${styles.loginBlock__form} .ant-input:focus,
        .${styles.loginBlock__form} .ant-input-focused,
        .${styles.loginBlock__form} .ant-input:hover {
          border: 0 none;
        }

        .${styles.loginBlock__form} .ant-input:focus,
        .${styles.loginBlock__form} .ant-input-focused,
        .${styles.loginBlock__form} .ant-input:hover,
        .${styles.loginBlock__form}
          .ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input)
          .ant-select-selector {
          box-shadow: none;
        }

        .${styles.loginBlock__body} > div:first-child {
          font-size: 30px;
          color: var(--second-black);
          margin-bottom: 32px;
        }
        .${styles.loginBlock__form} .ant-input,
        .${styles.loginBlock__form} .ant-select-single:not(.ant-select-customize-input) .ant-select-selector {
          padding: 8px 12px;
          outline: none;
          font-size: 20px;
        }
        .${styles.loginBlock__form} .ant-input {
          border-top-right-radius: 7px;
          border-bottom-right-radius: 7px;
        }
        .${styles.loginBlock__form} .ant-select-arrow {
          display: none;
        }

        .${styles.loginBlock__form} .ant-select-selector {
          width: 100px;
          border-top-left-radius: 7px !important;
          border-bottom-left-radius: 7px !important;
        }
        .${styles.loginBlock__form} .ant-select {
          width: 110px;
        }
        .${styles.loginBlock__form}
          .ant-select-show-search.ant-select:not(.ant-select-customize-input)
          .ant-select-selector
          input {
          width: 60px;
        }
        .${styles.loginBlock__form} .ant-select-selection-item {
          text-align: center;
        }

        .${styles.loginBlock__form} .ant-select-single:not(.ant-select-customize-input) .ant-select-selector,
        .${styles.loginBlock__form}
          .ant-select-single:not(.ant-select-customize-input)
          .ant-select-selector
          .ant-select-selection-search-input {
          height: 100%;
        }

        .${styles.loginBlock__button} {
          width: 215px;
          font-size: 18px;
          padding: 13px 32px;
          background: #4d7dd0;
          border-radius: 24px;
          color: #fff;
          height: 48px;
          margin: 0 auto;
          line-height: 0;
        }
        .${styles.loginBlock__footer} {
          margon-top: 25px;
        }
        .${styles.loginBlock__footer} > div.d-flex {
          flex-direction: column;
          row-gap: 10px;
          text-align: center;
        }
        .${global_styles.adminPage} .ant-btn-primary[disabled] {
          background: #4d7dd0;
          color: #fff;
          opacity: 0.4;
        }
        .ant-btn-primary {
          background: #4d7dd0;
          border-radius: 24px;
          color: #fff;
        }

        .${styles.loginBlock__form} .ant-btn-loading-icon {
          vertical-align: middle;
        }
        .${global_styles.header} {
          display: none;
        }
        .${global_styles.content} {
          padding-top: 0.6rem;
        }
        .${global_styles.h3_gray} {
          margin-top: 0 !important;
        }
        .${global_styles.adminPage} {
          font-size: 26px;
          width: 100%;
          min-width: 100%;
        }

        .${map_styles.rnd_inactive} {
          visibility: hidden;
        }

        .${map_styles.submit_btn}, .${map_styles.control_bar} .ant-upload .ant-btn {
          font-size: 24px;
          width: 250px;
          height: 50px;
          padding-right: 28px;
          margin-top: 20px;
          margin-bottom: 10px;
        }
      `}</style>
    </>
  )
}
Admin.propTypes = {
  isLoggedIn: PropTypes.bool,
  user: PropTypes.object,
}

/* Change default layout */
Admin.getLayout = AdminLayout

export default Admin
