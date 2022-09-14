import React, { useMemo, useState } from 'react'
import { CellProps, useTable } from 'react-table'
import { Button, Col, DatePicker, Form, Row } from 'antd'
import clsx from 'clsx'
import moment, { Moment } from 'moment'

import global_styles from '@/components/admin/css/admin.module.css'
import styles from '@/components/admin/pages/analytics/analytics.module.css'
import { doRequest } from '@/lib/Api'
import flattenInput from '@/lib/flattenInput'
import { ConsolidateReportData, InvitersReport, TopIndividualInviters } from '@/model/analyticsModel'
import type { FC, Params } from '@/model/commonModel'

type InitialValues = {
  start: Moment | string
  end: Moment | string
}

type TableColumnValues = {
  [key: string]: string | number
}

const Inviters: FC = () => {
  const [isFormLoading, setFormLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState<string[]>([])
  const [reportData, setReportData] = useState<InvitersReport>({} as InvitersReport)

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

    const response = await doRequest<InvitersReport, InvitersReport>({
      endpoint: process.env.NEXT_PUBLIC_API_POST_ANALYTICS_INVITERS!,
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
      <p className={global_styles.h3}>Top user&apos;s inviters</p>

      <Form
        name='inviters-report'
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

type InvitersReportTablesKeys = keyof InvitersReport['tables']
type OneOfTheInvitersReportTable = InvitersReport['tables'][InvitersReportTablesKeys]

const Report: FC<{ data: InvitersReport }> = ({ data }) => {
  const order: Array<{ key: InvitersReportTablesKeys; name: string }> = useMemo(
    () => [
      { key: 'topIndividualInviters', name: 'Top of private inviters' },
      {
        key: 'topIndividualInvitersClub',
        name: 'Top of private club inviters',
      },
    ],
    [],
  )

  return useMemo(
    () => (
      <div className={global_styles.mt_1}>
        {order.map((orderItem) => {
          const tables = data.tables[orderItem.key as InvitersReportTablesKeys]
          return (
            <div className={global_styles.mt_3} key={`${orderItem.key}_parent`}>
              <h3 className={clsx(global_styles.h3)}>{orderItem.name}</h3>
              <div className={'d-flex'}>
                <>
                  {tables?.map((table, index) => (
                    <Table data={[table] as OneOfTheInvitersReportTable} key={`${orderItem.key}_table_${index}`} />
                  ))}
                </>
              </div>
            </div>
          )
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
}>

const Table: FC<{
  data: OneOfTheInvitersReportTable
}> = ({ data }) => {
  const getColumns = useMemo(
    () => () => {
      const columns: TableColumns = [
        {
          Header: '',
          accessor: 'name',
        },
      ]
      const format = 'DD.MM'
      data &&
        data.forEach((table, index) => {
          const header = `${moment(table.date[0]).format(format)} – ${moment(table.date[1]).format(format)}`

          columns.push({
            Header: header,
            className: 'nowrap',
            accessor: `value${index}`,
            Cell: (props: CellProps<TableColumnValues, number>) => {
              return <div className='nowrap'>{props.value}</div>
            },
          })
        })
      return columns
    },
    [data],
  )

  const columns = React.useMemo(() => getColumns(), [getColumns])

  const tableData = React.useMemo(
    () => getTableData(data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    flattenInput(data),
  )

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data: tableData,
  })

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
                  {...column.getHeaderProps()}
                  className={clsx(
                    // @ts-ignore
                    column.parent?.className || column.className,
                  )}
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

const getTableData = (apiReportResult: OneOfTheInvitersReportTable): Params[] => {
  const data: Params[] = []

  if (typeof apiReportResult === 'undefined') {
    return data
  }

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
  return data
}

export default Inviters
