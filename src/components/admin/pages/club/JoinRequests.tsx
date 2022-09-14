import React, { useEffect, useState } from 'react'
import { CheckOutlined, CloseOutlined, DownOutlined, LinkOutlined, SettingOutlined } from '@ant-design/icons'
import { Button, Dropdown, Menu, Table, Tooltip } from 'antd'
import { ColumnsType } from 'antd/es/table'
import clsx from 'clsx'
import PropTypes from 'prop-types'

import { getJoinRequests, useJoinRequests } from '@/api/clubApi'
import DataJson from '@/components/admin/common/DataJson'
import global_styles from '@/components/admin/css/admin.module.css'
import ApproveCancelLink from '@/components/admin/pages/club/ApproveCancelLink'
import UserInfo from '@/components/admin/pages/club/UserInfo'
import UserClubs from '@/components/admin/pages/users/UserClubs'
import UserNameBlock from '@/components/admin/pages/users/UserNameBlock'
import styles from '@/components/admin/pages/users/users.module.css'
import { getHumanDate } from '@/lib/helpers'
import { Loader } from '@/lib/svg'
import { Club, JoinRequest } from '@/model/clubModel'
import { FC } from '@/model/commonModel'

type Props = {
  id: Club['id']
}
const JoinRequests: FC<Props> = ({ id }) => {
  const limit = 100
  const [joinRequests, isLoading, setJoinRequests, joinRequestsLastValue] = useJoinRequests(id, { limit })
  const [isTableLoading, setTableLoading] = useState<boolean>(false)
  const [lastValue, setLastValue] = useState<number | null>(0)
  const [total, setTotal] = useState<number>(0)

  /* Table columns */
  const columns: ColumnsType<JoinRequest> = [
    {
      title: 'ID',
      dataIndex: '',
      key: 'id',
      width: 50,
      // eslint-disable-next-line react/display-name
      render: (request: JoinRequest) => {
        return (
          <div>
            <span className={clsx(styles.id, 'd-flex')}>{request.user.id}</span>
          </div>
        )
      },
    },
    {
      title: 'Name / Invited by',
      dataIndex: '',
      // eslint-disable-next-line react/display-name
      render: (request: JoinRequest) => (
        <div className={clsx('d-flex align-items-center', styles.user_name_wrapper)}>
          <UserInfo user={request.user}>
            <UserNameBlock user={request.user} />
          </UserInfo>
          <Tooltip title='Invited by'>
            <LinkOutlined rotate={45} style={{ fontSize: '16px' }} title='Invited' />
          </Tooltip>
          {request.user.joinedBy ? (
            <>
              {request.user.invitedTo !== null && (
                <UserClubs userClubs={[request.user.invitedTo]} color={'#5b8c00'}>
                  C
                </UserClubs>
              )}
              <UserInfo user={request.user.joinedBy}>
                <UserNameBlock user={request.user.joinedBy} showUserId />
              </UserInfo>
            </>
          ) : (
            'Not invited'
          )}
        </div>
      ),
    },
    {
      title: 'Registered',
      dataIndex: '',
      render: (request: JoinRequest) => {
        return request.user.createdAt ? getHumanDate(request.user.createdAt) : 'N/A'
      },
    },
    {
      title: 'Action',
      dataIndex: '',
      width: 50,
      // eslint-disable-next-line react/display-name
      render: (request: JoinRequest) => {
        const name = `${request.user.displayName}`
        return (
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key='approve'>
                  <ApproveCancelLink
                    action='approve'
                    requestId={request.joinRequestId}
                    id={request.user.id}
                    name={name}
                    onSuccess={deleteUserById}
                  >
                    <CheckOutlined /> Approve
                  </ApproveCancelLink>
                </Menu.Item>
                <Menu.Item key='cancel' danger>
                  <ApproveCancelLink
                    action='cancel'
                    requestId={request.joinRequestId}
                    id={request.user.id}
                    name={name}
                    onSuccess={deleteUserById}
                  >
                    <CloseOutlined color='#ff4d4f' /> Cancel
                  </ApproveCancelLink>
                </Menu.Item>
              </Menu>
            }
            overlayClassName={styles.dropdown_action}
            placement='bottomRight'
          >
            <Button className='d-flex align-items-center'>
              <SettingOutlined />
              <DownOutlined />
            </Button>
          </Dropdown>
        )
      },
    },
  ]

  /* Lazy load */
  const onLoadMore = async () => {
    await updateTable(lastValue || 0)
  }

  /* Update user row */
  const deleteUserById = async (userId: string) => {
    await setJoinRequests((prevValue) => {
      const newData = [...prevValue]
      const index = prevValue.findIndex((item) => userId === item.user.id)
      if (index > -1) {
        newData.splice(index, 1)
      }
      setTotal(newData.length)
      return newData
    })
  }

  const updateTable = async (lastId = 0) => {
    setTableLoading(true)

    const r = await getJoinRequests(id, { limit, lastValue: lastId })

    setTableLoading(false)
    if (!r._cc_errors.length && r.data !== null && r.data?.response?.items) {
      const updatedRequests = r.data.response.items
      if (!lastId) {
        setJoinRequests(updatedRequests)
        setTotal(updatedRequests.length)
      } else {
        setJoinRequests((prevValue) => {
          const newValue = [...prevValue, ...updatedRequests]
          setTotal(newValue.length)
          return newValue
        })
      }
      setLastValue(r.data.response.lastValue)
    }
  }

  useEffect(() => {
    if (joinRequests.length > total) {
      setTotal(joinRequests.length)
    }
  }, [joinRequests.length, total])

  useEffect(() => {
    setLastValue(joinRequestsLastValue)
  }, [joinRequestsLastValue])

  return (
    <div className={global_styles.block}>
      {isLoading ? (
        <Loader />
      ) : (
        <div className={clsx(styles.wrapper, isTableLoading ? styles['is-loading'] : '')}>
          <Table
            className={styles.table}
            columns={columns}
            rowKey={(request: JoinRequest) => request.user.id}
            pagination={false}
            locale={{
              emptyText: 'Users not found',
            }}
            expandable={{
              // eslint-disable-next-line react/display-name
              expandedRowRender: (user) => (
                <>
                  <DataJson data={user} className={global_styles['mt-1']}>
                    Show JSON
                  </DataJson>
                </>
              ),
              rowExpandable: () => true,
            }}
            dataSource={joinRequests}
          />
          {lastValue !== null && lastValue > 0 && (
            <Button className={global_styles['mt-1']} onClick={onLoadMore}>
              Load more
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

JoinRequests.propTypes = {
  id: PropTypes.string.isRequired,
}

export default JoinRequests
