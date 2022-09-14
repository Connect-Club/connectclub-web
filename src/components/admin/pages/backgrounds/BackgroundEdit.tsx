import React from 'react'
import clsx from 'clsx'

import DataJson from '@/components/admin/common/DataJson'
import global_styles from '@/components/admin/css/admin.module.css'
import { getBackgroundObjectsById } from '@/components/admin/Map/helper'
import MapContainer from '@/components/admin/Map/MapContainer'
import { Background } from '@/model/backgroundModel'
import { FC } from '@/model/commonModel'

type Props = {
  background: Background
}
const BackgroundEdit: FC<Props> = ({ background }) => {
  return (
    <div>
      <div className={clsx(global_styles.info_block)}>
        <DataJson data={background}>
          <span className={global_styles.bold}>Background #{background.background.id}</span>
        </DataJson>
      </div>

      <MapContainer
        isBackgroundPage={true}
        mapId={background.background.id.toString()}
        objectsContainer={{
          objects: background.objects,
          objectsData: background.objectsData,
        }}
        background={background.background}
        saveParams={{
          url: process.env.NEXT_PUBLIC_API_POST_UPDATE_BACKGROUND_OBJECTS!.replace(
            /{backgroundId}/,
            String(background.background.id),
          ),
        }}
        resizable={['image', 'image_zone', 'static_object', 'speaker_location', 'main_spawn', 'time_box', 'quiet_zone']}
        getMapObjectsById={getBackgroundObjectsById}
        mapNotFound={'Background not found'}
      />
    </div>
  )
}

export default BackgroundEdit
