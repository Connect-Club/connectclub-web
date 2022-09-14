import React, { useRef, useState } from 'react'
import { CellProps, useSortBy, useTable } from 'react-table'
import { Button, Checkbox, Col, DatePicker, Form, Input, Row } from 'antd'
import clsx from 'clsx'
import moment, { Moment } from 'moment'

import global_styles from '@/components/admin/css/admin.module.css'
import styles from '@/components/admin/pages/analytics/analytics.module.css'
import ClubSearch from '@/components/admin/pages/club/ClubSearch'
import { doRequest } from '@/lib/Api'
import flattenInput from '@/lib/flattenInput'
import { Loader } from '@/lib/svg'
import { getCellValueWithPercentage } from '@/lib/utils'
import { AppsflyerQR, ReportDataType } from '@/model/analyticsModel'
import type { FC } from '@/model/commonModel'

type InitialValues = {
  utm_campaign: string
  start: Moment | string
  end: Moment | string
  club: string
  filter: {
    platform: string[]
  }
}

type TableColumnValues = {
  utm: string
  pageview_total: number
  pageview_desktop: number
  pageview_mobile: number
  open_app_total: number
  open_app_desktop: number
  open_app_mobile: number
  install: number
  registered: number
  participated_in_event: number
  install_qr?: number
  registered_qr?: number
  participated_in_event_qr?: number
}

type TableCellValues = {
  [key in keyof TableColumnValues]: {
    output: string | JSX.Element
    value: number
    qr?: number
  }
}

