/**
 * One entry point for all admin pages.
 * In getServerSideProps we check user access to admin.
 */

import { withIronSessionSsr } from 'iron-session/next'
import Head from 'next/head'
import PropTypes from 'prop-types'

import { getSessionUser } from '@/api/userApi'
import AdminPage from '@/components/admin/AdminPage'
import ConnectClubAdmin from '@/components/admin/ConnectClubAdmin'
import AdminLayout from '@/components/layout/AdminLayout'
import { sessionOptions } from '@/lib/session'
import { CurrentUser } from '@/model/usersModel'

export const getServerSideProps = withIronSessionSsr(async function ({ req }) {
  const [user, isLoggedIn, scopeError] = await getSessionUser(req.session, ['admin'])
  const error = scopeError ? "You don't have enough rights" : ''

  return {
    props: {
      isLoggedIn,
      user,
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
}
const Admin = ({ isLoggedIn, user, error }: Props) => {
  return (
    <>
      <Head>
        <title>Connect Club admin</title>
      </Head>
      <ConnectClubAdmin isLoggedIn={isLoggedIn} user={user} AdminComponent={AdminPage} error={error} />
    </>
  )
}
Admin.propTypes = {
  isLoggedIn: PropTypes.bool,
  user: PropTypes.object,
  error: PropTypes.string,
}

/* Change default layout */
Admin.getLayout = AdminLayout

export default Admin
