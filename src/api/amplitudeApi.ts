import { doRequest } from '@/lib/Api'
import { SegmentationType } from '@/model/analyticsModel'
import { AmplitudeApiEventParams, AmplitudeApiEventType } from '@/model/analyticsModel'
import { Params } from '@/model/commonModel'

class AmplitudeApi {
  async api<R>(
    endpoint: string,
    params?: { method?: 'GET' | 'POST'; data?: Params; headers?: Params },
  ): Promise<R | null> {
    const response = await doRequest<R, R>({
      endpoint: process.env.NEXT_PUBLIC_ROOT_PATH + process.env.NEXT_PUBLIC_API_POST_AMPLITUDE!,
      method: 'POST',
      data: {
        endpoint,
        method: params?.method || 'GET',
        data: params?.data || {},
        headers: params?.headers || {},
      },
    })

    return response.data
  }

  async segmentation(event: AmplitudeApiEventType, params: AmplitudeApiEventParams) {
    return await this.api<SegmentationType>('https://amplitude.com/api/2/events/segmentation', {
      data: Object.assign(
        {},
        {
          e: JSON.stringify(event),
        },
        params,
      ),
    })
  }
}

export const amplitude = new AmplitudeApi()
