import React from 'react'

import Room from '@/components/admin/pages/rooms/Room'
import { FC } from '@/model/commonModel'
import { CurrentUser } from '@/model/usersModel'

type Props = {
  user: CurrentUser
  args: string[]
}

const AccountRooms: FC<Props> = ({ args }) => {
  return <Room args={args} rootPage={'/account/rooms'} isFrontend />
}

export default AccountRooms
