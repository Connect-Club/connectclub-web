import React from 'react'
import PropTypes from 'prop-types'

import { doRequest } from '@/lib/Api'
import { Delete } from '@/lib/svg'
import { FC } from '@/model/commonModel'

type Props = {
  id: string
}

const DeleteSubscription: FC<Props> = ({ id }) => {
  const onDeleteSubscription = async () => {
    await doRequest({
      endpoint: process.env.NEXT_PUBLIC_API_POST_DELETE_SUBSCRIPTION!.replace(/{id}/, id),
    })
    location.reload()
  }
  return (
    <a title='Delete subscription' onClick={onDeleteSubscription}>
      <Delete color='#f00' />
    </a>
  )
}

DeleteSubscription.propTypes = {
  id: PropTypes.string,
}

export default DeleteSubscription
