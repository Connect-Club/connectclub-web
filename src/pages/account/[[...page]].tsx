import { withIronSessionSsr } from 'iron-session/next'
import Head from 'next/head'
import PropTypes from 'prop-types'

import { getSessionUser } from '@/api/userApi'
import AccountPageEntry from '@/components/account/AccountPageEntry'
import ConnectClubAdmin from '@/components/admin/ConnectClubAdmin'
import AdminLayout from '@/components/layout/AdminLayout'
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
}
const Account = ({ isLoggedIn, user }: Props) => {
  return (
    <>
      <Head>
        <title>Account page</title>
      </Head>
      <ConnectClubAdmin isLoggedIn={isLoggedIn} user={user} isFrontend AdminComponent={AccountPageEntry} />
    </>
  )
}
Account.propTypes = {
  isLoggedIn: PropTypes.bool,
  user: PropTypes.object,
}

/* Change default layout */
Account.getLayout = AdminLayout

export default Account
