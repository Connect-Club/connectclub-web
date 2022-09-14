import React, { useRef, useState } from 'react'
import { CellProps, useTable } from 'react-table'
import { FunnelPlotOutlined, SolutionOutlined } from '@ant-design/icons'
import { Button, Col, DatePicker, Form, Row } from 'antd'
import clsx from 'clsx'
import moment, { Moment } from 'moment'

import global_styles from '@/components/admin/css/admin.module.css'
import styles from '@/components/admin/pages/analytics/analytics.module.css'
import { doRequest } from '@/lib/Api'
import flattenInput from '@/lib/flattenInput'
import { Loader } from '@/lib/svg'
import { getCellValueWithPercentage } from '@/lib/utils'
import { AppsflyerQR, WeeklyReportResult, WeeklyReportType } from '@/model/analyticsModel'
import type { FC } from '@/model/commonModel'

type InitialValues = {
  start: Moment | string
}

type TableColumnValues = {
  name: string
  week1: number
  week2: number
  week3: number
}

const WeeklyReport: FC = () => {
  const [isFormLoading, setFormLoading] = useState<boolean>(false)
  const [qrIsLoading, setQrIsLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState<string[]>([])
  const [reportData, setReportData] = useState<WeeklyReportType>({} as WeeklyReportType)
  const qrScansFinished = useRef([false, false, false])
  const qrScansTries = useRef(0)

  const initialFormValues: InitialValues = {
    start: moment().startOf('isoWeek'),
  }

  const disabledDateStart = (current: Moment) => {
    return current && current.valueOf() >= moment().valueOf()
  }

  const onSubmit = async (values: InitialValues) => {
    const data = values
    if (data['start'] && typeof data['start'] !== 'string') {
      data['start'] = data['start'].format('YYYY-MM-DD')
    }

    setFormLoading(true)
    setErrors([])

    qrScansTries.current = 0
    qrScansFinished.current = [false, false, false]

    const response = await doRequest<WeeklyReportResult, WeeklyReportResult>({
      endpoint: process.env.NEXT_PUBLIC_API_POST_ANALYTICS_WEEKLY_REPORT!,
      method: 'POST',
      data,
    })

    if (response._cc_errors.length) {
      const responseErrors = response._cc_errors.map((error) => (typeof error !== 'string' ? error.text : error))
      setErrors(responseErrors)
    } else {
      setReportData({
        funnel: response.data.funnel,
        common: response.data.common,
      })
      if (!response.data.qrScansErrors.length) {
        qrScansFinished.current = [true, false, false]
      }
      getQrScans(data['start'])
    }

    setFormLoading(false)
  }

  const getQrScans = (start: string) => {
    const getDates = (): [number, string, string] | [] => {
      let result: [number, string, string] | [] = []
      qrScansFinished.current.forEach((status, index) => {
        if (!status && !result.length) {
          result = [
            index,
            moment(start)
              .subtract(index === 0 ? 21 : index === 1 ? 14 : 7, 'days')
              .format('YYYY-MM-DD'),
            moment(start)
              .subtract(index === 0 ? 15 : index === 1 ? 8 : 1, 'days')
              .format('YYYY-MM-DD'),
          ]
        }
      })
      return result
    }

    const intervalDates = getDates()
    if (qrScansTries.current <= 5 && intervalDates.length === 3) {
      setQrIsLoading(true)
      setTimeout(async () => {
        const response = await doRequest<AppsflyerQR, AppsflyerQR>({
          endpoint: process.env.NEXT_PUBLIC_API_POST_APPSFLYER!,
          method: 'POST',
          data: {
            start: intervalDates[1],
            end: intervalDates[2],
          },
        })
        if (!response._cc_errors.length) {
          if (response.data && !response.data?.qrScansErrors?.length) {
            setReportData((prev) => {
              const newData = { ...prev }
              if (Object.keys(response.data.qrScans).length) {
                const qrScansCount = Object.values(response.data.qrScans).reduce((a, b) => a + b)
                if (newData.funnel.length) {
                  newData.funnel[intervalDates[0]].rows[1]['count'] =
                    Number(newData.funnel[intervalDates[0]].rows[1]['count']) + qrScansCount
                  newData.funnel[intervalDates[0]].rows[1]['qrScans'] = qrScansCount
                }
                if (newData.common.length) {
                  newData.common[intervalDates[0]].rows[1]['count'] =
                    Number(newData.common[intervalDates[0]].rows[1]['count']) + qrScansCount
                  newData.common[intervalDates[0]].rows[1]['qrScans'] = qrScansCount
                }
              }
              return newData
            })
            qrScansFinished.current[intervalDates[0]] = true
          }
        }
        qrScansTries.current++
        getQrScans(start)
      }, 90000)
    } else {
      setQrIsLoading(false)
      if (qrScansFinished.current.some((v) => !v)) {
        setErrors(['QR scans API has issues. Not all dates were processed. Try once again a bit later'])
      }
    }
  }

  return (
    <>
      <p className={global_styles.h3}>Weekly report</p>

      <Form
        name='weekly-report'
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 16 }}
        labelAlign='left'
        onFinish={onSubmit}
        initialValues={initialFormValues}
      >
        <Form.Item label={`Specify end date`} name='start' extra={'From this date the report will be generated'}>
          <DatePicker allowClear={false} disabledDate={disabledDateStart} format='YYYY-MM-DD' />
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
          {reportData.funnel.length > 0 ? (
            <>
              <p className={clsx(global_styles.bold, 'd-flex align-items-center')}>
                <FunnelPlotOutlined style={{ marginRight: '10px' }} /> Funnel of landings: clubs and users
              </p>
              <p>
                This report contains data from club&apos;s landings and user&apos;s landings. <br />
                The report shows the way of users, which start their trip from website landing.
                <br />
                That&apos;s why this report is called &quot;funnel&quot;.
              </p>
              <p>Percentage values count from pageviews.</p>
              <Table data={reportData.funnel} qrIsLoading={qrIsLoading} />
            </>
          ) : (
            <div style={{ color: '#f00' }}>Funnel is empty</div>
          )}
          {reportData.common.length > 0 ? (
            <div className={clsx(global_styles.mt_3, styles.hide_cell_percentage)}>
              <p className={clsx(global_styles.bold, 'd-flex align-items-center')}>
                <SolutionOutlined style={{ marginRight: '10px' }} /> Common total data for all application
              </p>
              <p>
                This report contains data from all application. <br />
                Values are not depend from each other. Just total information for the periods.
              </p>
              <Table data={reportData.common} qrIsLoading={qrIsLoading} />
            </div>
          ) : (
            <div style={{ color: '#f00' }}>Common data is empty</div>
          )}
        </div>
      )}
    </>
  )
}

