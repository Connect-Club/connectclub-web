import React, { useMemo, useState } from 'react'
import { CellProps, useSortBy, useTable } from 'react-table'
import { LockOutlined, QuestionCircleOutlined, UnlockOutlined } from '@ant-design/icons'
import { Button, Col, DatePicker, Form, Row, Tooltip } from 'antd'
import clsx from 'clsx'
import moment, { Moment } from 'moment'

import global_styles from '@/components/admin/css/admin.module.css'
import styles from '@/components/admin/pages/analytics/analytics.module.css'
import ModalHelper from '@/components/admin/pages/analytics/ModalHelper'
import { doRequest } from '@/lib/Api'
import flattenInput from '@/lib/flattenInput'
import { getCellValueWithPercentage } from '@/lib/utils'
import {
  ClubEventsCount,
  ClubOwnersInvitedBy,
  ClubParticipantsCount,
  ConsolidateReport,
  ConsolidateReportData,
  EventsByCountries,
  InvitesGroupedByStates,
  OnlyCount,
  RegisteredByCountries,
  TopIndividualInviters,
  TotalClubMembers,
  TypeOfRooms,
  UserStates,
} from '@/model/analyticsModel'
import type { FC, Params } from '@/model/commonModel'

type InitialValues = {
  start: Moment | string
  end: Moment | string
}

type TableColumnValues = {
  [key: string]: string | number
}

const ConsolidateReport: FC = () => {
  const [isFormLoading, setFormLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState<string[]>([])
  const [reportData, setReportData] = useState<ConsolidateReport>({} as ConsolidateReport)

  const initialFormValues: InitialValues = {
    start: '',
    end: moment(),
  }

  const disabledDateEnd = (current: Moment) => {
    return current && current.valueOf() >= moment().valueOf()
  }

  const onSubmit = async (values: InitialValues) => {
    const data = values
    if (data['start'] && typeof data['start'] !== 'string') {
      data['start'] = data['start'].format('YYYY-MM-DD HH:mm')
    }
    if (data['end'] && typeof data['end'] !== 'string') {
      data['end'] = data['end'].format('YYYY-MM-DD HH:mm')
    }

    setFormLoading(true)
    setErrors([])

    const response = await doRequest<ConsolidateReport, ConsolidateReport>({
      endpoint: process.env.NEXT_PUBLIC_API_POST_ANALYTICS_CONSOLIDATE!,
      method: 'POST',
      data,
    })

    if (response._cc_errors.length) {
      const responseErrors = response._cc_errors.map((error) =>
        typeof error !== 'string' ? error?.text || 'Timeout error' : error,
      )
      setErrors(responseErrors)
    } else {
      setReportData(response.data)
    }

    setFormLoading(false)
  }

  return (
    <>
      <p className={global_styles.h3}>Consolidated report</p>

      <Form
        name='consolidate-report'
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 16 }}
        labelAlign='left'
        onFinish={onSubmit}
        initialValues={initialFormValues}
      >
        <Form.Item
          label={`Specify start date`}
          name='start'
          extra={
            'You can leave this field empty and the report will be generated for the last 3 weeks from the end date'
          }
        >
          <DatePicker
            allowClear={true}
            format='YYYY-MM-DD HH:mm'
            showTime={{ format: 'HH:mm' }}
            disabledDate={disabledDateEnd}
          />
        </Form.Item>
        <Form.Item
          label={`Specify end date`}
          name='end'
          rules={[
            {
              required: true,
              message: 'Field is required',
            },
          ]}
        >
          <DatePicker
            allowClear={false}
            disabledDate={disabledDateEnd}
            format='YYYY-MM-DD HH:mm'
            showTime={{ format: 'HH:mm' }}
          />
        </Form.Item>

        <Form.Item wrapperCol={{ span: 19 }} className={global_styles['mt-1']}>
          <Row>
            <Col span={16}>
              <Button type='primary' htmlType='submit' loading={isFormLoading}>
                Create a report
              </Button>
            </Col>
          </Row>
          {errors.length > 0 && (
            <Row className={global_styles.error_text} dangerouslySetInnerHTML={{ __html: errors.join('<br />') }} />
          )}
        </Form.Item>
      </Form>

      {Object.keys(reportData).length > 0 && <Report data={reportData} />}
    </>
  )
}