const CampaignReport: FC = () => {
  const [isFormLoading, setFormLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState<string[]>([])
  const [reportData, setReportData] = useState<ReportDataType>({} as ReportDataType)
  const [qrIsLoading, setQrIsLoading] = useState<boolean>(false)
  const qrScansTries = useRef(0)
  const qrScansFinished = useRef(false)

  const initialFormValues: InitialValues = {
    utm_campaign: '',
    start: moment().startOf('isoWeek'),
    end: moment(),
    club: '',
    filter: {
      platform: ['desktop', 'mobile'],
    },
  }

  const disabledDateStart = (current: Moment) => {
    return current && current.valueOf() >= moment().valueOf()
  }
  const disabledDateEnd = (current: Moment) => {
    return current && current.valueOf() >= moment().add(1, 'days').valueOf()
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

    qrScansTries.current = 0
    qrScansFinished.current = false

    const response = await doRequest<ReportDataType, ReportDataType>({
      endpoint: process.env.NEXT_PUBLIC_API_POST_ANALYTICS!,
      method: 'POST',
      data,
    })

    if (response._cc_errors.length) {
      const responseErrors = response._cc_errors.map((error) => (typeof error !== 'string' ? error.text : error))
      setErrors(responseErrors)
    } else {
      setReportData(response.data)
      if (response && !response?.data?.qrScansErrors?.length) {
        qrScansFinished.current = true
      }
      getQrScans(data['start'], data['end'])
    }

    setFormLoading(false)
  }

  const getQrScans = (start: string, end: string) => {
    if (qrScansTries.current <= 5 && !qrScansFinished.current) {
      setQrIsLoading(true)
      setTimeout(async () => {
        const response = await doRequest<AppsflyerQR, AppsflyerQR>({
          endpoint: process.env.NEXT_PUBLIC_API_POST_APPSFLYER!,
          method: 'POST',
          data: {
            start: start,
            end: end,
          },
        })
        if (!response._cc_errors.length) {
          if (response.data && !response.data?.qrScansErrors?.length) {
            setReportData((prev) => {
              const newData = { ...prev }
              if (Object.keys(response.data.qrScans).length) {
                Object.keys(newData.result).forEach((utm) => {
                  if (response.data.qrScans?.[`${utm}[QR]`]) {
                    if (newData.result[utm].open_app) {
                      newData.result[utm].open_app!.desktop = response.data.qrScans?.[`${utm}[QR]`]
                      newData.result[utm].open_app!.total += response.data.qrScans?.[`${utm}[QR]`]
                    } else {
                      newData.result[utm]['open_app'] = {
                        desktop: response.data.qrScans?.[`${utm}[QR]`],
                        mobile: 0,
                        platform: {},
                        total: response.data.qrScans?.[`${utm}[QR]`],
                      }
                    }
                  }
                })
              }
              return newData
            })
            qrScansFinished.current = true
          }
        }
        qrScansTries.current++
        getQrScans(start, end)
      }, 90000)
    } else {
      setQrIsLoading(false)
      if (!qrScansFinished.current) {
        setErrors(['QR scans API has issues. Not all dates were processed. Try once again a bit later'])
      }
    }
  }

  return (
    <>
      <p className={global_styles.h3}>Campaign report</p>

      <Form
        name='report'
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 16 }}
        labelAlign='left'
        onFinish={onSubmit}
        initialValues={initialFormValues}
      >
        <Form.Item
          label={'UTM campaign'}
          name='utm_campaign'
          extra={"Specify values, which should contains. Use commas to separate utm's"}
        >
          <Input />
        </Form.Item>
        <Form.Item label={'Date start'} name='start'>
          <DatePicker
            allowClear={true}
            format='YYYY-MM-DD HH:mm'
            showTime={{ format: 'HH:mm' }}
            disabledDate={disabledDateStart}
          />
        </Form.Item>
        <Form.Item label={'Date end'} name='end' extra={'This day will not be included'}>
          <DatePicker
            allowClear={false}
            disabledDate={disabledDateEnd}
            format='YYYY-MM-DD HH:mm'
            showTime={{ format: 'HH:mm' }}
          />
        </Form.Item>

        <Form.Item label={'Specify club'} name='club'>
          <ClubSearch
            allowClear
            selectOptionValue={(club) => JSON.stringify({ id: club.id, slug: club.slug })}
            labelInValue={false}
            limit={40}
          />
        </Form.Item>

        <Form.Item label='Specify the platforms' name={['filter', 'platform']}>
          <Checkbox.Group
            options={[
              { label: 'Desktop', value: 'desktop' },
              { label: 'Mobile', value: 'mobile' },
            ]}
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

      {qrIsLoading && (
        <div className={global_styles.info_block}>
          <Loader width={'16px'} height={'16px'} />
          {` `}
          Wait, please, information about QR-scans is loading. It will take about 5 minutes
        </div>
      )}

      {Object.keys(reportData).length > 0 && (
        <div className={global_styles.mt_1}>
          {Object.keys(reportData.result).length > 0 ? (
            <>
              <p>
                This report contains data about campaigns. <br />
                Landing pageview and landing click/scan contains data from club&apos;s landings (user&apos;s landings
                are not included).
                <br />
                QR values in columns &quot;Installs&quot;, &quot;Registered&quot; and &quot;Participated in event&quot;
                are included at the total value above them.
                <br />
                First percentage value in brackets is the value from the &quot;landing pageview&quot;. Second percentage
                value in brackets is the value from the total value of the column.
              </p>
              <Table date={reportData.date} result={reportData.result} />
            </>
          ) : (
            <div style={{ color: '#f00' }}>Empty data</div>
          )}
        </div>
      )}
    </>
  )
}

