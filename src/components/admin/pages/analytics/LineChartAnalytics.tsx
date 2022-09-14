import React, { useCallback, useEffect, useMemo, useState } from 'react'
import moment from 'moment-timezone'
import PropTypes from 'prop-types'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { amplitude } from '@/api/amplitudeApi'
import { Loader } from '@/lib/svg'
import { ChartQueryType } from '@/model/analyticsModel'
import { FC } from '@/model/commonModel'

type ChartValue = {
  name: string
  [key: string]: string | number
}

type Props = {
  amplitudeChartId: string
  lineProps?: Array<{
    name: string
    color: string
  }>
  xAxisFormat?: ((i: number, data: string[], timeZone: string) => string) | string
}

const LineChartAnalytics: FC<Props> = ({ amplitudeChartId, lineProps, xAxisFormat = 'YYYY-MM-DD' }) => {
  const timeZone = 'Europe/Moscow'

  const [isLoading, setIsLoading] = useState(true)
  const [dirtyChartData, setDirtyChartData] = useState<ChartQueryType | null>(null)
  const [chartData, setChartData] = useState<ChartValue[]>([])

  // eslint-disable-next-line react/display-name
  const Chart = useMemo(
    () => () =>
      (
        <ResponsiveContainer width='100%' height={400}>
          <LineChart data={chartData} margin={{ top: 30, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid stroke='#ccc' vertical={false} />
            <XAxis dataKey='name' label={''} />
            <YAxis />
            {dirtyChartData?.data?.series &&
              dirtyChartData.data.series.map((line, i) => (
                <Line
                  // @ts-ignore
                  label={<LineLabel />}
                  type='monotone'
                  name={lineProps?.[i]?.name || `line${i}`}
                  dataKey={`line${i}`}
                  key={i}
                  stroke={lineProps?.[i]?.color || `#8884d8`}
                />
              ))}
            <Legend />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      ),
    [chartData, dirtyChartData?.data?.series, lineProps],
  )

  const getData = useCallback(async () => {
    const response = await amplitude.api<ChartQueryType>(`https://amplitude.com/api/3/chart/${amplitudeChartId}/query`)
    setIsLoading(false)
    setDirtyChartData(response)
  }, [amplitudeChartId, setIsLoading, setDirtyChartData])

  const LineLabel = (props: any) => {
    const { x, y, stroke, value } = props

    return (
      <text x={x} y={y} dy={-4} fill={stroke} fontSize={10} textAnchor='middle'>
        {value !== 0 ? value : ''}
      </text>
    )
  }

  useEffect(() => {
    getData().then()
  }, [getData])

  useEffect(() => {
    if (dirtyChartData?.data?.series?.length) {
      const data = Object.keys(dirtyChartData.data.series[0]).map((i) => {
        const value: ChartValue = {
          name:
            typeof xAxisFormat === 'string'
              ? moment(dirtyChartData.data.xValues[Number(i)]).tz(timeZone).format(xAxisFormat)
              : xAxisFormat(Number(i), dirtyChartData.data.xValues, timeZone),
        }
        Object.keys(dirtyChartData.data.series).forEach((k) => {
          value[`line${k}`] = dirtyChartData.data.series[Number(k)][Number(i)].value
        })
        return value
      })

      setChartData(data)
    }
  }, [dirtyChartData?.data?.series, dirtyChartData?.data?.xValues, xAxisFormat])

  return <>{isLoading ? <Loader /> : <Chart />}</>
}

LineChartAnalytics.propTypes = {
  amplitudeChartId: PropTypes.string,
  lineProps: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      color: PropTypes.string,
    }),
  ),
  xAxisFormat: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
}

export default LineChartAnalytics
