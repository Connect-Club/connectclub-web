import { parseStream } from 'fast-csv'

import { AppsflyerQRClicksType } from '@/model/analyticsModel'

export const getAppsflyerQRClicks = async (
  appIds: string[],
  from: string,
  to: string,
): Promise<[AppsflyerQRClicksType, string[]]> => {
  const getAppPullApi = async (appId: string): Promise<AppsflyerQRClicksType> => {
    const stream = await fetch(
      `https://hq.appsflyer.com/export/${appId}/partners_report/v5?api_token=a0652ba7-eecb-454b-819d-bf70efd8c3d1&from=${from}&to=${to}&timezone=Europe%2fMoscow`,
    )
    const body = await stream.body
    return new Promise((resolve, reject) => {
      const results: AppsflyerQRClicksType = {}
      if (body !== null) {
        // @ts-ignore
        parseStream(body)
          .on('data', (row) => {
            if (row[1] === 'QR Club landing page dynamic link (production)' && row?.[2] && row[2].includes('[QR')) {
              if (!results[row[2]]) {
                results[row[2]] = 0
              }
              results[row[2]] += Number(row?.[4]) || 0
            }
            if (row.length === 1) {
              reject(row[0])
            }
          })
          .on('end', () => resolve(results))
      } else {
        resolve(results)
      }
    })
  }

  const result: AppsflyerQRClicksType = {}
  const errors = []

  const mergeUtms = (apiResponse: AppsflyerQRClicksType) => {
    Object.keys(apiResponse).forEach((utm) => {
      if (result[utm] === undefined) {
        result[utm] = 0
      }
      result[utm] += apiResponse[utm]
    })
  }

  for (const appId of appIds) {
    try {
      mergeUtms(await getAppPullApi(appId))
    } catch (e) {
      console.log(e)
      errors.push(appId)
    }
  }

  return [result, errors]
}
