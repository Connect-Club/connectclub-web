import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import amplitude from 'amplitude-js'
import clsx from 'clsx'
import { ContractInterface, ethers } from 'ethers'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'

import { getSmartContract } from '@/api/cryptoApi'
import Content from '@/components/pages_components/membership/Content'
import styles from '@/components/pages_components/membership/membership_frontend.module.css'
import Web3Provider from '@/components/pages_components/membership/Web3Provider'
import public_styles from '@/css/public.module.css'
import { doRequest } from '@/lib/Api'
import { getUrlWithSizes } from '@/lib/helpers'
import { Loader, Logo } from '@/lib/svg'
import { getHrefUTM, getMobileOS, isDevelopment, isMobileDevice } from '@/lib/utils'
import { State } from '@/model/apiModel'
import { FC } from '@/model/commonModel'
import { SmartContract, TokenInfo } from '@/model/cryptoModel'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { params, query } = ctx

  const walletAddress = query?.wallet ? (Array.isArray(query.wallet) ? query.wallet[0] : query.wallet) : ''

  if (!params?.tokenId || typeof params.tokenId !== 'string') {
    console.log('Token ID not found', params)
    return {
      notFound: true,
    }
  }

  /* Get smart contract */
  const [smartContract, errors] = await getSmartContract(params.tokenId, walletAddress)

  if (errors.length || !smartContract) {
    console.log('Smart contract not found', params, smartContract, errors)
  }

  /* Get token info */
  let response: (State<TokenInfo, TokenInfo> & { securityError: boolean }) | undefined
  if (smartContract) {
    response = await doRequest<TokenInfo, TokenInfo>({
      method: 'GET',
      endpoint: smartContract.url,
    })
    if (response._cc_errors.length) {
      console.log('Token not found', params, smartContract, response._cc_errors)
      return {
        notFound: true,
      }
    }

    if (!smartContract.network) {
      smartContract.network = isDevelopment ? 'goerli' : 'mainnet'
    }
  } else {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      tokenId: params.tokenId,
      tokenInfo: response?.data,
      smartContract,
    },
  }
}

type Props = {
  tokenId: string
  tokenInfo: TokenInfo
  smartContract: SmartContract
}

