import { doRequest } from '@/lib/Api'
import { State } from '@/model/apiModel'
import { Room } from '@/model/roomModel'

export const getRoom = async (name: string): Promise<State<Room>> => {
  return await doRequest<Room>({
    method: 'GET',
    endpoint: process.env.NEXT_PUBLIC_API_GET_ROOM!.replace(/{name}/, name),
  })
}