const Table: FC<{ data: WeeklyReportType['funnel']; qrIsLoading: boolean }> = ({ data, qrIsLoading }) => {
  const columns = React.useMemo(
    () => [
      {
        Header: '',
        accessor: 'name',
      },
      {
        Header: `${moment(data[0].date[0]).format('DD.MM.YYYY')} – ${moment(data[0].date[1]).format('DD.MM.YYYY')}`,
        accessor: 'week1',
        Cell: (props: CellProps<TableColumnValues, number>) => (
          <div className='nowrap'>
            {props.row.index === 1 && (
              <>
                {props.value - (props.row.index === 1 && data[0].rows[1]?.qrScans ? data[0].rows[1]?.qrScans : 0)}
                {` `} +
                {data[0].rows[1]?.qrScans ? (
                  <> {data[0].rows[1]?.qrScans}</>
                ) : qrIsLoading ? (
                  <Loader width={'16px'} height={'16px'} />
                ) : (
                  0
                )}
                {` `} = {` `}
              </>
            )}
            {getCellValueWithPercentage(
              props.value,
              // @ts-ignore
              props.data[0][props.column.id],
            )}
          </div>
        ),
      },
      {
        Header: `${moment(data[1].date[0]).format('DD.MM.YYYY')} – ${moment(data[1].date[1]).format('DD.MM.YYYY')}`,
        accessor: 'week2',
        Cell: (props: CellProps<TableColumnValues, number>) => (
          <div className='nowrap'>
            {props.row.index === 1 && (
              <>
                {props.value - (props.row.index === 1 && data[1].rows[1]?.qrScans ? data[1].rows[1]?.qrScans : 0)}
                {` `} +
                {data[1].rows[1]?.qrScans ? (
                  <> {data[1].rows[1]?.qrScans}</>
                ) : qrIsLoading ? (
                  <Loader width={'16px'} height={'16px'} />
                ) : (
                  0
                )}
                {` `} = {` `}
              </>
            )}
            {getCellValueWithPercentage(
              props.value,
              // @ts-ignore
              props.data[0][props.column.id],
            )}
          </div>
        ),
      },
      {
        Header: `${moment(data[2].date[0]).format('DD.MM.YYYY')} – ${moment(data[2].date[1]).format('DD.MM.YYYY')}`,
        accessor: 'week3',
        Cell: (props: CellProps<TableColumnValues, number>) => (
          <div className='nowrap'>
            {props.row.index === 1 && (
              <>
                {props.value - (props.row.index === 1 && data[2].rows[1]?.qrScans ? data[2].rows[1]?.qrScans : 0)}
                {` `} +
                {data[2].rows[1]?.qrScans ? (
                  <> {data[2].rows[1]?.qrScans}</>
                ) : qrIsLoading ? (
                  <Loader width={'16px'} height={'16px'} />
                ) : (
                  0
                )}
                {` `} = {` `}
              </>
            )}
            {getCellValueWithPercentage(
              props.value,
              // @ts-ignore
              props.data[0][props.column.id],
            )}
          </div>
        ),
      },
    ],
    [data, qrIsLoading],
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tableData = React.useMemo(() => getTableData(data), flattenInput(data))

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    // @ts-ignore
    columns,
    data: tableData,
  })

  return (
    <>
      <table className={styles.table} {...getTableProps()}>
        <thead>
          {/*@ts-ignore*/}
          {headerGroups.map((headerGroup) => (
            // eslint-disable-next-line react/jsx-key
            <tr {...headerGroup.getHeaderGroupProps()}>
              {/*@ts-ignore*/}
              {headerGroup.headers.map((column) => (
                // @ts-ignore
                // eslint-disable-next-line react/jsx-key
                <th
                  {...column.getHeaderProps()}
                  // @ts-ignore
                  className={clsx(column.parent?.className)}
                >
                  {column.render('Header')}
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

const getTableData = (apiReportResult: WeeklyReportType['funnel']) => {
  const getNameByIndex = (index: number) => {
    switch (index) {
      case 0:
        return 'Pageviews'
      case 1:
        return 'Clicks + Scans'
      case 2:
        return 'Installs'
      case 3:
        return 'Registered'
      case 4:
        return 'Verified'
      case 5:
        return 'Joined to clubs'
      case 6:
        return 'Participated in events'
    }
    return ''
  }
  return Object.keys(apiReportResult[0].rows).map((row, index) => ({
    name: getNameByIndex(index),
    week1: Number(apiReportResult[0].rows[index].count) || 0,
    week2: Number(apiReportResult[1].rows[index].count) || 0,
    week3: Number(apiReportResult[2].rows[index].count) || 0,
  }))
}

export default WeeklyReport
