# Frontend of Connect club

Run `yarn dev` for development.

---

## Available pages of the project:

- `/account` - personal account page of each user
- `/admin` - administrative area
- `/club/[slug]` - page with club info
- `/l/[landing_url]` - in admin area you can create any amount of landing pages you want. This is the URL of landing pages
- `/connectcon/[id]` - landing page of festivals and it's schedule. Used only for special events
- `/dao` - landing for DAO
- `/land` - experimenting with ThreeJs for Connect club Metaverse. This is a sketch for designer 
- `/membership/[tokenId]` - page for selling membership tokens
- `/membership/united` - page for selling membership for "United metaverse club"
- `/supercreator` - (deprecated)
- `/room` => `/account/rooms` - room constructor for room owners. Available either from mobile phone or PC
- `/user/[username]` - page with user info
- `/web` - page for entering into web version of application room. If you open share link of the room on web, it will redirect to `/web` page with all necessary query params. Without params you cannot enter the room

## Admin area

Only users with `admin` rights have access to this page. In DB find table `users_roles` and add your user with `role = admin`.

### Users

Page with all application users. Here you can filter, ban, delete users. Also, you can change some user information.

### Rooms

Room constructor - online editor, where you can add images, NFTs and other system objects to the room. They can be dragged, resized.

In application start room, copy link to the room and paste into the input field. `Room name` should be parsed from the link. It looks like `616d39442b972`.

Available objects:
- `Room enterance` - this is the place, where speakers will appear at the room
- `Speaker zone` - in this zone everybody will hear you, when you speak
- `Share screen` - this area will allow you to share your screen on PC with others
- `Timer` - timer, that can be used in events by moderators and event owners
- `Restricted area` - participants of the room will not be allowed to jump into this area
- `Image autofit` - set the dimensions of this zone and try to drag-n-drop your image inside. It will autofit automatically
- `Quiet zone` - in this zone no one will hear the speakers, but you still can communicate with people near to you

### Backgrounds

All application backgrounds. Room constructor is available for backgrounds also. 

### Landing

Fully customizable constructor for landing pages. You can create any amount of pages, which will be available via link `/l/[landing_url]`

### Festival

Page were used for creating festival events

### Clubs

Page with all application clubs. Here you can create/edit clubs, add moderators and accept/decline join requests

### Analytics

All application analytics. 

Amplitude database of the application should parse twice or more times a day. All requests are sent to project DB `amplitude_events`.

Available reports:
- `Overview` - DAU, WAU, MAU
- `Campaign report` - Building of the campaign report
- `Consolidated report` - Full application report
- `Sharing` - Room, event, club sharing analytics
- `Retention` - Users retention, cohorts
- `Push notifications` - Sent, opened, failed, processed notifications
- `Top inviters` - Top inviters among users

### Land (only for demo)

Create/edit Connect club Metaverse parcels.

---

## Application hidden opportunities

This part is not about frontend project. This is project hacks .)

### How to create event for token holders?

1. Create smartcontract erc-721 or erc-1155 and deploy to network
2. In DB find table `token` and specify all information about the token
3. Find table `club_token` and connect token to club
4. In application create club event by admin or moderator, select the token for that event (you cannot use more that one token)
5. Start the room in application

### How to make room always available?

1. Start the event in application
2. Find your event ID in table `event_schedule`
3. In the table `video_room` find your room by `event_schedule_id` and set `always_reopen` to `true` 

### How to make room without listeners popup

1. Start the room in application
2. In the table `video_room` find your `config_id`
3. In the table `video_room_config` find your room by `id` and set `with_speakers` to `false` 