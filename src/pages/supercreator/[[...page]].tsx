import { withIronSessionSsr } from 'iron-session/next'
import Head from 'next/head'
import PropTypes from 'prop-types'

import { getSessionUser } from '@/api/userApi'
import ConnectClubAdmin from '@/components/admin/ConnectClubAdmin'
import AdminLayout from '@/components/layout/AdminLayout'
import AdminCreator from '@/components/supercreator/index'
import { sessionOptions } from '@/lib/session'
import type { CurrentUser } from '@/model/usersModel'

export const getServerSideProps = withIronSessionSsr(async function ({ req }) {
  const [sessionUser, sessionLoggedIn, sessionScopeError] = await getSessionUser(req.session, ['supercreator'])
  const error =
    sessionScopeError || (Object.keys(sessionUser).length > 0 && !sessionUser.isSuperCreator)
      ? "You don't have enough rights"
      : ''
  let isLoggedIn = sessionLoggedIn

  if (!sessionUser.isSuperCreator) {
    req.session.destroy()
    isLoggedIn = false
  }

  return {
    props: {
      isLoggedIn,
      user: sessionUser,
      error,
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
  error: string
  ccUser: {
    token: string
    scope: string
    refresh_token: string
  }
}
const Admin = ({ isLoggedIn, user, error }: Props): JSX.Element => {
  return (
    <>
      <Head>
        <title>Connect Club creator page</title>
      </Head>
      <ConnectClubAdmin isLoggedIn={isLoggedIn} user={user} AdminComponent={AdminCreator} error={error} />
      <style global jsx>{`
        ul,
        ol {
          font-size: inherit;
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