const MembershipFrontend: FC<Props> = ({ tokenInfo, smartContract, tokenId }) => {
  const amplitudeKey = isDevelopment ? '4b60a0a8667ea48921f95986cf1e2e55' : '9eaaf824819a859f6180b3125d8e876b'
  const [abi, setAbi] = useState<ContractInterface | null>(null)

  const price = ethers.utils.formatEther(smartContract.tokenPrice)
  const router = useRouter()
  const initialAppUrl = `https://app.connect.club/W0Im/${
    isDevelopment ? '3d6351c7' : 'ecff227c'
  }?deep_link_value=clubId_${smartContract.clubs[0].id}`
  const initialQRAppUrl = `https://app.connect.club/W0Im/${
    isDevelopment ? '71bfff2b' : '2cada15'
  }?deep_link_value=clubId_${smartContract.clubs[0].id}`
  const clubUrl = `https://${isDevelopment ? 'stage.' : ''}connect.club/club/${
    smartContract.clubs[0].slug
  }?utm_source=membership_landing`

  const [landingAmplitudeDeviceId, setLandingAmplitudeDeviceId] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  const [appUrl, setAppUrl] = useState(initialAppUrl)
  const [appUrlQR, setAppUrlQR] = useState(initialQRAppUrl)
  const [amplitudeInst, setAmplitude] = useState<typeof amplitude | null>(null)

  /* Get contract ABI */
  useEffect(() => {
    const getAbi = async () => {
      const response = await doRequest<ContractInterface, ContractInterface>({
        method: 'GET',
        endpoint: process.env.NEXT_PUBLIC_API_GET_ABI!,
      })
      setAbi(response.data)
    }

    getAbi().then()
  }, [])

  useEffect(() => {
    const pathname = window.location.pathname
    let params: Record<string, string> = {}
    let searchParams = ''

    if (Object.keys(router.query).length && landingAmplitudeDeviceId !== null) {
      params = Object.keys(router.query).reduce((accum, curVal) => {
        if (
          !['tokenId', 'deep_link_value', 'shortlink', 'af_force_deeplink', 'pid', 'deep_link_sub1'].includes(curVal)
        ) {
          accum[curVal] = router.query[curVal] as string
        }
        return accum
      }, params)

      const utmContent = 'qr'
      const utmSource = params['utm_source'] || (document.referrer ? new URL(document.referrer).hostname : '')
      const utmCampaign = params['utm_campaign'] || `without_utm_membership${utmSource ? `[${utmSource}]` : ``}`
      const deepLinkSub = `deep_link_sub1=${landingAmplitudeDeviceId}~${utmCampaign}~${utmContent}~${utmSource}${
        utmCampaign ? `&c=${utmCampaign}` : ''
      }`
      const deepLinkSubQR = `deep_link_sub1=${landingAmplitudeDeviceId}~${utmCampaign}[QR]~${utmContent}~${utmSource}${
        utmCampaign ? `&c=${utmCampaign}[QR]` : ''
      }`
      if (Object.keys(params).length) {
        searchParams = new URLSearchParams(params).toString()
      }

      setAppUrl(
        (prev) =>
          `${prev}&${deepLinkSub}${searchParams ? `&${searchParams}` : ''}&af_r=${encodeURIComponent(
            clubUrl + `&utm_campaign=${utmCampaign}`,
          )}`,
      )
      setAppUrlQR(
        (prev) =>
          `${prev}&${deepLinkSubQR}${searchParams ? `&${searchParams}` : ''}&af_r=${encodeURIComponent(
            clubUrl + `&utm_campaign=${utmCampaign}`,
          )}`,
      )
    }

    window.history.replaceState(
      window.history.state,
      document.title,
      pathname + (searchParams ? '?' + searchParams : ''),
    )
  }, [clubUrl, landingAmplitudeDeviceId, router, router.query])

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    if (router.isReady) {
      const amplitudeParams = Object.assign(
        {},
        {
          tokenId: tokenId,
          isDesktop: !isMobile,
          platform: getMobileOS(),
        },
        getHrefUTM(router),
      )

      if (amplitudeInst) {
        amplitudeInst.getInstance().init(amplitudeKey, undefined, {
          saveEvents: true,
          includeReferrer: true,
        })

        setLandingAmplitudeDeviceId(amplitudeInst.getInstance().options.deviceId || '')
      }

      queueMicrotask(() => {
        amplitudeInst && amplitudeInst.getInstance().logEvent('membership_landing.pageview', amplitudeParams)
      })
    }
    return () => {
      timeout && clearTimeout(timeout)
    }
  }, [amplitudeInst, amplitudeKey, isMobile, router, tokenId])

  useEffect(() => {
    setIsMobile(isMobileDevice())
    import('amplitude-js').then((mod) => setAmplitude(mod.default))
  }, [])

  return (
    <div className={clsx('container relative')}>
      <Head>
        <title>{tokenInfo.name}</title>
        <meta name='description' content={tokenInfo.description} />
        <meta property='og:title' content={tokenInfo.name} />
        <meta property='og:description' content={tokenInfo.description} />
        <meta
          property='og:url'
          content={`https://${isDevelopment ? 'stage.' : ''}connect.club/membership/${tokenId}`}
        />
        <meta
          property='og:image'
          content={`https://${isDevelopment ? 'stage.' : ''}connect.club/api/get/ogimage?tokenId=${tokenId}`}
          key={'ogimage'}
        />
        <meta property='og:image:type' content='image/png' key={'ogimagetype'} />
        <meta property='og:image:width' content='1200' key={'ogimagew'} />
        <meta property='og:image:height' content='630' key={'ogimageh'} />
        <meta name='twitter:card' content='summary_large_image' />
        <meta
          name='twitter:image'
          content={`https://${isDevelopment ? 'stage.' : ''}connect.club/api/get/ogimage?tokenId=${tokenId}`}
        />
      </Head>
      <div className={styles.header_logo}>
        <Link href='/'>
          <a title={'Connect club'}>
            <Logo color={['rgba(77, 125, 208, 0.08)', 'rgba(77, 125, 208, 0.08)']} width={73} id='header' />
          </a>
        </Link>
      </div>
      <div className={clsx(styles.container)}>
        <div className={styles.logo}>
          <span className={styles.logo_inner}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={tokenInfo.image} alt={tokenInfo.name} />
          </span>
        </div>
        <h1 className={styles.h1}>{tokenInfo.name}</h1>
        <p>{tokenInfo.description}</p>
        {smartContract.clubs.length && (
          <div className={styles.clubs}>
            {smartContract.clubs.map((club) => (
              <div className={styles.club} key={club.id}>
                <div className={styles.club__name}>
                  by
                  {club.avatar && (
                    <span className={styles.club__image}>
                      <Image
                        src={getUrlWithSizes(club.avatar, 64, 64)}
                        layout={'fill'}
                        objectFit={'cover'}
                        alt={club.title}
                      />
                    </span>
                  )}
                  {club.title}
                </div>
                <ReactMarkdown
                  linkTarget={'_blank'}
                  className='line-break'
                  components={{
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars,react/display-name
                    a: ({ node, children, ...props }) => {
                      const linkProps = props
                      if (props.target === '_blank') {
                        linkProps['rel'] = 'noopener noreferrer'
                      }
                      return <a {...linkProps}>{children}</a>
                    },
                  }}
                >
                  {club.description}
                </ReactMarkdown>
              </div>
            ))}
          </div>
        )}

        <div className={styles.price}>
          <Image src='/img/svg/etherium.svg' width={32} height={32} alt={`${price} ETH`} />
          <div>{`${price} ETH`}</div>
        </div>

        {abi === null ? (
          <Loader />
        ) : (
          <Web3Provider smartContract={smartContract}>
            <Content
              abi={abi}
              tokenId={tokenId}
              smartContract={smartContract}
              appUrl={appUrl}
              qrCodeLink={appUrlQR}
              amplitudeInst={amplitudeInst}
              isMobile={isMobile}
            />
          </Web3Provider>
        )}

        <div className={clsx(styles.hint, 'third-black')}>
          {smartContract.totalSupply} token
          {smartContract.totalSupply > 1 ? 's were' : ' was'} issued,{' '}
          {smartContract.maxTokenSupply - smartContract.totalSupply} remained
        </div>
      </div>
      <style jsx global>
        {`
          .${public_styles.footer} {
            display: none;
          }
          @media (max-width: 1100px) {
            main .container {
              max-width: 100% !important;
              padding: 0 5rem;
            }
          }
        `}
      </style>
    </div>
  )
}

MembershipFrontend.propTypes = {
  infuraId: PropTypes.string,
  contractId: PropTypes.string,
}

export default MembershipFrontend
