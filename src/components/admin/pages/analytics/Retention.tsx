import React, { useCallback, useEffect, useState } from 'react'
import { CellProps, useTable } from 'react-table'
import { Button, Checkbox, Col, DatePicker, Form, Row, Select } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import clsx from 'clsx'
import union from 'lodash.union'
import { Moment } from 'moment'
import moment, { Moment as MomentTimezone } from 'moment-timezone'

import global_styles from '@/components/admin/css/admin.module.css'
import styles from '@/components/admin/pages/analytics/analytics.module.css'
import { doRequest } from '@/lib/Api'
import flattenInput from '@/lib/flattenInput'
import { RetentionReportType, RetentionReportValues } from '@/model/analyticsModel'
import type { FC, Params } from '@/model/commonModel'

type TableColumnValues = {
  [key: string]: string | number
}

const Retention: FC = () => {
  const [isFormLoading, setFormLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState<string[]>([])
  const [reportData, setReportData] = useState<RetentionReportType>({} as RetentionReportType)
  const [showValues, setShowValues] = useState(false)

  const initialFormValues: Omit<RetentionReportValues, 'date'> & {
    date: [MomentTimezone, MomentTimezone]
  } = {
    date: [moment().startOf('isoWeek'), moment()],
    base: 'custom:user_registered',
    target: ['session_start'],
    time_bucket: 'day',
    buckets_count: 15,
  }

  const disabledDateStart = (current: Moment) => {
    return current && current.valueOf() >= moment().valueOf()
  }

  const fieldIsRequired = {
    required: true,
    message: 'Field is required!',
  }

  const onSubmit = async (values: RetentionReportValues) => {
    const data = {
      ...values,
      date: [values['date'][0].format('YYYY-MM-DD'), values['date'][1].format('YYYY-MM-DD')],
    }

    setFormLoading(true)
    setErrors([])

    const response = await doRequest<RetentionReportType, RetentionReportType>({
      endpoint: process.env.NEXT_PUBLIC_API_POST_ANALYTICS_RETENTION!,
      method: 'POST',
      data,
    })

    if (response._cc_errors.length) {
      const responseErrors = response._cc_errors.map((error) => (typeof error !== 'string' ? error.text : error))
      setErrors(responseErrors)
    } else {
      setReportData(response.data)
    }

    updateTableValues()
    setFormLoading(false)
  }

  const onShowValues = (e: CheckboxChangeEvent) => {
    setShowValues(e.target.checked)
  }

  const updateTableValues = useCallback(() => {
    const valueBlocks = document.querySelectorAll<HTMLSpanElement>(`.${styles.bucket_users}`)
    Array.from(valueBlocks).forEach((obj) => {
      if (showValues) {
        obj.style.display = 'block'
      } else {
        obj.style.display = 'none'
      }
    })
  }, [showValues])

  useEffect(() => {
    updateTableValues()
  }, [showValues, updateTableValues])

  return (
    <>
      <p className={global_styles.h3}>Retention cohorts</p>

      <Form
        name='retention'
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 16 }}
        labelAlign='left'
        onFinish={onSubmit}
        initialValues={initialFormValues}
      >
        <Form.Item
          label={`Specify date interval`}
          name='date'
          rules={[fieldIsRequired]}
          extra={`We will find basic event in this interval`}
        >
          <DatePicker.RangePicker allowClear={false} disabledDate={disabledDateStart} format='YYYY-MM-DD' />
        </Form.Item>

        <Form.Item
          label={`Basic event`}
          name='base'
          extra={`We want to know retention after this event`}
          rules={[fieldIsRequired]}
        >
          <Select placeholder='Select the event' showSearch>
            {basicEvents.map((event) => (
              <Select.Option value={event.key} key={event.key}>
                {event.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label={`Target events`}
          name='target'
          extra={`We want to know if users are coming back and making this events`}
          rules={[fieldIsRequired]}
        >
          <Select placeholder='Select the event' mode={'multiple'}>
            {targetEvents.map((event) => (
              <Select.Option value={event.key} key={event.key}>
                {event.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label={`Time unit buckets`}
          name='time_bucket'
          extra={`Report can be dayly, weekly, monthly`}
          rules={[fieldIsRequired]}
        >
          <Select>
            <Select.Option value={'day'}>Day</Select.Option>
            <Select.Option value={'week'}>Week</Select.Option>
            <Select.Option value={'month'}>Month</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label={`Maximum number of buckets`} name='buckets_count' rules={[fieldIsRequired]}>
          <Select>
            {[10, 15, 20, 30, 50].map((count) => (
              <Select.Option value={count} key={count}>
                {count}
              </Select.Option>
            ))}
          </Select>
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

      {Object.keys(reportData).length > 0 && (
        <div className={global_styles.mt_1}>
          <div className={global_styles.my_1}>
            <Checkbox onChange={onShowValues}>Show values</Checkbox>
          </div>
          <Table data={reportData} />
        </div>
      )}
    </>
  )
}

const Table: FC<{ data: RetentionReportType }> = ({ data }) => {
  const date = data.date

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tableData = React.useMemo(() => getTableData(data), flattenInput(data))

  const columns = React.useMemo(
    () => [
      {
        Header: `${moment(date[0]).format('DD.MM.YYYY')} –  ${moment(date[1]).format('DD.MM.YYYY')}`,
        className: styles.grey,
        columns: [
          {
            Header: 'Date',
            className: styles.grey,
            id: 'date-header',
            columns: [
              {
                Header: '',
                accessor: 'date',
              },
            ],
          },
          {
            Header: 'Size',
            id: 'size-header',
            className: styles.grey,
            columns: [
              {
                Header: '',
                accessor: 'size',
              },
            ],
          },
          {
            Header: `The number of ${data.time_bucket}s later users came back and did target events`,
            id: 'target',
            className: styles.grey,
            columns: Array.from(Array(tableData.maxBucketNumber + 1).keys()).map((index) => ({
              Header: `${index === 0 ? `< 1 ${data.time_bucket}` : index}`,
              accessor: `bucket${index}`,
              Cell: (props: CellProps<TableColumnValues, number>) => {
                return (
                  <>
                    {props.value}
                    {props.value > 0 && '%'}
                    <span className={styles.bucket_users}>
                      {props.data[Number(props.row.id)][`bucket${index}_users`]}
                    </span>
                  </>
                )
              },
            })),
          },
        ],
      },
    ],
    [data.time_bucket, date, tableData.maxBucketNumber],
  )

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data: tableData.data,
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
                  className={clsx(column?.className)}
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
                  let background = 'inherit'
                  if (cell.value !== undefined && cell.column.id.includes('bucket')) {
                    background = lightenDarkenColor(
                      '#085890',
                      parseFloat(cell.value) === 100.0 ? 10 : 20 * (10 - Math.floor(parseFloat(cell.value) / 10)),
                    )
                  }
                  return (
                    // eslint-disable-next-line react/jsx-key
                    <td {...cell.getCellProps()} style={{ background }}>
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

const getTableData = (apiReportResult: RetentionReportType) => {
  const data: Params = {}
  const averageRetention: Params = {
    date: 'Average retention',
    size: 0,
  }
  let i = 0
  let maxBucketNumber = 0

  apiReportResult.rows.forEach((row) => {
    const key = moment(row.cohort_time_bucket).format('MMM DD, YYYY')
    if (!data[key]) {
      i = 0
      data[key] = {}
      averageRetention['size'] += row.total_users
    }
    data[key][`date`] = row.cohort_time_bucket
    data[key][`size`] = row.total_users
    data[key][`bucket${i}_users`] = row.bucket_users
    data[key][`bucket${i}`] = row.percentage.toFixed(2)

    if (!averageRetention[`bucket${i}_amplitude_ids`]) {
      averageRetention[`bucket${i}_amplitude_ids`] = []
    }

    averageRetention[`bucket${i}_amplitude_ids`] = union(
      averageRetention[`bucket${i}_amplitude_ids`],
      row.amplitude_ids,
    )

    maxBucketNumber = Math.max(i, maxBucketNumber)
    i++
  })

  if (maxBucketNumber) {
    for (let i = 0; i <= maxBucketNumber; i++) {
      averageRetention[`bucket${i}_users`] = averageRetention[`bucket${i}_amplitude_ids`].length
      delete averageRetention[`bucket${i}_amplitude_ids`]
      averageRetention[`bucket${i}`] = (
        (averageRetention[`bucket${i}_users`] * 100) /
        averageRetention['size']
      ).toFixed(2)
    }
  }

  const format =
    apiReportResult.time_bucket === 'day'
      ? 'MMM DD, YYYY'
      : apiReportResult.time_bucket === 'week'
      ? 'DD.MM'
      : 'MM.YYYY'
  const dirtyData = Object.values(data)
  const tableData = dirtyData.map((row, index) => {
    let header =
      moment(row.date).valueOf() < moment(apiReportResult.date[0]).valueOf()
        ? moment(apiReportResult.date[0]).format(format)
        : moment(row.date).format(format)
    if (apiReportResult.time_bucket !== 'day') {
      header += ` – `
      if (dirtyData[index + 1]) {
        header += moment(dirtyData[index + 1].date).format(format)
      } else {
        header += moment(apiReportResult.date[1]).format(format)
      }
    }
    return { ...row, date: header }
  })
  tableData.unshift(averageRetention)

  return { data: tableData, maxBucketNumber }
}

const lightenDarkenColor = (col: string, amt: number) => {
  let usePound = false

  if (col[0] == '#') {
    col = col.slice(1)
    usePound = true
  }

  const num = parseInt(col, 16)

  let r = (num >> 16) + amt

  if (r > 255) {
    r = 255
  } else if (r < 0) {
    r = 0
  }

  let b = ((num >> 8) & 0x00ff) + amt

  if (b > 255) {
    b = 255
  } else if (b < 0) {
    b = 0
  }

  let g = (num & 0x0000ff) + amt

  if (g > 255) {
    g = 255
  } else if (g < 0) {
    g = 0
  }

  return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16)
}

const amplitudeEvents = [
  'allow_contacts_allow_click',
  'allow_contacts_deny_click',
  'allow_contacts_screen_open',
  'allow_contacts_skip_click',
  'allow_notifications_screen_open',
  'api.change_state',
  'api.club.member_joined',
  'api.create_invite',
  'api.great_or_equal.five_minutes',
  'api.initial_state',
  'api.participant.connect_more_two_minutes',
  'api.participant.room_connected',
  'api.special_test_mark',
  'api.user.first_install',
  'api.user.reinstall',
  'api.user_registered',
  'app_background',
  'app_foreground',
  'app_start',
  'appsflyer_deeplink_install',
  'appsflyer_deeplink_open',
  'bio_link_open',
  'camera_access_cancel',
  'camera_access_ok',
  'camera_access_open',
  'choose_language_screen_open',
  'click_admin_back_to_stage_button',
  'click_admin_raised_hands_button',
  'click_choose_emoji_button',
  'click_collapse_room_button',
  'click_emoji_button',
  'click_hand_down_button',
  'click_invite_friends_button',
  'click_leave_collapsed_room_button',
  'click_leave_room_button',
  'click_manage_room_button',
  'click_raise_hand_button',
  'click_share_room_link',
  'click_take_screenshot_button',
  'click_toggle_audio_button',
  'click_toggle_camera_button',
  'click_toggle_video_button',
  'click_video_screen_fullscreen',
  'club_landing.close',
  'club_landing.open_app',
  'club_landing.pageview',
  'club_landing.pageview_three_seconds',
  'club_screen_open',
  'club_view_event_member_click',
  'club_view_events_swipe',
  'club_view_join_click',
  'club_view_members_click',
  'club_view_owner_click',
  'club_view_share_click',
  'club_view_show_event_click',
  'confirm_code_fail',
  'confirm_code_input_click',
  'confirm_code_paste_click',
  'confirm_code_resend_click',
  'confirm_code_screen_open',
  'confirm_code_success',
  'contacts_access_cancel',
  'contacts_access_fail',
  'contacts_access_ok',
  'contacts_access_open',
  'contacts_access_success',
  'dirty_first_install',
  'event_card_add_to_calendar',
  'event_card_copy_link',
  'event_card_host_club_click',
  'event_card_share_click',
  'event_card_speaker_click',
  'event_ring_subscribe_click',
  'event_ring_unsubscribe_click',
  'explore_clubs_screen_open',
  'explore_open_club_profile',
  'explore_open_person_profile',
  'explore_recommended_clubs_screen_open',
  'explore_recommended_people_screen',
  'explore_recommended_people_scroll',
  'follow_friends_follow_click',
  'follow_friends_no_one_click',
  'follow_friends_remove',
  'follow_friends_screen_open',
  'follow_friends_select',
  'follow_people_all_click',
  'follow_people_follow_click',
  'follow_people_individually_click',
  'follow_people_no_one_click',
  'follow_people_remove',
  'follow_people_screen_open',
  'follow_people_select',
  'init',
  'interests_find_people_click',
  'interests_remove',
  'interests_screen_open',
  'interests_select',
  'interests_skip_click',
  'landing.test',
  'main_feed_event_host_club_click',
  'main_feed_events_swipe',
  'main_feed_show_event_click',
  'name_back_click',
  'name_first_click',
  'name_last_click',
  'name_next_click',
  'name_next_fail',
  'name_screen_open',
  'nft_test_club_landing.close',
  'nft_test_club_landing.open_app',
  'nft_test_club_landing.pageview',
  'notifications_access_cancel',
  'notifications_access_ok',
  'notifications_access_open',
  'phone_country_select_click',
  'phone_country_select_search_click',
  'phone_fail',
  'phone_input_click',
  'phone_next_click',
  'phone_screen_open',
  'photo_camera_click',
  'photo_change_click',
  'photo_change_fail',
  'photo_change_success',
  'photo_library_click',
  'photo_screen_open',
  'photo_skip_click',
  'profile_connect_pressed',
  'push_notifications_enable',
  'push_notifications_pause_choose_time',
  'push_notifications_pause_day',
  'push_notifications_pause_hour',
  'push_notifications_pause_week',
  'push_send_fail',
  'registration_joined_by_screen_open',
  'room_screen_open',
  'session_start',
  'show_upcoming_event_sheet',
  'start_page_open',
  'session_end',
  'test.env',
  'test.open_app',
  'test_club_landing.close',
  'test_club_landing.pageview',
  'upcoming_event_member_click',
  'upcoming_show_event_click',
  'user_landing.open_app',
  'user_landing.pageview',
  'user_landing.pageview_three_seconds',
  'username_back_click',
  'username_fail',
  'username_input_click',
  'username_next_click',
  'username_screen_open',
  'waiting_invite_club_screen_open',
  'waiting_invite_screen_open',
  'welcome_get_username_click',
  'welcome_screen_open',
  'welcome_set_bio_screen_open',
  'welcome_signin_click',
]
const predefinedBasicEvents = [
  {
    name: 'User registered and verified',
    key: 'custom:user_registered',
  },
  {
    name: 'Participated in event',
    key: 'api.participant.room_connected',
  },
]
const basicEvents = [
  ...predefinedBasicEvents,
  ...amplitudeEvents.reduce((accum, curV) => {
    if (!predefinedBasicEvents.find((event) => event.key === curV)) {
      accum.push({ name: curV, key: curV })
    }
    return accum
  }, [] as Array<{ key: string; name: string }>),
]

const predefinedTargetEvents = [
  {
    name: 'Any new session event',
    key: 'session_start',
  },
  {
    name: 'Any event',
    key: 'custom:any_event',
  },
  {
    name: 'Participated in event',
    key: 'api.participant.room_connected',
  },
]

const targetEvents = [
  ...predefinedTargetEvents,
  ...amplitudeEvents.reduce((accum, curV) => {
    if (!predefinedTargetEvents.find((event) => event.key === curV)) {
      accum.push({ name: curV, key: curV })
    }
    return accum
  }, [] as Array<{ key: string; name: string }>),
]

export default Retention
