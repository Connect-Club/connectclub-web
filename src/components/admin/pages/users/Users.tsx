import React, { useEffect, useState } from 'react'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import {
  CheckCircleTwoTone,
  DownOutlined,
  FilterOutlined,
  LinkOutlined,
  LockOutlined,
  SettingOutlined,
  UnlockOutlined,
} from '@ant-design/icons'
import { Button, Col, Dropdown, Form, FormInstance, Input, InputNumber, Menu, Select, Table, Tag, Tooltip } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { FilterValue, SorterResult, TablePaginationConfig } from 'antd/lib/table/interface'
import clsx from 'clsx'
import Image from 'next/image'
import { useRouter } from 'next/router'

import { getUsers, useUsers } from '@/api/userApi'
import DataJson from '@/components/admin/common/DataJson'
import global_styles from '@/components/admin/css/admin.module.css'
import BanDeleteLink from '@/components/admin/pages/users/BanDeleteLink'
import InviteLink from '@/components/admin/pages/users/InviteLink'
import UserClubs from '@/components/admin/pages/users/UserClubs'
import UserNameBlock from '@/components/admin/pages/users/UserNameBlock'
import styles from '@/components/admin/pages/users/users.module.css'
import UsersSearch from '@/components/admin/pages/users/UsersSearch'
import { getHumanDate } from '@/lib/helpers'
import { Delete, Loader, Logo } from '@/lib/svg'
import { setWindowHistoryState } from '@/lib/utils'
import { FC } from '@/model/commonModel'
import { CleanUserDataType, ShortUserInfo, User, UsersSearchReturn } from '@/model/usersModel'

type Props = {
  user: User
}

type FilterValues = {
  id: string | null
  name: string
  surname: string
  username: string
  email: string
  state: User['state']
  badges: User['badges']
}

