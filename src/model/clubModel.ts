import { SingleInterestType } from '@/model/interestModel'
import { ShortUserInfo, User } from '@/model/usersModel'

export type Club = {
  clubRole: null | 'moderator' | 'owner' | 'member'
  joinRequestStatus: 'moderation' | 'approved' | 'cancelled' | null
  joinRequestId: string
  members: Array<{
    id: number
    avatar: string | null
    displayName: string
  }>
  description: string
  avatar: string | null
  countParticipants: number
  interests: Array<SingleInterestType>
  owner: {
    id: number
    avatar: string | null
    displayName: string
  }
  id: string
  title: string
  slug: string
  createdAt: number
}

export type MyClub = {
  id: Club['id']
  title: Club['title']
}

export type JoinRequests = {
  items: JoinRequest[]
  lastValue: number | null
  totalCount: number
}

export type JoinRequest = {
  user: User
  joinRequestId: Club['joinRequestId']
}

export type Member = ShortUserInfo & {
  clubRole: Club['clubRole']
}

export type Members = {
  items: Member[]
  lastValue: number | null
}

export type Clubs = {
  items: Club[]
  lastValue: number | null
  totalCount: number
}

export type ClubsObject = { [key: string]: Club }

export type ClubOption =
  | {
      id: Club['id']
      slug: Club['slug']
    }
  | ''
