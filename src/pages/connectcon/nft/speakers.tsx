import React from 'react'
import clsx from 'clsx'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import useTranslation from 'next-translate/useTranslation'

import { getFestivalSpeakers } from '@/api/festivalApi'
import styles from '@/components/festival/festival.module.css'
import HeaderNFT081221 from '@/components/festival/HeaderNFT081221'
import Speakers from '@/components/festival/Speakers'
import FestivalLayout from '@/components/layout/FestivalLayout'
import { isDevelopment } from '@/lib/utils'
import { FCWithLayoutParams } from '@/model/commonModel'
import { EventParticipant } from '@/model/eventModel'

export const getStaticProps: GetStaticProps = async () => {
  /* Get scene schedule events by date */
  const response = await getFestivalSpeakers(process.env.NEXT_PUBLIC_FESTIVAL_CODE3!)
  let speakers = response[0]
  const errors = response[1]

  /* Get event time intervals, divided by scenes */
  if (errors.length || !speakers) {
    speakers = []
  }

  return {
    props: {
      speakers,
    },
    revalidate: 60,
  }
}

type Props = {
  speakers: EventParticipant[]
}

const ConnectconSpeakers: FCWithLayoutParams<Props> = ({ speakers }) => {
  const { t } = useTranslation('connectcon/nft/speakers')
  const imageWidth = 320
  const imageHeight = 480
  const ignoreSpeakerIds = ['12232', '10255', '14700', '11599', '9781']

  let eventSpeakers = speakers.map((speaker) => {
    return {
      id: speaker.id,
      image: speaker.avatar
        ? speaker.avatar.replace(':WIDTH', (imageWidth * 3).toString()).replace(':HEIGHT', (imageHeight * 3).toString())
        : '',
      name: speaker.displayName,
      description: speaker.shortBio || '',
    }
  })
  // Production hack to remove user from speakers
  eventSpeakers = eventSpeakers.filter(
    (speaker) => (!isDevelopment && !ignoreSpeakerIds.includes(speaker.id)) || isDevelopment,
  )

  return (
    <>
      <HeaderNFT081221 hideTimeline={true} />
      <Head>
        <title>{t('title')}</title>
        <meta name='description' content={t('description')} />
      </Head>
      <div className={clsx('container', styles.speakers_page)}>
        {eventSpeakers.length > 0 && <Speakers speakers={eventSpeakers} />}
      </div>
    </>
  )
}

ConnectconSpeakers.getLayout = FestivalLayout
ConnectconSpeakers.getLayoutParams = {
  hideHeader: true,
}

export default ConnectconSpeakers