const Users: FC = () => {
  const router = useRouter()

  /* Show user by ID, passing as GET parameter  */
  const { id } = router.query
  const initialFilter: { id: string | null } = { id: null }
  if (typeof id === 'string') {
    initialFilter['id'] = id
    setWindowHistoryState('/admin/users')
  }

  const [usersFilter, setFilter] = useState<Partial<FilterValues>>(initialFilter)
  const [order, setOrder] = useState<string>('id:DESC')
  const [users, isUsersLoading, setUsers, usersTotal, usersLastValue] = useUsers(100, usersFilter, 0, order)
  const [isTableLoading, setTableLoading] = useState<boolean>(false)
  const [lastValue, setLastValue] = useState<number>(0)
  const [total, setTotal] = useState<number>(0)

  const [form] = Form.useForm()

  /* Update user row */
  const updateUserById = async (userId: string | string[]) => {
    const ids = typeof userId === 'string' ? userId.split(',') : userId
    await updateTableUsers({ id: ids })
  }

  const updateTableUsers = async (filter = {}, orderBy = 'id:DESC', lastId = 0, replaceAll = false) => {
    setTableLoading(true)

    const r = await getUsers(100, filter ?? usersFilter, lastId, orderBy)
    setTableLoading(false)
    if (!r._cc_errors.length) {
      if (r.data !== null && r.data?.response?.items) {
        const updatedUsers = r.data.response.items
        // Replace old users to new
        if (!replaceAll) {
          setUsers((prevValue) => {
            const newData = [...prevValue]
            updatedUsers.forEach((userItem) => {
              const index = newData.findIndex((item) => userItem.id === item.id)
              if (index > -1) {
                newData.splice(index, 1, {
                  ...userItem,
                })
              }
            })
            return newData
          })
        }
        // Replace all users
        else {
          if (!lastId) {
            setUsers(updatedUsers)
          }
          // Add users to existing, if we have lastId
          else {
            setLastValue(r.data.response.lastValue)
            setUsers((prevValue) => [...prevValue, ...updatedUsers])
          }
        }
        setTotal(r.data.response.totalCount)
      }
    }
  }

  const GetBanDeleteInfo = ({ user }: Props) => {
    const getInfoRow = (userBanDeleteInfo: ShortUserInfo, comment: string, type = 'deleted') => {
      return (
        <div className={clsx('d-flex', styles.ban_delete_info)}>
          <ExclamationCircleOutlined
            style={{
              color: '#faad14',
              fontSize: '22px',
              marginRight: '10px',
            }}
          />
          <span className='nowrap'>{type === 'ban' ? 'Banned' : 'Deleted'} by</span>
          <UserNameBlock user={userBanDeleteInfo} updateUserById={updateUserById} />
          {comment !== '' && <span className={styles.reason}>{comment}</span>}
        </div>
      )
    }
    return (
      <>
        {user.state === 'banned' && user.bannedBy && <>{getInfoRow(user.bannedBy, user.banComment || '', 'ban')}</>}
        {user.state === 'deleted' && user?.deletedBy && <>{getInfoRow(user.deletedBy, user.deleteComment || '')}</>}
      </>
    )
  }

  /* Sorting */
  const handleTableChange = async (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<User> | SorterResult<User>[],
  ) => {
    if (!Array.isArray(sorter)) {
      const orderBy = `${sorter.columnKey}:${sorter.order === 'ascend' ? 'ASC' : 'DESC'}`
      setOrder(orderBy)
      await updateTableUsers(usersFilter, orderBy, 0, true)
    }
  }

  /* Table columns */
  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: '',
      key: 'id',
      sorter: true,
      sortDirections: ['ascend'],
      width: 50,
      // eslint-disable-next-line react/display-name
      render: (user: User) => {
        return (
          <div>
            <span className={clsx(styles.id, 'd-flex')}>
              {user.id}
              {user.state === 'verified' && (
                <CheckCircleTwoTone twoToneColor='#52c41a' title='Verified' className={styles.verified} />
              )}
            </span>
            <UserTags user={user} />
          </div>
        )
      },
    },
    {
      title: 'Name / Invited by',
      dataIndex: '',
      // eslint-disable-next-line react/display-name
      render: (user: User) => (
        <div className={clsx('d-flex align-items-center', styles.user_name_wrapper)}>
          <UserNameBlock user={user} updateUserById={updateUserById} />
          <Tooltip title='Invited by'>
            <LinkOutlined rotate={45} style={{ fontSize: '16px' }} title='Invited' />
          </Tooltip>
          {user.joinedBy ? (
            <>
              {user.invitedTo !== null && (
                <UserClubs userClubs={[user.invitedTo]} color={'#5b8c00'}>
                  C
                </UserClubs>
              )}
              <UserNameBlock user={user.joinedBy} rowId={user.id} showUserId updateUserById={updateUserById} />
            </>
          ) : (
            <InviteLink
              id={user.id}
              name={user.name || '<No name>'}
              phone={user.phone || ''}
              onSuccess={updateUserById}
            />
          )}
        </div>
      ),
    },
    {
      title: 'Phone',
      dataIndex: '',
      width: 160,
      // eslint-disable-next-line react/display-name
      render: (user: User) => {
        return (
          <div className={'d-flex align-items-center'}>
            {user.devices.length > 0 ? (
              <div className={clsx('d-flex flex-shrink-0')}>
                <Tooltip
                  title={user.devices.map((device, i) => (
                    <div key={i}>{device}</div>
                  ))}
                >
                  {user.phone} •
                </Tooltip>
              </div>
            ) : (
              user.phone
            )}
          </div>
        )
      },
    },
    {
      title: 'Invites',
      dataIndex: 'freeInvites',
    },
    {
      title: 'Registered',
      dataIndex: 'createdAt',
      render: (date: number) => {
        return date ? getHumanDate(date) : 'N/A'
      },
    },
    {
      title: 'Action',
      dataIndex: '',
      width: 50,
      // eslint-disable-next-line react/display-name
      render: (user: User) => {
        const userName = user.name || '<No name>'
        return (
          <Dropdown
            overlay={
              <Menu>
                {user.state === 'banned' ? (
                  <Menu.Item key='unban'>
                    <BanDeleteLink action='unban' id={user.id} name={userName} onSuccess={updateUserById}>
                      <UnlockOutlined /> UnBan
                    </BanDeleteLink>
                  </Menu.Item>
                ) : (
                  <Menu.Item key='ban'>
                    <BanDeleteLink action='ban' id={user.id} name={userName} onSuccess={updateUserById}>
                      <LockOutlined /> Ban
                    </BanDeleteLink>
                  </Menu.Item>
                )}
                {user.state !== 'deleted' && (
                  <Menu.Item key='delete' danger>
                    <BanDeleteLink action='delete' id={user.id} name={userName} onSuccess={updateUserById}>
                      <Delete color='#ff4d4f' /> Delete
                    </BanDeleteLink>
                  </Menu.Item>
                )}
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

  const onFilter = async (values: FilterValues) => {
    setFilter(values)
    await updateTableUsers(values, order, 0, true)
  }

  const onFilterReset = async () => {
    setFilter({})
    form.resetFields()
    await updateTableUsers({}, order, 0, true)
  }

  /* Lazy load */
  const onLoadMore = async () => {
    await updateTableUsers(usersFilter, order, lastValue, true)
  }

  useEffect(() => {
    setLastValue(usersLastValue)
    setTotal(usersTotal)
  }, [usersLastValue, usersTotal])

  /**
   *  Rows expanded by default
   *  Uncomment to expand banned and deleted users
   **/
  // const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);
  // const onExpand = (toExpand: boolean, user: User) => {
  //     setExpandedRowKeys(prevValue => {
  //         const set = new Set(prevValue);
  //         if (set.has(user.id)) {
  //             set.delete(user.id);
  //         } else {
  //             set.add(user.id);
  //         }
  //         return Array.from(set.values());
  //     })
  // };
  // useEffect(() => {
  //     if (users) {
  //         setExpandedRowKeys(users.reduce((ids: number[], user) => {
  //             if (user.banned || user.deleted) {
  //                 ids.push(user.id);
  //             }
  //             return ids;
  //         }, []));
  //     }
  // }, flattenInput(users));

  return (
    <div className={global_styles.block}>
      <p className={global_styles.h3}>
        Users
        {!isUsersLoading && <> ({usersTotal})</>}:
      </p>

      {isUsersLoading ? (
        <Loader />
      ) : (
        <div className={clsx(styles.wrapper, isTableLoading ? styles['is-loading'] : '')}>
          {/* Filter */}
          <FilterBlock isLoading={isTableLoading} form={form} onFilterReset={onFilterReset} onFilter={onFilter} />
          <hr />

          <div className={clsx(global_styles['my-1'], 'd-flex')}>
            <Col span={12}>
              <FastSearch updateTableUsers={updateTableUsers} />
            </Col>
            <Col span={12}>
              <div className='align-right'>
                <em>Found: {users.length}</em>
              </div>
            </Col>
          </div>

          <Table
            className={styles.table}
            columns={columns}
            rowKey='id'
            pagination={false}
            locale={{
              emptyText: 'Users not found',
            }}
            expandable={{
              // eslint-disable-next-line react/display-name
              expandedRowRender: (user) => (
                <>
                  <GetBanDeleteInfo user={user} />
                  <DataJson data={user} className={global_styles['mt-1']}>
                    Show JSON
                  </DataJson>
                </>
              ),
              rowExpandable: () => true,
              // expandedRowKeys: expandedRowKeys,
            }}
            // onExpand={onExpand}
            onChange={handleTableChange}
            dataSource={users}
          />
          {total > 100 && total !== users.length && (
            <Button className={global_styles['mt-1']} onClick={onLoadMore}>
              Load more
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

type FilterProps = {
  form: FormInstance
  onFilter: (values: FilterValues) => void
  onFilterReset: () => void
  isLoading: boolean
}
const FilterBlock = ({ form, onFilter, onFilterReset, isLoading }: FilterProps) => {
  return (
    <div className={global_styles['my-2']}>
      <h4 className={clsx(global_styles.h4, 'd-flex align-items-center')}>
        <FilterOutlined /> Filter
      </h4>
      <Form name='filter' labelAlign='left' onFinish={onFilter} layout='inline' form={form}>
        <Form.Item name='id'>
          <InputNumber placeholder='ID' />
        </Form.Item>
        <Form.Item name='name'>
          <Input placeholder='Name' />
        </Form.Item>
        <Form.Item name='surname'>
          <Input placeholder='Surname' />
        </Form.Item>
        <Form.Item name='username'>
          <Input placeholder='Username' />
        </Form.Item>
        <Form.Item name='email'>
          <Input placeholder='Email' />
        </Form.Item>
        <Form.Item name='state'>
          <Select placeholder='Select state'>
            <Select.Option value='verified'>Verified</Select.Option>
            <Select.Option value='waiting_list'>Waiting list</Select.Option>
            <Select.Option value='banned'>Banned</Select.Option>
            <Select.Option value='deleted'>Deleted</Select.Option>
            <Select.Option value='invited'>Invited</Select.Option>
            <Select.Option value='not_invited'>Not invited</Select.Option>
          </Select>
        </Form.Item>
        <Col span={4}>
          <Form.Item name='badges'>
            <Select placeholder='Select badge' mode='multiple' style={{ width: '100%' }}>
              <Select.Option value='team'>Team</Select.Option>
              <Select.Option value='press'>Press</Select.Option>
              <Select.Option value='speaker'>Speaker</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={24}>
          <Button type='primary' htmlType='submit' loading={isLoading}>
            Search
          </Button>
          <Button htmlType='button' onClick={onFilterReset} className={global_styles['ml-1']}>
            Reset filter
          </Button>
        </Col>
      </Form>
    </div>
  )
}

const UserTags = ({ user }: Props) => {
  return (
    <div className={styles.tags}>
      {/* Badges */}
      {user.badges.some((b) => ['team', 'press', 'speaker'].includes(b)) && (
        <div className='d-flex align-items-center'>
          {user.badges.includes('team') && (
            <Tooltip title='Team'>
              <div>
                <Logo width={20} color={['#000', '#000']} id={user.id} />
              </div>
            </Tooltip>
          )}
          {user.badges.includes('speaker') && (
            <Tooltip title='Speaker'>
              <Image src='/img/svg/speaker.svg' width={20} height={20} alt='Speaker' />
            </Tooltip>
          )}
          {user.badges.includes('press') && (
            <Tooltip title='Press'>
              <Image src='/img/svg/press.svg' width={20} height={20} alt='Press' />
            </Tooltip>
          )}
        </div>
      )}

      {user.isSuperCreator && (
        <div className='d-flex align-items-center'>
          <Tooltip title='Supercreator'>
            <Image src='/img/svg/dollar.svg' width={20} height={20} alt='Supercreator' />
          </Tooltip>
        </div>
      )}

      {/* Tags */}
      {user.state === 'waiting_list' && <Tag color='blue'>Wait</Tag>}
      {user.state === 'deleted' && <Tag color='red'>DELETED</Tag>}
      {user.state === 'banned' && <Tag color='volcano'>BANNED</Tag>}
    </div>
  )
}

type FastSearchProps = {
  updateTableUsers: (filter: Record<string, any>, orderBy: string, lastId: number, replaceAll: boolean) => void
}
const FastSearch = ({ updateTableUsers }: FastSearchProps) => {
  const [value, setValue] = useState<UsersSearchReturn[]>([])
  const [disabled, setDisabled] = useState<boolean>(true)

  const onChange = (val: UsersSearchReturn[]) => {
    setValue(val)
    setDisabled(!val.length)
  }

  const onClick = async () => {
    if (value.length) {
      const ids = value.map((userSearchReturn) => {
        const user = JSON.parse(userSearchReturn.value) as CleanUserDataType
        return user.id
      })
      await updateTableUsers({ id: ids }, 'id:DESC', 0, true)
    }
  }

  return (
    <div className='d-flex align-items-center gutter-1'>
      <span className='nowrap'>Fast search:</span>
      <UsersSearch
        style={{
          width: '100%',
        }}
        onChange={onChange}
      />
      <Button disabled={disabled} onClick={onClick}>
        Find
      </Button>
    </div>
  )
}

export default Users
