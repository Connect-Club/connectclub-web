import React, { RefObject } from 'react'
import { Rnd } from 'react-rnd'
import clsx from 'clsx'
import Image from 'next/image'
import PropTypes from 'prop-types'

import { convertRoundObjectPositionToMap } from '@/components/admin/Map/map.converter'
import styles from '@/components/admin/Map/map.module.css'
import { FC } from '@/model/commonModel'
import { MapImageObjectSizes } from '@/model/mapModel'

type Props = {
  size: number
  diameter: number
  realImageSize: MapImageObjectSizes
  displayedImageSize: MapImageObjectSizes
  userRef: RefObject<any>
  x?: number
  y?: number
}

const UserObject: FC<Props> = ({ size, diameter, realImageSize, displayedImageSize, userRef, x = 0, y = 0 }) => {
  const scaledHeight = (size * displayedImageSize.height) / realImageSize.height
  const scaledDiameter = (diameter * displayedImageSize.width) / realImageSize.width

  const initialData = {
    ...convertRoundObjectPositionToMap(x, y, diameter, realImageSize, displayedImageSize),
    ...{ width: scaledDiameter, height: scaledDiameter },
  }

  return (
    <Rnd
      disableDragging={true}
      enableResizing={false}
      className={clsx(styles.rnd_object_round, styles.rnd_user_object)}
      default={initialData}
      ref={userRef}
    >
      <Image
        src={`/img/svg/no-image.svg`}
        quality={55}
        alt={`User object`}
        width={scaledHeight}
        height={scaledHeight}
        layout='fixed'
      />
    </Rnd>
  )
}

UserObject.propTypes = {
  size: PropTypes.number.isRequired,
  diameter: PropTypes.number.isRequired,
  realImageSize: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number,
  }).isRequired,
  displayedImageSize: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number,
  }).isRequired,
  userRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]).isRequired,
  x: PropTypes.number,
  y: PropTypes.number,
}

export default UserObject
