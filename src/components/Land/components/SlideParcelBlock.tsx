import React, { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import Image from 'next/image'

import { useStore } from '@/components/Land/components/useStore'
import styles from '@/components/Land/land.module.css'
import { getUrlWithSizes, truncateWalletAddress } from '@/lib/helpers'
import { Loader } from '@/lib/svg'
import { isDevelopment } from '@/lib/utils'
import { Parcel, ParcelOnMap } from '@/model/landModel'

const SlideParcelBlock = () => {
  const setActiveParcel = useStore((state) => state.setActiveParcel)
  const emitOnPointerMissed = useStore((state) => state.emitOnPointerMissed)

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showPopup, setShowPopup] = useState(false)
  const [isFirstLoad, setFirstLoad] = useState(true)
  const [isLoading, setLoading] = useState(true)
  const [parcel, setParcel] = useState<Parcel>({} as Parcel)

  const getParcel = async (parcel: ParcelOnMap) => {
    console.log(parcel)
    setLoading(true)

    // const response = await doRequest<Parcel>({
    //   endpoint: process.env.NEXT_PUBLIC_API_GET_PARCEL!.replace(/{id}/, encodeURIComponent(id)),
    //   method: 'GET',
    // })
    const response = {
      data: {
        response: parcel as Parcel,
      },
      _cc_errors: [],
    }

    if (!response?._cc_errors?.length && response.data?.response) {
      setParcel(response.data.response)
    } else {
      console.log(response?._cc_errors)
    }

    setLoading(false)
  }

  const onClose = () => {
    setShowPopup(false)
    setActiveParcel(null)
    emitOnPointerMissed()
  }

  /* Subscribers */
  useEffect(() => {
    /* Load parcel data */
    const uns1 = useStore.subscribe(
      (state) => state.activeParcel,
      (id) => {
        console.log('[!] Slide block. ID changed')
        timeoutRef.current && clearTimeout(timeoutRef.current)
        if (id) {
          if (isFirstLoad) {
            setFirstLoad(false)
          }
          setLoading(true)
          setShowPopup(true)
          timeoutRef.current = setTimeout(async () => {
            await getParcel(id)
          }, 300)
        }
      },
    )

    /* Close window */
    const uns2 = useStore.subscribe(
      (state) => state.onPointerMissedEvent,
      () => {
        setShowPopup(false)
        setActiveParcel(null)
      },
    )

    return () => {
      uns1()
      uns2()
    }
  }, [isFirstLoad, setActiveParcel])

  return !isFirstLoad ? (
    <div className={clsx(styles.slide__popup, styles.scrollbar)} style={{ right: showPopup ? 0 : '-100%' }}>
      <div className={styles.slide__popup_close} onClick={onClose}>
        <svg width='15' height='15' viewBox='0 0 15 15' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path
            d='M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z'
            fill='currentColor'
          ></path>
        </svg>
      </div>
      {isLoading ? (
        <Loader className={styles.slide__popup_loader} />
      ) : (
        <>
          <div className={styles.slide__popup_header_wrapper}>
            <h2 className={styles.slide__popup_header}>{parcel.name || `<Parcel # ${parcel.number}>`}</h2>
            {parcel.roomId && parcel.roomPassword && (
              <a
                href={`https://${isDevelopment ? 'stage.' : ''}connect.club/web/?deep_link_value=roomId_${
                  parcel.roomId
                }_pswd_${parcel.roomPassword}`}
                title={'Go to room'}
                rel='noreferrer'
                target={'_blank'}
                className={styles.button}
              >
                Go to room 🠒
              </a>
            )}
          </div>
          {(parcel.image || (parcel.available && !parcel.ownerAddress)) && (
            <div className={styles.slide__popup_image}>
              <Image
                src={parcel.image ? getUrlWithSizes(parcel.image, 600, 600) : '/temp/sale.jpg'}
                alt={parcel.name}
                layout={'fill'}
                objectFit={'contain'}
                quality={100}
              />
            </div>
          )}
          <div className={styles.slide__popup_rows}>
            <div>{parcel.available && 'PRE-SALE PRICE 0.1 ETH'}</div>
            {!parcel.available && parcel.description && <div>{parcel.description}</div>}
            <div>Land id # {parcel.number}</div>
            {parcel.ownerAddress && <div>Owner {truncateWalletAddress(parcel.ownerAddress)}</div>}
            <div>
              <h3 className={styles.slide__popup_rows_heading}>Row heading</h3>
              Any row
            </div>
            <div className={styles.columns}>
              <div className={styles.column}>
                <p>Column 1</p>
                <p>Column 1</p>
              </div>
              <div className={styles.column}>
                <p>Column 2</p>
                <p>Column 2</p>
              </div>
            </div>
            <div>
              <button>Button name</button>
            </div>
          </div>
        </>
      )}
    </div>
  ) : null
}

export default SlideParcelBlock