const Table: FC<Omit<ReportDataType, 'qrScansErrors'>> = ({ date, result }) => {
  const columns = React.useMemo(
    () => [
      {
        Header: `${moment(date[0]).format('DD.MM.YYYY')} –  ${moment(date[1]).format('DD.MM.YYYY')}`,
        columns: [
          {
            Header: '',
            id: 'empty-h',
            columns: [
              {
                Header: 'UTM',
                accessor: 'utm',
                Cell: (props: CellProps<TableColumnValues, string>) => {
                  const utm = props.value
                    .replace('[t.co]', '[Twitter]')
                    .replace('[app.connect.club]', '[Deeplink without utm]')
                  let value = <>{utm}</>
                  if (utm.includes('without_utm')) {
                    value = (
                      <>
                        <div>No UTM</div>
                        {utm.replace('without_utm', ``)}
                      </>
                    )
                  }
                  if (utm.includes('home')) {
                    value = (
                      <>
                        <div>connect.club homepage</div>
                        {utm.replace('home', ``)}
                      </>
                    )
                  }
                  return value
                },
              },
            ],
          },
          {
            Header: 'Landing pageview',
            columns: [
              {
                Header: 'Total',
                accessor: 'pageview_total',
              },
              {
                Header: 'Desktop',
                accessor: 'pageview_desktop',
                Cell: (props: CellProps<TableColumnValues, number>) => (
                  <div className='nowrap'>
                    {getCellValueWithPercentage(props.value, props.row.original.pageview_total)}
                  </div>
                ),
              },
              {
                Header: 'Mobile',
                accessor: 'pageview_mobile',
                Cell: (props: CellProps<TableColumnValues, number>) => (
                  <div className='nowrap'>
                    {getCellValueWithPercentage(props.value, props.row.original.pageview_total)}
                  </div>
                ),
              },
            ],
          },
          {
            Header: '',
            className: styles.colored_cell,
            id: 'empty',
            columns: [{ Header: '', id: 'empty-inside' }],
          },
          {
            Header: 'Landing click/QR scan',
            columns: [
              {
                Header: 'Total',
                accessor: 'open_app_total',
                Cell: (props: CellProps<TableColumnValues, number>) => (
                  <div className='nowrap'>
                    {getCellValueWithPercentage(props.value, props.row.original.pageview_total)}
                  </div>
                ),
              },
              {
                Header: 'QR scan',
                accessor: 'open_app_desktop',
                Cell: (props: CellProps<TableColumnValues, number>) => (
                  <div className='nowrap'>
                    {getCellValueWithPercentage(
                      props.value,
                      props.row.original.pageview_total,
                      props.row.original.open_app_total,
                    )}
                  </div>
                ),
              },
              {
                Header: 'Mobile',
                accessor: 'open_app_mobile',
                Cell: (props: CellProps<TableColumnValues, number>) => (
                  <div className='nowrap'>
                    {getCellValueWithPercentage(
                      props.value,
                      props.row.original.pageview_total,
                      props.row.original.open_app_total,
                    )}
                  </div>
                ),
              },
            ],
          },
          {
            Header: '',
            className: styles.colored_cell,
            id: 'empty2',
            columns: [{ Header: '', id: 'empty-inside2' }],
          },
          {
            Header: '',
            id: 'empty-h2',
            columns: [
              {
                Header: 'Installs',
                accessor: 'install',
                Cell: (props: CellProps<TableColumnValues, number>) => (
                  <div className='nowrap'>
                    {getCellValueWithPercentage(props.value, props.row.original.pageview_total, undefined)}
                    {props.row.original?.install_qr && props.row.original.install_qr > 0 ? (
                      <div>
                        qr:{' '}
                        {getCellValueWithPercentage(
                          props.row.original.install_qr,
                          props.row.original.pageview_total,
                          props.value,
                        )}
                      </div>
                    ) : undefined}
                  </div>
                ),
              },
            ],
          },
          {
            Header: '',
            className: styles.colored_cell,
            id: 'empty3',
            columns: [{ Header: '', id: 'empty-inside3' }],
          },
          {
            Header: '',
            id: 'empty-h3',
            columns: [
              {
                Header: 'Verified',
                accessor: 'registered',
                Cell: (props: CellProps<TableColumnValues, number>) => (
                  <div className='nowrap'>
                    {getCellValueWithPercentage(props.value, props.row.original.pageview_total, undefined, [
                      props.row.original.install,
                    ])}
                    {props.row.original?.registered_qr && props.row.original.registered_qr > 0 ? (
                      <div>
                        qr:{' '}
                        {getCellValueWithPercentage(
                          props.row.original.registered_qr,
                          props.row.original.pageview_total,
                          props.value,
                        )}
                      </div>
                    ) : undefined}
                  </div>
                ),
              },
            ],
          },
          {
            Header: '',
            className: styles.colored_cell,
            id: 'empty5',
            columns: [{ Header: '', id: 'empty-inside5' }],
          },
          {
            Header: '',
            id: 'empty-h4',
            columns: [
              {
                Header: 'Participated in event',
                accessor: 'participated_in_event',
                Cell: (props: CellProps<TableColumnValues, number>) => (
                  <div className='nowrap'>
                    {getCellValueWithPercentage(props.value, props.row.original.pageview_total, undefined, [
                      props.row.original.install,
                      props.row.original.registered,
                    ])}
                    {props.row.original?.participated_in_event_qr && props.row.original.participated_in_event_qr > 0 ? (
                      <div>
                        qr:{' '}
                        {getCellValueWithPercentage(
                          props.row.original.participated_in_event_qr,
                          props.row.original.pageview_total,
                          props.value,
                        )}
                      </div>
                    ) : undefined}
                  </div>
                ),
              },
            ],
          },
        ],
      },
    ],
    [date],
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = React.useMemo(() => getTableData(result), flattenInput(result))

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data,
    },
    useSortBy,
  )

  prepareRow(rows[0])
  const totalRowData = React.useMemo(
    () => getTableTotalRow(result),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    flattenInput(result),
  )

  return (
    <>
      <table className={styles.table} {...getTableProps()}>
        <thead>
          {/*@ts-ignore*/}
          {headerGroups.map((headerGroup) => (
            // eslint-disable-next-line react/jsx-key
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                // @ts-ignore
                // eslint-disable-next-line react/jsx-key
                <th
                  // @ts-ignore
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  // @ts-ignore
                  title={column.canSort ? 'Sort the column' : ''}
                  className={clsx(
                    // @ts-ignore
                    column.parent?.className || column?.className,
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
          <tr>
            {rows[0].cells.map((cell, i) => (
              <td
                key={`td-total-${i}`}
                className={clsx(
                  // @ts-ignore
                  cell.column.parent?.className,
                  global_styles.bold,
                )}
              >
                {/*@ts-ignore*/}
                {totalRowData?.[cell.column.id]?.output || ''}
              </td>
            ))}
          </tr>
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
                      className={clsx(
                        // @ts-ignore
                        cell.column.parent?.className,
                        cell.column.id === 'utm' ? styles.utm_cell : undefined,
                      )}
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

const getTableData = (apiReportResult: ReportDataType['result']) => {
  return Object.keys(apiReportResult).map((utm) => ({
    utm: utm === '(none)' ? '<empty>' : utm,
    pageview_total: apiReportResult[utm]?.pageview?.total || 0,
    pageview_desktop: apiReportResult[utm]?.pageview?.desktop || 0,
    pageview_mobile: apiReportResult[utm]?.pageview?.mobile || 0,
    open_app_total: apiReportResult[utm]?.open_app?.total || 0,
    open_app_desktop: apiReportResult[utm]?.open_app?.desktop || 0,
    open_app_mobile: apiReportResult[utm]?.open_app?.mobile || 0,
    install: apiReportResult[utm]?.install?.total || 0,
    install_qr: apiReportResult[utm]?.install?.qr || 0,
    registered: apiReportResult[utm]?.registered?.total || 0,
    participated_in_event: apiReportResult[utm]?.participated_in_event?.total || 0,
  }))
}

const getTableTotalRow = (apiReportResult: ReportDataType['result']): TableCellValues => {
  const result: TableCellValues = {
    utm: { value: 0, output: 'TOTAL' },
    pageview_total: { value: 0, output: '' },
    pageview_desktop: { value: 0, output: '' },
    pageview_mobile: { value: 0, output: '' },
    open_app_total: { value: 0, output: '' },
    open_app_desktop: { value: 0, output: '' },
    open_app_mobile: { value: 0, output: '' },
    install: { value: 0, output: '', qr: 0 },
    registered: { value: 0, output: '', qr: 0 },
    participated_in_event: { value: 0, output: '', qr: 0 },
  }
  Object.keys(apiReportResult).forEach((utm) => {
    result['pageview_total']['value'] += apiReportResult[utm]?.pageview?.total || 0
    result['pageview_desktop']['value'] += apiReportResult[utm]?.pageview?.desktop || 0
    result['pageview_mobile']['value'] += apiReportResult[utm]?.pageview?.mobile || 0
    result['open_app_total']['value'] += apiReportResult[utm]?.open_app?.total || 0
    result['open_app_desktop']['value'] += apiReportResult[utm]?.open_app?.desktop || 0
    result['open_app_mobile']['value'] += apiReportResult[utm]?.open_app?.mobile || 0
    result['install']['value'] += apiReportResult[utm]?.install?.total || 0
    result['install']['qr']! += apiReportResult[utm]?.install?.qr || 0
    result['registered']['value'] += apiReportResult[utm]?.registered?.total || 0
    result['registered']['qr']! += apiReportResult[utm]?.registered?.qr || 0
    result['participated_in_event']['value'] += apiReportResult[utm]?.participated_in_event?.total || 0
    result['participated_in_event']['qr']! += apiReportResult[utm]?.participated_in_event?.qr || 0
  })

  result['pageview_total']['output'] = String(result['pageview_total']['value'])
  result['pageview_desktop']['output'] = (
    <div className='nowrap'>
      {getCellValueWithPercentage(result['pageview_desktop']['value'], result['pageview_total']['value'])}
    </div>
  )
  result['pageview_mobile']['output'] = (
    <div className='nowrap'>
      {getCellValueWithPercentage(result['pageview_mobile']['value'], result['pageview_total']['value'])}
    </div>
  )
  result['open_app_total']['output'] = (
    <div className='nowrap'>
      {getCellValueWithPercentage(result['open_app_total']['value'], result['pageview_total']['value'])}
    </div>
  )
  result['open_app_desktop']['output'] = (
    <div className={'nowrap'}>
      {getCellValueWithPercentage(
        result['open_app_desktop']['value'],
        result['pageview_total']['value'],
        result['open_app_total']['value'],
      )}
    </div>
  )
  result['open_app_mobile']['output'] = (
    <div className={'nowrap'}>
      {getCellValueWithPercentage(
        result['open_app_mobile']['value'],
        result['pageview_total']['value'],
        result['open_app_total']['value'],
      )}
    </div>
  )
  result['install']['output'] = (
    <div className={'nowrap'}>
      {getCellValueWithPercentage(result['install']['value'], result['pageview_total']['value'], undefined, [
        result['pageview_total']['value'],
        result['open_app_total']['value'],
      ])}
      {result['install']['qr'] && result['install']['qr'] > 0 ? (
        <div>
          qr:{' '}
          {getCellValueWithPercentage(
            result['install']['qr'],
            result['pageview_total']['value'],
            result['install']['value'],
          )}
        </div>
      ) : undefined}
    </div>
  )

  result['registered']['output'] = (
    <div className={'nowrap'}>
      {getCellValueWithPercentage(result['registered']['value'], result['pageview_total']['value'], undefined, [
        result['pageview_total']['value'],
        result['open_app_total']['value'],
      ])}
      {result['registered']['qr'] && result['registered']['qr'] > 0 ? (
        <div>
          qr:{' '}
          {getCellValueWithPercentage(
            result['registered']['qr'],
            result['pageview_total']['value'],
            result['registered']['value'],
          )}
        </div>
      ) : undefined}
    </div>
  )

  result['participated_in_event']['output'] = (
    <div className={'nowrap'}>
      {getCellValueWithPercentage(
        result['participated_in_event']['value'],
        result['pageview_total']['value'],
        undefined,
        [result['pageview_total']['value'], result['open_app_total']['value'], result['registered']['value']],
      )}
      {result['participated_in_event']['qr'] && result['participated_in_event']['qr'] > 0 ? (
        <div>
          qr:{' '}
          {getCellValueWithPercentage(
            result['participated_in_event']['qr'],
            result['pageview_total']['value'],
            result['participated_in_event']['value'],
          )}
        </div>
      ) : undefined}
    </div>
  )

  return result
}

export default CampaignReport