type ConsolidateReportTablesKeys = keyof ConsolidateReport['tables']
type ConsolidateReportOtherKeys = keyof Omit<ConsolidateReport, 'tables' | 'date'>
type ConsolidateReportKeys = ConsolidateReportTablesKeys | ConsolidateReportOtherKeys
type OneOfTheConsolidateReportTable = ConsolidateReport['tables'][ConsolidateReportTablesKeys]
type OneOfTheConsolidateOtherTable = [{ rows: ConsolidateReport[ConsolidateReportOtherKeys]; date: [] }]
type OneOfTheConsolidateReport = OneOfTheConsolidateReportTable | OneOfTheConsolidateOtherTable

const Report: FC<{ data: ConsolidateReport }> = ({ data }) => {
  const order: Array<{ key: ConsolidateReportKeys; name: string }> = useMemo(
    () => [
      { key: 'userStates', name: 'User states' },
      { key: 'invites', name: 'User states grouped by invites' },
      { key: 'topIndividualInviters', name: 'Top of private inviters' },
      { key: 'totalClubs', name: 'Total number of clubs' },
      { key: 'totalClubMembers', name: 'Total number of club participants' },
      {
        key: 'clubParticipantsCount',
        name: 'Number of new participants added to clubs',
      },
      {
        key: 'totalClubParticipants',
        name: 'Total number of people accepted into all clubs',
      },
      {
        key: 'totalEventParticipants',
        name: 'Total number of people participated in events',
      },
      {
        key: 'registeredByCountries',
        name: 'New users grouped by countries, who were verified in app',
      },
      { key: 'typeOfRooms', name: 'Number of opened rooms' },
      {
        key: 'eventsByCountries',
        name: 'Number of opened rooms grouped by countries',
      },
      { key: 'totalNewClubs', name: 'Number of new clubs' },
      { key: 'clubEventsCount', name: 'Number of events grouped by clubs' },
      { key: 'clubOwnersInvitedBy', name: 'Club owners were invited by' },
    ],
    [],
  )

  return useMemo(
    () => (
      <div className={global_styles.mt_1}>
        {order.map((orderItem) => {
          if (orderItem.key in data.tables && data.tables[orderItem.key as ConsolidateReportTablesKeys]) {
            const tables = data.tables[orderItem.key as ConsolidateReportTablesKeys]
            return (
              <div className={global_styles.mt_3} key={`${orderItem.key}_parent`}>
                <h3 className={clsx(global_styles.h3)}>{orderItem.name}</h3>
                <div className={clsx(orderItem.key !== 'clubOwnersInvitedBy' ? 'd-flex' : styles.table_flex_column)}>
                  {[
                    'clubParticipantsCount',
                    'registeredByCountries',
                    'topIndividualInviters',
                    'eventsByCountries',
                    'clubEventsCount',
                    'clubOwnersInvitedBy',
                  ].includes(orderItem.key) ? (
                    <>
                      {tables?.map((table, index) => (
                        <Table
                          data={[table] as OneOfTheConsolidateReportTable}
                          type={orderItem.key}
                          key={`${orderItem.key}_table_${index}`}
                        />
                      ))}
                    </>
                  ) : (
                    <Table data={tables} type={orderItem.key} />
                  )}
                </div>
              </div>
            )
          } else if (orderItem.key in data && data[orderItem.key as ConsolidateReportOtherKeys]) {
            return (
              <div className={global_styles.mt_3} key={`${orderItem.key}_parent`}>
                <h3 className={clsx(global_styles.h3)}>
                  {orderItem.name}
                  {orderItem.key === 'totalClubs' && <>: {data[orderItem.key]}</>}
                </h3>
                {orderItem.key === 'totalClubMembers' && (
                  <div className={styles.align_left}>
                    <Table data={[{ rows: data[orderItem.key], date: [] }]} type={orderItem.key} />
                  </div>
                )}
              </div>
            )
          }
        })}
      </div>
    ),
    [data, order],
  )
}

type TableColumns = Array<{
  Header: string | JSX.Element
  accessor: string
  Cell?: (props: CellProps<TableColumnValues, number>) => JSX.Element
  className?: string
  columns?: TableColumns
  disableSortBy?: boolean
  sortDescFirst?: boolean
}>

