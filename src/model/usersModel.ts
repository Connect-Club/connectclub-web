import { Club } from '@/model/clubModel'
import { SingleInterestType } from '@/model/interestModel'

export type ShortUserInfo = {
  id: string
  name: string
  surname: string
  avatar: string | null
  username: string
  displayName: string
  description: string
  about: string
  isDeleted: boolean
  createdAt: number
  lastSeen: number
  online: boolean
  devices: string[]
  badges: ['team' | 'press' | 'speaker']
  country: string | null
  city: string | null
  shortBio: string
  longBio: string
  isSuperCreator: boolean
  invitedTo: {
    title: Club['title']
    joinedAt: number
    by: {
      id: string
      avatar: string
      displayName: string
    }
    id: Club['id']
    avatar: Club['avatar']
  }
  memberOf: Array<{
    clubRole: Club['clubRole']
    title: Club['title']
    id: Club['id']
    avatar: Club['avatar']
  }>
  source: string
}
export type User = ShortUserInfo & {
  phone: string
  banComment: string | null
  bannedBy: ShortUserInfo | null
  deleteComment: string | null
  deletedBy: ShortUserInfo | null
  followers: number
  following: number
  freeInvites: number
  interests: Array<SingleInterestType>
  isFollowing: false
  isFollows: false
  joinedBy: ShortUserInfo | null
  state: 'waiting_list' | 'invited' | 'verified' | 'banned' | 'deleted' | 'not_invited'
}

export type Users = {
  items: Array<User>
  lastValue: number
  totalCount: number
}

export type CurrentUser = Omit<
  SearchUser,
  'displayName' | 'followers' | 'following' | 'isDeleted' | 'isFollowing' | 'isFollows' | 'lastSeen' | 'online'
> & {
  state: User['state']
  jabberPassword: null | string
  jabberServer: string
  skipNotificationUntil: number
  language: {
    id: number
    name: string
    isLanguage: boolean
  }
}

export type SearchUser = Omit<
  User,
  | 'description'
  | 'banComment'
  | 'bannedBy'
  | 'deleteComment'
  | 'deletedBy'
  | 'freeInvites'
  | 'state'
  | 'country'
  | 'city'
>
export type SearchUsers = {
  items: Array<SearchUser>
  lastValue: number
}

export type UsersSearchReturn = {
  key: string
  label: string
  value: string
}

export type CleanUserDataType = Omit<
  ShortUserInfo,
  | 'lastSeen'
  | 'description'
  | 'badges'
  | 'devices'
  | 'country'
  | 'city'
  | 'shortBio'
  | 'longBio'
  | 'isSuperCreator'
  | 'memberOf'
  | 'invitedTo'
  | 'source'
>

export type PublicUser = Pick<
  User,
  | 'id'
  | 'avatar'
  | 'name'
  | 'surname'
  | 'displayName'
  | 'about'
  | 'username'
  | 'isDeleted'
  | 'createdAt'
  | 'lastSeen'
  | 'online'
  | 'badges'
  | 'shortBio'
  | 'longBio'
>

export type UserToken = {
  tokenId: string
  title: string
  description?: string
  preview: string
}

export type UserWithScope = CurrentUser & {
  scope: string[]
}
