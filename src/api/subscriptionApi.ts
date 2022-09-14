import moment from 'moment-timezone'

import { doRequest } from '@/lib/Api'
import { ReturnUseApiResponse, ReturnUseApiResponseItems, useApiResponse, useApiResponseItems } from '@/lib/useApi'
import { State } from '@/model/apiModel'
import { SubscriptionEvent } from '@/model/eventModel'
import { Subscription, SubscriptionChart, SubscriptionSummary } from '@/model/subscriptionModel'

export const useSupercreatorSubscriptions = (id = ''): ReturnUseApiResponseItems<Subscription> => {
  const url =
    id.length > 0
      ? process.env.NEXT_PUBLIC_API_GET_USER_SUBSCRIPTIONS! + '?id=' + encodeURIComponent(id)
      : process.env.NEXT_PUBLIC_API_GET_MY_SUBSCRIPTIONS!
  return useApiResponseItems<Subscription>(url)
}

export const useSubscriptionEvents = (id: string): ReturnUseApiResponseItems<SubscriptionEvent> => {
  return useApiResponseItems<SubscriptionEvent>(
    process.env.NEXT_PUBLIC_API_GET_SUBSCRIPTION_EVENTS!.replace(/{id}/, id),
  )
}

export const useSubscription = (id: string): ReturnUseApiResponse<Subscription> => {
  return useApiResponse<Subscription>(process.env.NEXT_PUBLIC_API_GET_SUBSCRIPTION!.replace(/{id}/, id))
}

export const useSubscriptionSummary = (id: string): ReturnUseApiResponse<SubscriptionSummary> => {
  return useApiResponse<SubscriptionSummary>(process.env.NEXT_PUBLIC_API_GET_SUBSCRIPTION_SUMMARY!.replace(/{id}/, id))
}

export const useSubscriptionChart = (
  id: string,
  dateStart = 0,
  dateEnd = 0,
  timeZone = 'Europe/Moscow',
  overview: 'day' | 'month' = 'day',
  type: 'quantity' | 'sum' = 'quantity',
): ReturnUseApiResponse<SubscriptionChart> => {
  if (!dateStart && !dateEnd) {
    const dateNowObj = moment().tz(timeZone)
    dateEnd = Math.round(dateNowObj.utc().valueOf() / 1000)
    dateStart = Math.round(dateNowObj.subtract(30, 'days').utc().valueOf() / 1000)
  }

  const postData = {
    id,
    dateStart: dateStart.toString(),
    dateEnd: dateEnd.toString(),
    timeZone,
    overview,
    type,
  }

  return useApiResponse<SubscriptionChart>(
    process.env.NEXT_PUBLIC_API_GET_SUBSCRIPTION_CHART!.replace(/{id}/, id),
    postData,
  )
}

export const getSubscription = async (id: string): Promise<State<Subscription>> => {
  return await doRequest<Subscription>({
    method: 'GET',
    endpoint: process.env.NEXT_PUBLIC_API_GET_SUBSCRIPTION!.replace(/{id}/, id),
  })
}