const Table: FC<{
  data: OneOfTheConsolidateReport
  type: ConsolidateReportKeys
}> = ({ data, type }) => {
  const getColumns = useMemo(
    () => () => {
      let columns: TableColumns = [
        {
          Header: '',
          accessor: 'name',
          disableSortBy: true,
        },
      ]
      const format = 'DD.MM'
      data &&
        data.forEach((table, index) => {
          const header =
            type === 'totalClubMembers'
              ? 'Total'
              : `${moment(table.date[0]).format(format)} – ${moment(table.date[1]).format(format)}`

          if (type === 'invites') {
            columns.push({
              Header: header,
              accessor: '',
              className: 'nowrap',
              disableSortBy: true,
              columns: [
                {
                  Header: 'Personal',
                  disableSortBy: true,
                  accessor: `personal${index}`,
                  Cell: (props: CellProps<TableColumnValues, number>) => {
                    return (
                      <div className='nowrap'>
                        {getCellValueWithPercentage(props.value || 0, Number(props.data[0][props.column.id]))}
                      </div>
                    )
                  },
                },
                {
                  Header: 'Club',
                  disableSortBy: true,
                  accessor: `club${index}`,
                  Cell: (props: CellProps<TableColumnValues, number>) => {
                    return (
                      <div className='nowrap'>
                        {getCellValueWithPercentage(props.value || 0, Number(props.data[0][props.column.id]))}
                      </div>
                    )
                  },
                },
              ],
            })
          } else if (type === 'clubOwnersInvitedBy') {
            columns = [
              {
                Header: header,
                accessor: '',
                className: 'nowrap',
                disableSortBy: true,
                columns: [
                  {
                    Header: 'Owner username',
                    disableSortBy: true,
                    accessor: `club_owner_username${index}`,
                  },
                  {
                    Header: 'Owner club slug',
                    disableSortBy: true,
                    accessor: `owner_club_slug${index}`,
                  },
                  {
                    Header: 'Invited by user',
                    disableSortBy: true,
                    accessor: `invited_by_user${index}`,
                  },
                  {
                    Header: 'Invited by club',
                    disableSortBy: true,
                    accessor: `invited_by_club${index}`,
                  },
                ],
              },
            ]
          } else if (type === 'userStates') {
            columns.push({
              Header: header,
              className: 'nowrap',
              disableSortBy: true,
              accessor: `value${index}`,
              Cell: (props: CellProps<TableColumnValues, number>) => {
                const value = getCellValueWithPercentage(props.value || 0, Number(props.data[0][props.column.id]))
                const additionalData = props.data[Number(props.row.id)][`additional${index}`]
                return (
                  <div className='nowrap'>
                    {additionalData && Object.keys(additionalData).length > 0 ? (
                      <ModalHelper link={value} modalTitle={'Additional info'}>
                        <pre>{JSON.stringify(additionalData, null, 4)}</pre>
                      </ModalHelper>
                    ) : (
                      value
                    )}
                  </div>
                )
              },
            })
          } else if (type === 'eventsByCountries') {
            columns.push({
              Header: header,
              accessor: '',
              className: 'nowrap',
              disableSortBy: true,
              columns: [
                {
                  Header: (
                    <Tooltip title={'Public room'}>
                      <UnlockOutlined />
                    </Tooltip>
                  ),
                  sortDescFirst: true,
                  accessor: `public${index}`,
                },
                {
                  Header: (
                    <Tooltip title={'Private room'}>
                      <LockOutlined />
                    </Tooltip>
                  ),
                  sortDescFirst: true,
                  accessor: `private${index}`,
                },
              ],
            })
          } else if (type === 'typeOfRooms') {
            columns.push({
              Header: header,
              accessor: '',
              className: 'nowrap',
              disableSortBy: true,
              columns: [
                {
                  Header: (
                    <Tooltip title={'Public room'}>
                      <UnlockOutlined />
                    </Tooltip>
                  ),
                  disableSortBy: true,
                  accessor: `public${index}`,
                },
                {
                  Header: (
                    <Tooltip title={'Private room'}>
                      <LockOutlined />
                    </Tooltip>
                  ),
                  disableSortBy: true,
                  accessor: `private${index}`,
                },
                {
                  Header: (
                    <Tooltip title={'Total'}>
                      <UnlockOutlined /> + <LockOutlined />
                    </Tooltip>
                  ),
                  disableSortBy: true,
                  accessor: `total${index}`,
                },
              ],
            })
          } else {
            columns.push({
              Header: header,
              className: 'nowrap',
              disableSortBy: true,
              accessor: `value${index}`,
              Cell: (props: CellProps<TableColumnValues, number>) => {
                return <div className='nowrap'>{props.value}</div>
              },
            })
          }
        })
      return columns
    },
    [data, type],
  )

  const columns = React.useMemo(() => getColumns(), [getColumns])

  const tableData = React.useMemo(
    () => getTableData(data, type),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    flattenInput(data),
  )

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data: tableData,
    },
    useSortBy,
  )

  return (
    <>
      <table className={styles.table} {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            // eslint-disable-next-line react/jsx-key
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                // eslint-disable-next-line react/jsx-key
                <th
                  // @ts-ignore
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  // @ts-ignore
                  title={column.canSort ? 'Sort the column' : ''}
                  className={clsx(
                    // @ts-ignore
                    column.parent?.className || column.className,
                    // @ts-ignore
                    column.canSort ? styles.sortable : undefined,
                  )}
                >
                  {column.render('Header')}
                  <span className={styles.sort_icon}>
                    {/*@ts-ignore*/}
                    {column.isSorted
                      ? // @ts-ignore
                        column.isSortedDesc
                        ? ' ▼'
                        : ' ▲'
                      : ''}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row)
            return (
              // eslint-disable-next-line react/jsx-key
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    // eslint-disable-next-line react/jsx-key
                    <td
                      {...cell.getCellProps()}
                      // @ts-ignore
                      className={clsx(cell.column.parent?.className)}
                    >
                      {cell.render('Cell')}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}

const getTableData = (apiReportResult: OneOfTheConsolidateReport, type: ConsolidateReportKeys): Params[] => {
  let data: Params[] = []

  if (typeof apiReportResult === 'undefined') {
    return data
  }

  const stateNames: Record<string, string | JSX.Element> = {
    total_invites: 'Total invites',
    installs: 'Installs',
    registered: 'Registered',
    verified: 'Verified',
    waiting_list: (
      <>
        Waiting list
        <Tooltip title={'Registered people, who are waiting for acception into club or private invite'}>
          <QuestionCircleOutlined
            style={{
              marginLeft: '5px',
              verticalAlign: 'middle',
            }}
          />
        </Tooltip>
      </>
    ),
    invited: (
      <>
        Invited
        <Tooltip
          title={'People, who were invited. They should open an app and finish the register to become "Verified"'}
        >
          <QuestionCircleOutlined
            style={{
              marginLeft: '5px',
              verticalAlign: 'middle',
            }}
          />
        </Tooltip>
      </>
    ),
    not_invited: (
      <>
        Not invited
        <Tooltip title={'People, who stocked somewhere before waiting list: phone auth, club choosing'}>
          <QuestionCircleOutlined
            style={{
              marginLeft: '5px',
              verticalAlign: 'middle',
            }}
          />
        </Tooltip>
      </>
    ),
    deleted: <>Deleted</>,
    banned: <>Banned</>,
  }

  if (type === 'userStates') {
    const rows: Params = {}
    ;(apiReportResult as ConsolidateReportData<UserStates>).forEach((table, index) => {
      table.rows.forEach((row) => {
        if (!rows[row.user_state]) {
          rows[row.user_state] = {
            name: stateNames[row.user_state] || row.user_state,
          }
        }
        rows[row.user_state][`value${index}`] = row.count
        rows[row.user_state][`additional${index}`] = row.additional
      })
    })
    data = Object.values(rows)
  } else if (type === 'clubParticipantsCount') {
    ;(apiReportResult as ConsolidateReportData<ClubParticipantsCount>).forEach((table, index) => {
      table.rows.forEach((row, rowIndex) => {
        if (!data[rowIndex]) {
          data.push({
            name: row.clubslug,
          })
        }
        data[rowIndex][`value${index}`] = row.new_participants
      })
    })
  } else if (type === 'totalClubParticipants' || type === 'totalEventParticipants' || type === 'totalNewClubs') {
    ;(apiReportResult as ConsolidateReportData<OnlyCount>).forEach((table, index) => {
      table.rows.forEach((row, rowIndex) => {
        if (!data[rowIndex]) {
          data.push({
            name: 'Total',
          })
        }
        data[rowIndex][`value${index}`] = row.count
      })
    })
  } else if (type === 'registeredByCountries') {
    ;(apiReportResult as ConsolidateReportData<RegisteredByCountries>).forEach((table, index) => {
      table.rows.forEach((row, rowIndex) => {
        if (!data[rowIndex]) {
          data.push({
            name: row.country,
          })
        }
        data[rowIndex][`value${index}`] = row.count_users
      })
    })
  } else if (type === 'topIndividualInviters') {
    ;(apiReportResult as ConsolidateReportData<TopIndividualInviters>).forEach((table, index) => {
      table.rows.forEach((row, rowIndex) => {
        if (!data[rowIndex]) {
          data.push({
            name: row.username,
          })
        }
        data[rowIndex][`value${index}`] = row.count_invites
      })
    })
  } else if (type === 'typeOfRooms') {
    ;(apiReportResult as ConsolidateReportData<TypeOfRooms>).forEach((table, index) => {
      table.rows.forEach((row, rowIndex) => {
        if (!data[rowIndex]) {
          data.push({
            name: 'Total',
          })
        }
        data[rowIndex][`private${index}`] = row.private
        data[rowIndex][`public${index}`] = row.public
        data[rowIndex][`total${index}`] = row.total
      })
    })
  } else if (type === 'eventsByCountries') {
    const rows: Params = {}
    const total = {
      name: 'TOTAL',
      private0: 0,
      public0: 0,
    }
    ;(apiReportResult as ConsolidateReportData<EventsByCountries>).forEach((table, index) => {
      table.rows.forEach((row) => {
        if (!rows[row.name]) {
          rows[row.name] = {
            name: row.name,
            index: index,
          }
        }
        rows[row.name][`${row.is_private ? `private` : `public`}${rows[row.name].index}`] = row.count_events || 0
        total.private0 += row.is_private ? row.count_events : 0
        total.public0 += !row.is_private ? row.count_events : 0
      })
    })
    data = Object.values(rows)
    data.unshift(total)
  } else if (type === 'clubEventsCount') {
    ;(apiReportResult as ConsolidateReportData<ClubEventsCount>).forEach((table, index) => {
      table.rows.forEach((row, rowIndex) => {
        if (!data[rowIndex]) {
          data.push({
            name: (
              <>
                {row.title}
                <br /> <span className={global_styles.gray}>{row.slug}</span>
              </>
            ),
          })
        }
        data[rowIndex][`value${index}`] = row.count
      })
    })
  } else if (type === 'totalClubMembers') {
    ;(apiReportResult as ConsolidateReportData<TotalClubMembers>).forEach((table, index) => {
      table.rows.forEach((row, rowIndex) => {
        if (!data[rowIndex]) {
          data.push({
            name: row.title,
          })
        }
        data[rowIndex][`value${index}`] = row.count
      })
    })
  } else if (type === 'invites') {
    const rows: Params = {}
    ;(apiReportResult as ConsolidateReportData<InvitesGroupedByStates>).forEach((table, index) => {
      table.rows.forEach((row) => {
        if (!rows[row.state]) {
          rows[row.state] = {
            name: stateNames[row.state] || row.state,
          }
        }
        rows[row.state][`personal${index}`] = row.personal_invites
        rows[row.state][`club${index}`] = row.club_invites
      })
    })
    data = Object.values(rows)
  } else if (type === 'clubOwnersInvitedBy') {
    ;(apiReportResult as ConsolidateReportData<ClubOwnersInvitedBy>).forEach((table, index) => {
      table.rows.forEach((row, rowIndex) => {
        if (!data[rowIndex]) {
          data.push({})
        }
        data[rowIndex][`invited_by_user${index}`] = row.invited_by_user
        data[rowIndex][`invited_by_club${index}`] = row.invited_by_club
        data[rowIndex][`club_owner_username${index}`] = row.club_owner_username
        data[rowIndex][`owner_club_slug${index}`] = row.owner_club_slug
      })
    })
  }
  return data
}

export default ConsolidateReport
