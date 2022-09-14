import React from 'react'
import clsx from 'clsx'
import Image from 'next/image'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'

import styles from '@/components/festival/festival.module.css'
import { FC } from '@/model/commonModel'
import noImage from '@/public/img/svg/no-image.svg'

type Props = {
  speakers: Array<{
    image: string
    name: string
    description: string
    anchor?: string
  }>
  activeSpeaker?: string
  makeAnchors?: boolean
}

const Speakers: FC<Props> = ({ speakers, makeAnchors = false, activeSpeaker = '' }: Props) => {
  const router = useRouter()

  return (
    <div className={clsx('d-flex flex-flow-wrap justify-content-center', styles.speakers_container)}>
      {speakers.map((speaker, index) => (
        <div
          className={clsx(
            styles.speaker,
            activeSpeaker === `${router.pathname}#${speaker.anchor}` ? styles.selected : null,
          )}
          key={index}
          id={makeAnchors && speaker?.anchor ? speaker.anchor : undefined}
        >
          <div className={styles.speaker__image}>
            <Image src={speaker.image || noImage} quality={100} alt={speaker.name} layout='fill' objectFit='cover' />
          </div>
          <div className={clsx(styles.speaker__info, !speaker.image ? styles.no_image : '')}>
            <div className={styles.speaker__name}>{speaker.name}</div>
            <div className={styles.speaker__description}>{speaker.description}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

Speakers.propTypes = {
  speakers: PropTypes.arrayOf(
    PropTypes.shape({
      image: PropTypes.string,
      name: PropTypes.string,
      description: PropTypes.string,
      anchor: PropTypes.string,
    }),
  ),
  makeAnchors: PropTypes.bool,
}

export default Speakers
