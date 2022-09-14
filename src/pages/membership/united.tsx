import React, { useEffect, useState } from 'react'
import amplitude from 'amplitude-js'
import { ContractInterface } from 'ethers'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'

import { getSmartContract } from '@/api/cryptoApi'
import UnitedMetaverseTokenLayout from '@/components/layout/UnitedMetaverseTokenLayout'
import Main from '@/components/pages_components/membership/united/components/Main'
import { doRequest } from '@/lib/Api'
import { getHrefUTM, getMobileOS, isDevelopment, isMobileDevice } from '@/lib/utils'
import { State } from '@/model/apiModel'
import { FCWithLayout } from '@/model/commonModel'
import { SmartContract, TokenInfo } from '@/model/cryptoModel'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { params } = ctx

  let response: (State<TokenInfo, TokenInfo> & { securityError: boolean }) | undefined
  let smartContract
  let errors = []
  const tokenId = isDevelopment ? '2' : '1'

  /* Get smart contract */
  try {
    ;[smartContract, errors] = await getSmartContract(tokenId)

    if (errors.length || !smartContract) {
      console.log('Smart contract not found', params, smartContract, errors)
    }

    /* Get token info */
    if (smartContract) {
      response = await doRequest<TokenInfo, TokenInfo>({
        method: 'GET',
        endpoint: smartContract.url,
      })
      if (response._cc_errors.length) {
        console.log('Token not found', params, smartContract, response._cc_errors)
      }

      if (!smartContract.network) {
        smartContract.network = isDevelopment ? 'goerli' : 'mainnet'
      }
    }
  } catch (e) {
    console.log(e)
  }

  return {
    props: {
      tokenInfo: response?.data || null,
      tokenId,
      smartContract: smartContract || null,
    },
  }
}

type Props = {
  tokenId: string
  tokenInfo: TokenInfo | undefined
  smartContract: SmartContract | undefined
}

const UnitedToken: FCWithLayout<Props> = ({ tokenInfo, smartContract, tokenId }) => {
  const amplitudeKey = isDevelopment ? '4b60a0a8667ea48921f95986cf1e2e55' : '9eaaf824819a859f6180b3125d8e876b'
  const [abi, setAbi] = useState<ContractInterface | null>(null)

  const router = useRouter()

  const clubId = smartContract?.clubs?.[0]?.id

  const initialAppUrl = `https://app.connect.club/W0Im/${isDevelopment ? '3d6351c7' : 'ecff227c'}?${
    clubId ? `deep_link_value=clubId_${clubId}` : `v=1`
  }`
  const initialQRAppUrl = `https://app.connect.club/W0Im/${isDevelopment ? '71bfff2b' : '2cada15'}?${
    clubId ? `deep_link_value=clubId_${clubId}` : `v=1`
  }`
  const clubUrl = clubId
    ? `https://${isDevelopment ? 'stage.' : ''}connect.club/club/${
        smartContract.clubs[0].slug
      }?utm_source=membership_united`
    : ``

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

    if (landingAmplitudeDeviceId !== null) {
      if (Object.keys(router.query).length) {
        params = Object.keys(router.query).reduce((accum, curVal) => {
          if (
            !['tokenId', 'deep_link_value', 'shortlink', 'af_force_deeplink', 'pid', 'deep_link_sub1'].includes(curVal)
          ) {
            accum[curVal] = router.query[curVal] as string
          }
          return accum
        }, params)
      }

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

      const af_r = clubUrl ? `&af_r=${encodeURIComponent(clubUrl + `&utm_campaign=${utmCampaign}`)}` : ``
      setAppUrl((prev) => `${prev}&${deepLinkSub}${searchParams ? `&${searchParams}` : ''}${af_r}`)
      setAppUrlQR((prev) => `${prev}&${deepLinkSubQR}${searchParams ? `&${searchParams}` : ''}${af_r}`)
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
          page: 'united',
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

  const metaTitle = tokenInfo?.name || 'United Metaverse Pass by Connect.Club'
  const metaDescription =
    tokenInfo?.description ||
    'United Metaverse by Connect.Club is a community that believes in the future & power of Metaverse communication. Connecting with like-minded others is an essential part of belonging.'

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta name='description' content={metaDescription} />
        <meta property='og:title' content={metaTitle} />
        <meta property='og:description' content={metaDescription} />
        <meta property='og:url' content={`https://${isDevelopment ? 'stage.' : ''}connect.club/membership/united`} />
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

      <Main
        abi={abi}
        tokenId={tokenId}
        smartContract={smartContract}
        appUrl={appUrl}
        qrCodeLink={appUrlQR}
        amplitudeInst={amplitudeInst}
        isMobile={isMobile}
      />

      <style global jsx>{`
        @font-face {
          font-family: 'Proxima Nova';
          font-display: swap;
          src: url('/united-token-data/fonts/ProximaNova-Thin.woff2') format('woff2'),
            url('/united-token-data/fonts/ProximaNova-Thin.woff') format('woff');
          font-weight: 100;
          font-style: normal;
        }
        @font-face {
          font-family: 'Proxima Nova';
          font-display: swap;
          src: url('/united-token-data/fonts/ProximaNova-Light.woff2') format('woff2'),
            url('/united-token-data/fonts/ProximaNova-Light.woff') format('woff');
          font-weight: 200;
          font-style: normal;
        }
        @font-face {
          font-family: 'Proxima Nova';
          font-display: swap;
          src: url('/united-token-data/fonts/ProximaNova-Regular.woff2') format('woff2'),
            url('/united-token-data/fonts/ProximaNova-Regular.woff') format('woff');
          font-weight: 400;
          font-style: normal;
        }
        @font-face {
          font-family: 'Proxima Nova';
          font-display: swap;
          src: url('/united-token-data/fonts/ProximaNova-Semibold.woff2') format('woff2'),
            url('/united-token-data/fonts/ProximaNova-Semibold.woff') format('woff');
          font-weight: 600;
          font-style: normal;
        }
        @font-face {
          font-family: 'Proxima Nova';
          font-display: swap;
          src: url('/united-token-data/fonts/ProximaNova-Extrabld.woff2') format('woff2'),
            url('/united-token-data/fonts/ProximaNova-Extrabld.woff') format('woff');
          font-weight: 800;
          font-style: normal;
        }
        html {
          line-height: 1.15;
          -webkit-text-size-adjust: 100%;
        }
        body {
          margin: 0;
        }
        main {
          display: block;
        }
        h1 {
          font-size: 2em;
          margin: 0.67em 0;
        }
        hr {
          box-sizing: content-box;
          height: 0;
          overflow: visible;
        }
        pre {
          font-family: monospace, monospace;
          font-size: 1em;
        }
        a {
          background-color: transparent;
        }
        abbr[title] {
          border-bottom: none;
          text-decoration: underline;
          text-decoration: underline dotted;
        }
        b,
        strong {
          font-weight: bolder;
        }
        code,
        kbd,
        samp {
          font-family: monospace, monospace;
          font-size: 1em;
        }
        small {
          font-size: 80%;
        }
        sub,
        sup {
          font-size: 75%;
          line-height: 0;
          position: relative;
          vertical-align: baseline;
        }
        sub {
          bottom: -0.25em;
        }
        sup {
          top: -0.5em;
        }
        img {
          border-style: none;
        }
        button,
        input,
        optgroup,
        select,
        textarea {
          font-family: inherit;
          font-size: 100%;
          line-height: 1.15;
          margin: 0;
        }
        button,
        input {
          overflow: visible;
        }
        button,
        select {
          text-transform: none;
        }
        [type='button'],
        [type='reset'],
        [type='submit'],
        button {
          -webkit-appearance: button;
        }
        [type='button']::-moz-focus-inner,
        [type='reset']::-moz-focus-inner,
        [type='submit']::-moz-focus-inner,
        button::-moz-focus-inner {
          border-style: none;
          padding: 0;
        }
        [type='button']:-moz-focusring,
        [type='reset']:-moz-focusring,
        [type='submit']:-moz-focusring,
        button:-moz-focusring {
          outline: 1px dotted ButtonText;
        }
        fieldset {
          padding: 0.35em 0.75em 0.625em;
        }
        legend {
          box-sizing: border-box;
          color: inherit;
          display: table;
          max-width: 100%;
          padding: 0;
          white-space: normal;
        }
        progress {
          vertical-align: baseline;
        }
        textarea {
          overflow: auto;
        }
        [type='checkbox'],
        [type='radio'] {
          box-sizing: border-box;
          padding: 0;
        }
        [type='number']::-webkit-inner-spin-button,
        [type='number']::-webkit-outer-spin-button {
          height: auto;
        }
        [type='search'] {
          -webkit-appearance: textfield;
          outline-offset: -2px;
        }
        [type='search']::-webkit-search-decoration {
          -webkit-appearance: none;
        }
        ::-webkit-file-upload-button {
          -webkit-appearance: button;
          font: inherit;
        }
        details {
          display: block;
        }
        summary {
          display: list-item;
        }
        template {
          display: none;
        }
        [hidden] {
          display: none;
        }
        :root {
          --container: 1350px;
        }
        * {
          box-sizing: border-box;
        }
        ::after,
        ::before {
          box-sizing: border-box;
        }
        html {
          overflow: auto;
        }
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          margin: 0;
          padding: 0;
        }
        a:hover {
          color: rgb(250 250 250 / 80%);
        }
        p {
          margin: 0;
          font-size: 20px;
        }
        body {
          font-weight: 200;
          background: linear-gradient(90deg, #111 0, #022170 100%);
          color: #fff;
          font-family: 'Proxima Nova', sans-serif;
          overflow-x: hidden;
        }
        img {
          max-width: 100%;
        }
        li,
        ul {
          margin: 0;
          padding: 0;
          list-style-type: none;
        }
        button {
          padding: 0;
          border: none;
          background-color: transparent;
          cursor: pointer;
        }
        a {
          text-decoration: none;
          color: #7e7e7e;
        }
        section {
          margin-bottom: 300px;
          padding-top: 100px;
        }
        ::after,
        ::before {
          z-index: -1;
        }
        .stn-title {
          font-weight: 800;
          font-size: 56px;
          line-height: 68px;
          color: #fafafa;
          margin-bottom: 60px;
        }
        .stn-text {
          font-weight: 300;
          font-size: 16px;
          line-height: 19px;
          margin-bottom: 10px;
          color: #ebebeb;
          text-align: left;
        }
        .unselectable-word {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        .be-relative {
          position: relative;
        }
        .container {
          max-width: var(--container);
          padding: 0 15px;
          margin: 0 auto;
        }
        .visible {
          visibility: visible !important;
          opacity: 1 !important;
        }
        .header {
          padding: inherit;
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          z-index: 10;
          transition: all 0.3s ease;
        }
        .header--sticky {
          position: fixed;
          background: rgba(5, 34, 108, 0.9);
        }
        .header--sticky .header__container {
          padding-top: 20px;
          padding-bottom: 20px;
        }
        .header__container {
          padding-top: 40px;
          padding-bottom: 40px;
          display: flex;
          justify-content: space-between;
        }
        .header__body {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .header__list {
          display: flex;
          gap: 20px;
          margin-left: 60px;
        }
        .header__wrapper {
          width: 100%;
          transition: all 0.3s ease-in;
        }
        .header .header__body {
          display: none;
        }
        .header__wrapper--active {
          position: fixed;
          height: 100vh;
          width: 100vw;
          left: 0;
          top: 0;
          background: rgba(0, 0, 0, 0.5);
        }
        .header--sticky .header__body {
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: space-between;
        }
        .header__link {
          font-weight: 300;
          font-size: 14px;
          line-height: 17px;
          text-align: justify;
          color: #fafafa;
        }
        .header__link--border {
          padding-right: 10px;
          margin-right: 10px;
          border-right: 1px solid #fff;
        }
        .header__btn {
          width: 175px;
          height: 40px;
          padding: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .burger {
          display: none;
          flex-direction: column;
          gap: 5px;
        }
        .burger__line {
          width: 30px;
          height: 2px;
          background: #fff;
          transition: all 0.3s ease-in;
        }
        .burger__line:last-child {
          width: 20px;
          margin-left: auto;
        }
        .hidden {
          overflow: hidden;
        }
        .header__wrapper {
          width: 100%;
          transition: all 0.3s ease-in;
        }
        .hero {
          margin-bottom: 240px;
        }
        .hero__container {
          position: relative;
          padding-top: 120px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .hero__container::after {
          position: absolute;
          content: '';
          top: 18px;
          left: 20%;
          width: 146px;
          height: 146px;
          background: url('/united-token-data/img/decoration-146px.svg') no-repeat center center;
        }
        .hero__content {
          max-width: 545px;
        }
        .hero__title {
          position: relative;
          font-weight: 800;
          font-size: 72px;
          line-height: 64px;
          color: #fafafa;
          margin-bottom: 10px;
        }
        .hero__title::after {
          position: absolute;
          content: '';
          top: -78px;
          left: -59px;
          width: 99px;
          height: 99px;
          background: url('/united-token-data/img/decoration-99px.svg') no-repeat center center;
          background-size: cover;
        }
        .hero__subtitle {
          font-weight: 100;
          font-size: 24px;
          line-height: 24px;
          color: #ebebeb;
          margin-bottom: 40px;
        }
        .hero__btn {
          min-width: 220px;
        }
        .hero__img-block {
          position: relative;
        }
        .hero__img-block::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: -23%;
          right: 0;
          margin: auto;
          width: 900px;
          height: 900px;
          background: url('/united-token-data/img/hero-decoration.png') no-repeat center center;
          background-size: contain;
        }
        .hero__gif {
          position: absolute;
          width: 100%;
          left: 0;
          top: 0;
        }
        .about {
          margin-bottom: 444px;
        }
        .about canvas {
          position: absolute;
          z-index: 0;
          top: 15%;
          left: -50%;
          opacity: 0.5;
        }
        .about__title::after {
          position: absolute;
          content: '';
          top: -25%;
          right: -40%;
          width: 191px;
          height: 191px;
          background: url('/united-token-data/img/decoration-191px.svg');
          background-size: contain;
        }
        .about__left {
          position: relative;
        }
        .about__container {
          display: flex;
          justify-content: space-between;
        }
        .about__wrapper {
          max-width: 568px;
          display: flex;
          gap: 20px;
        }
        .about__subtitle {
          font-weight: 800;
          font-size: 34px;
          line-height: 38px;
          color: rgba(250, 250, 250, 0.1);
          writing-mode: vertical-rl;
          max-height: 281px;
          transform: rotate(180deg);
        }
        .about__content {
          position: relative;
        }
        .about__content::after {
          position: absolute;
          content: '';
          width: 250px;
          height: 250px;
          background: url('/united-token-data/img/decoration-191px.svg');
          background-size: contain;
          transform: rotate(-45deg);
        }
        .about__btn-block {
          margin-top: 60px;
          display: flex;
          justify-content: space-between;
          column-gap: 10px;
        }
        .about__btn-block form {
          width: 95%;
        }
        .about__btn--paper {
          width: 90%;
          font-weight: 300;
        }
        .about__btn--mint {
          width: 250px;
          font-weight: 300;
        }
        .utilities canvas {
          position: absolute;
          right: -10%;
          top: -40%;
          z-index: -1;
          opacity: 0.5;
          width: 643px !important;
          height: auto !important;
        }
        .utilities__wrapper {
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 56px;
        }
        .utilities__column--first {
          max-width: 507px;
        }
        .utilities__column--second {
          max-width: 482px;
        }
        .utilities__text--margined {
          margin-bottom: 20px;
        }
        .utilities__text--margined-top {
          margin-top: 20px;
        }
        .utilities__item {
          padding: 15px 25px 15px 15px;
          background: rgba(250, 250, 250, 0.1);
          border: 1px solid rgba(250, 250, 250, 0.1);
          box-sizing: border-box;
          border-radius: 20px;
          margin-bottom: 10px;
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }
        .utilities__item.utilities_with_inner {
          flex-flow: wrap;
        }
        .utilities__button {
          display: inline-flex;
          padding: 10px 18px;
          font-size: 16px;
        }
        .utilities__button_block {
          margin-top: 20px;
        }
        .utilities__text {
          font-weight: 400;
          font-size: 16px;
          line-height: 19px;
          text-align: justify;
          color: #fafafa;
        }
        .utilities__text_bottom {
          font-size: 20px;
          line-height: 24.36px;
        }
        .roadmap {
          margin-bottom: 200px;
        }
        .roadmap canvas {
          opacity: 0.3;
          position: absolute;
          left: -5%;
          width: 684px !important;
          height: auto !important;
          top: 0;
        }
        .roadmap__title {
          position: relative;
        }
        .roadmap__title::after {
          position: absolute;
          content: '';
          top: -200%;
          left: 20%;
          width: 146px;
          height: 146px;
          background: url('/united-token-data/img/decoration-146px.svg') no-repeat center center;
          background-size: contain;
        }
        .roadmap__title::before {
          position: absolute;
          content: '';
          top: -200%;
          right: 0;
          width: 256px;
          height: 256px;
          background: url('/united-token-data/img/decoration-191px.svg') no-repeat center center;
          background-size: contain;
        }
        .roadmap__wrapper {
          display: flex;
          justify-content: space-between;
          padding-bottom: 46px;
        }
        .roadmap__wrapper--2 {
          position: relative;
          padding-top: 69px;
          border-top: 3px solid #fafafa;
          border-right: 3px solid #fafafa;
          border-radius: 0 25px 0 0;
        }
        .roadmap__button {
          margin-top: 50px;
        }
        .roadmap__button .hero__btn {
          max-width: 260px;
          display: flex;
          justify-content: center;
        }
        .roadmap__wrapper-content {
          display: flex;
          justify-content: space-between;
        }
        .roadmap__content {
          max-width: 308px;
        }
        .roadmap__column {
          max-width: 476px;
          position: relative;
          z-index: 1;
        }
        .roadmap__column::after {
          z-index: 2;
        }
        .roadmap__column--1 {
          max-width: 392px;
          align-self: flex-end;
        }
        .roadmap__column--tablet {
          display: none;
        }
        .roadmap__text {
          font-weight: 300;
          font-size: 16px;
          line-height: 22px;
          text-align: left;
          color: #ebebeb;
        }
        .roadmap__caption {
          font-weight: 600;
          font-size: 24px;
          line-height: 32px;
          color: #fafafa;
          margin-bottom: 20px;
        }
        .roadmap__content--3 {
          margin-left: auto;
        }
        .roadmap__column--2 {
          padding-right: 169px;
          position: relative;
        }
        .roadmap__column--1::after,
        .roadmap__column--2::after {
          position: absolute;
          content: '';
          right: 0;
          width: 20px;
          border-radius: 50%;
          height: 20px;
          background: #0047ff;
          border: 3px solid #fafafa;
          box-sizing: border-box;
          bottom: -58px;
          left: 0;
        }
        .roadmap__column--3::after,
        .roadmap__column--4::after {
          position: absolute;
          content: '';
          right: -10px;
          top: 0;
          width: 20px;
          border-radius: 50%;
          height: 20px;
          background: #0047ff;
          border: 3px solid #fafafa;
          box-sizing: border-box;
        }
        .roadmap__column--3 {
          padding-right: 169px;
          margin-bottom: 60px;
          margin-left: auto;
        }
        .roadmap__column--4 {
          padding-right: 169px;
          margin-left: auto;
        }
        .groups__wrapper {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-column-gap: 70px;
          grid-row-gap: 40px;
          position: relative;
        }
        .groups__wrapper::after {
          position: absolute;
          right: 15%;
          bottom: -5%;
          content: '';
          width: 300px;
          height: 300px;
          background: url('/united-token-data/img/decoration-191px.svg');
          background-size: contain;
          transform: rotate(-45deg);
        }
        .groups__item {
          display: flex;
          gap: 20px;
        }
        .groups__item img {
          width: 96px;
          height: 96px;
        }
        .groups__caption {
          font-weight: 700;
          font-size: 24px;
          line-height: 29px;
          color: #fafafa;
          margin-bottom: 11px;
        }
        .groups__caption a {
          color: #fafafa;
        }
        .groups__caption a:hover {
          color: rgb(250 250 250 / 80%);
        }
        .groups__subs {
          font-weight: 200;
          font-size: 16px;
          line-height: 19px;
          color: #ebebeb;
        }
        .members__container {
          position: relative;
        }
        .members__container::after {
          position: absolute;
          content: '';
          top: 0;
          right: 0;
          width: 191px;
          height: 191px;
          background: url('/united-token-data/img/decoration-191px.svg');
          background-size: contain;
          transform: rotate(-45deg);
        }
        .members__wrapper {
          max-width: 1122px;
          padding-right: 100px;
        }
        .members__title {
          max-width: 660px;
        }
        .slider__item {
          width: 300px !important;
          min-height: 400px;
          background: rgba(250, 250, 250, 0.1);
          border: 1px solid rgba(250, 250, 250, 0.1);
          border-radius: 30px;
          padding: 17px;
          opacity: 0.5;
          transition: all 0.3s ease-in;
        }
        .slider__img {
          width: 100%;
          margin-bottom: 10px;
          border-radius: 10px;
        }
        .slider__name {
          font-weight: 600;
          font-size: 24px;
          line-height: 29px;
          color: #fafafa;
          margin-bottom: 6px;
        }
        .slider__name a {
          color: #fafafa;
        }
        .slider__name a:hover {
          color: rgb(250 250 250 / 80%);
        }
        .slider__role {
          font-weight: 300;
          font-size: 14px;
          line-height: 17px;
          color: #ebebeb;
        }
        .navigation-block {
          position: absolute;
          right: 0;
          top: 50%;
          z-index: 10;
        }
        .slick-current .slider__item {
          opacity: 1;
        }
        .arrow {
          position: absolute;
          top: 50%;
        }
        .arrow-prev {
          right: -100px;
        }
        .arrow-next {
          right: -150px;
        }
        .team .slider__img {
          width: 322px !important;
          height: auto;
        }
        .team__title {
          margin-bottom: 0;
        }
        .team__top {
          margin-bottom: 60px;
        }
        .team__top {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          align-items: center;
        }
        .team__text {
          max-width: 680px;
          margin-bottom: 0;
        }
        .team__wrapper {
          max-width: 1122px;
          padding-right: 100px;
        }
        .dropdown {
          flex-direction: column;
          cursor: pointer;
          display: flex;
          padding: 15px 35px 15px 20px;
          background: rgba(250, 250, 250, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.1);
          width: 100%;
          min-height: 94px;
          border-radius: 10px;
          margin-bottom: 10px;
        }
        .dropdown__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          margin-bottom: auto;
        }
        .dropdown__title {
          max-width: 300px;
          font-weight: 600;
          font-size: 24px;
          line-height: 32px;
          color: #fafafa;
        }
        .dropdown__body {
          transition: all 0.3s ease-in;
          font-weight: 300;
          font-size: 16px;
          line-height: 19px;
          color: #ebebeb;
          text-align: left;
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          will-change: max-height;
          box-sizing: content-box;
        }
        .dropdown__body--active {
          margin-top: 20px;
          opacity: 1;
        }
        .dropdown__btn {
          transition: 0.3s all ease;
        }
        .dropdown__btn--open {
          transform: rotate(45deg);
        }
        .dropdown__btn--open rect {
          fill: #0188fb;
        }
        .dropdown__p {
          margin-bottom: 5px;
        }
        .faq {
          position: relative;
          z-index: 1;
        }
        .faq__container {
          position: relative;
        }
        .faq__container::after {
          position: absolute;
          width: 200px;
          height: 200px;
          content: '';
          bottom: -30%;
          left: 0;
          background: url('/united-token-data/img/decoration-146px.svg') no-repeat;
          background-size: contain;
        }
        .faq__title {
          position: relative;
        }
        .faq__title::after {
          position: absolute;
          content: '';
          top: -300%;
          left: 20%;
          width: 191px;
          height: 191px;
          background: url('/united-token-data/img/decoration-191px.svg');
          background-size: contain;
        }
        .faq__wrapper {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          row-gap: 20px;
        }
        .faq__column {
          width: 48%;
        }
        .social canvas {
          width: 650px !important;
          height: auto !important;
          position: absolute;
          right: -16%;
          z-index: 0;
          top: -133%;
          opacity: 0.5;
        }
        .social {
          margin-bottom: 100px;
        }
        .social__container {
          position: relative;
        }
        .social__wrapper {
          display: flex;
          justify-content: space-between;
          position: relative;
        }
        .social__wrapper::after {
          position: absolute;
          content: '';
          top: 20%;
          left: 40%;
          width: 146px;
          height: 146px;
          background: url('/united-token-data/img/decoration-146px.svg');
          background-size: contain;
          transform: rotate(45deg);
        }
        .social__column {
          max-width: 305px;
        }
        .social__column--1 {
          display: flex;
          gap: 14px;
          align-items: center;
        }
        .social__column--2 {
          margin-right: 124px;
        }
        .social__subtitle {
          font-weight: 800;
          font-size: 34px;
          line-height: 34px;
          color: rgba(250, 250, 250, 0.1);
          max-height: 281px;
        }
        .social__subtitle--app {
          margin-bottom: 16px;
        }
        .social__vertical {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          max-height: 190px;
        }
        .social__text {
          max-width: 164px;
          margin-bottom: 27px;
        }
        .social__link {
          font-weight: 800;
          font-size: 48px;
          line-height: 48px;
          color: #fafafa;
          display: block;
          margin-bottom: 10px;
          width: 100%;
          position: relative;
        }
        .social__link::after {
          position: absolute;
          content: '';
          right: 0;
          top: 50%;
          width: 84px;
          height: 16px;
          background: url('/united-token-data/img/social-arrow.svg') no-repeat;
          background-size: contain;
          right: -124px;
          transform: translateY(-8px);
        }
        .social__link--unmargined {
          margin-bottom: 0;
        }
        .footer {
          border-top: inherit;
          color: inherit;
          padding-top: inherit !important;
          padding-bottom: inherit !important;
          background: rgba(4, 43, 142, 0.5);
        }
        .footer__container {
          padding-top: 39px;
          padding-bottom: 39px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .footer__content {
          display: flex;
          gap: 58px;
          align-items: center;
        }
        .footer__link-list {
          display: flex;
          gap: 20px;
        }
        .footer__link {
          font-weight: 300;
          font-size: 16px;
          line-height: 19px;
          text-align: justify;
          color: #fafafa;
        }
        .footer__social-list {
          display: flex;
          gap: 20px;
        }
        @media (max-width: 1400px) {
          :root {
            --container: 1170px;
          }
          .container {
            max-width: var(--container);
          }
          .arrow-prev {
            right: -50px;
          }
          .arrow-next {
            right: -100px;
          }
        }
        @media (max-width: 1200px) {
          :root {
            --container: 960px;
          }
          .container {
            max-width: var(--container);
          }
          .about {
            margin-bottom: 300px;
          }
          .header__body {
            transform: translateX(100%);
            transition: all 0.3s ease-in;
            display: flex !important;
            flex-direction: column;
            align-items: center;
            justify-content: center !important;
            text-align: center;
            padding: 15px;
            padding-top: 15px;
            position: fixed;
            width: 100% !important;
            height: 100%;
            top: 0;
            right: 0;
            background: #042b8e;
          }
          .header__body--active {
            transform: translateX(0);
          }
          .header__list {
            display: block;
            margin-left: 0;
          }
          .header__item {
            margin-bottom: 20px;
          }
          .header__btn {
            width: 150px;
          }
          .header__block {
            display: flex;
            margin-top: 40px;
            margin-bottom: 30px;
          }
          .header__link {
            font-size: 26px;
          }
          .burger {
            display: flex;
            z-index: 1;
          }
          .burger--open .burger__line:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
          }
          .burger--open .burger__line:nth-child(2) {
            transform: rotate(-45deg);
          }
          .burger--open .burger__line:last-child {
            opacity: 0;
          }
          .hero__img-block::after {
            width: 652px;
          }
          .about__container {
            display: block;
          }
          .about__wrapper {
            margin-left: auto;
          }
          .about__content::after {
            top: -70%;
            right: 0;
            left: unset;
            bottom: unset;
            width: 220px;
            height: 220px;
          }
          .about canvas {
            top: 20% !important;
            left: -25%;
            width: 635px !important;
            height: auto !important;
          }
          .about__title::after {
            display: none;
          }
          .arrow-prev {
            right: -50px;
          }
          .arrow-next {
            right: -100px;
          }
        }
        @media (max-width: 998px) {
          :root {
            --container: 740px;
          }
          .container {
            max-width: var(--container);
          }
          section {
            margin-bottom: 200px;
          }
          .stn-title {
            font-size: 52px;
            line-height: 64px;
            letter-spacing: -0.04em;
          }
          .hero__container {
            display: flex;
            flex-direction: column-reverse;
            align-items: flex-start;
            padding-top: 0;
          }
          .hero__container::after {
            top: 10%;
            left: 0;
          }
          .hero__content {
            max-width: 553px;
            margin: 0 auto;
          }
          .hero__title::after {
            display: none;
          }
          .hero__img-block {
            margin: auto;
          }
          .hero__img-block::after {
            display: none;
          }
          .utilities__wrapper {
            display: block;
          }
          .utilities__column {
            max-width: 507px;
          }
          .utilities canvas {
            right: -20%;
            top: 0;
          }
          .utilities__title {
            position: relative;
          }
          .utilities__title::after {
            position: absolute;
            right: 30%;
            top: -100%;
            content: '';
            width: 146px;
            height: 146px;
            background: url('/united-token-data/img/decoration-146px.svg');
            background-size: contain;
          }
          .roadmap canvas {
            left: -80%;
            width: 930px !important;
            height: auto !important;
          }
          .roadmap__column--tablet {
            display: block;
            margin-bottom: 60px;
          }
          .roadmap__column--1 {
            max-width: 320px;
          }
          .roadmap__column--2::after {
            right: -10px;
            top: 0;
            left: unset;
          }
          .roadmap__column--desctop {
            display: none;
          }
          .roadmap__column--2,
          .roadmap__column--3,
          .roadmap__column--4 {
            max-width: 320px;
            padding-right: 50px;
          }
          .roadmap__content {
            max-width: unset;
          }
          .groups__wrapper {
            grid-template-columns: repeat(2, 1fr);
          }
          .groups__wrapper::after {
            right: -13%;
            top: -22%;
          }
          .team__top {
            display: block;
          }
          .slider__item {
            width: 274px !important;
            min-height: 380px !important;
          }
          .slick-current .slider__item {
            opacity: 1;
          }
          .slider__name {
            font-size: 24px;
            line-height: 29px;
          }
          .slider__role {
            font-size: 12px;
            line-height: 15px;
          }
          .faq canvas {
            right: -20%;
          }
          .faq__wrapper {
            display: block;
          }
          .faq__column {
            width: 100%;
          }
          .faq__container::after {
            display: none;
          }
          .social__wrapper {
            display: block;
          }
          .social__column {
            margin-bottom: 60px;
          }
          .social__column--1 {
            justify-content: space-between;
          }
          .social__column--2 {
            margin-bottom: 0;
          }
          .social__wrapper::after {
            display: none;
          }
          .social canvas {
            right: -46%;
            top: -59%;
          }
        }
        @media (max-width: 768px) {
          :root {
            --container: 540px;
          }
          .container {
            max-width: var(--container);
          }
          .about canvas {
            left: -70%;
          }
          .about {
            margin-bottom: 200px;
          }
          .utilities canvas {
            right: -60%;
          }
          .slider__item {
            width: 90% !important;
            min-height: 344px !important;
          }
          .slick-current .slider__item {
            opacity: 1;
          }
          .arrow-prev {
            top: unset;
            left: 0;
            bottom: -80px;
          }
          .arrow-next {
            top: unset;
            left: 50px;
            bottom: -80px;
          }
          .team__wrapper {
            padding-right: 50px;
          }
          .members__wrapper {
            padding-right: 50px;
          }
          .roadmap__title::after {
            display: none;
          }
          .roadmap__title::before {
            transform: rotate(45deg);
            right: -20%;
            top: 10%;
          }
          .faq__title::after {
            top: -160%;
            left: 60%;
          }
          .footer__container {
            display: block;
          }
          .footer__logo {
            margin-bottom: 20px;
          }
          .footer__content {
            justify-content: space-between;
          }
        }
        @media (max-width: 576px) {
          :root {
            --container: 100%;
          }
          .container {
            max-width: var(--container);
          }
          section {
            margin-bottom: 100px !important;
          }
          .stn-title {
            font-size: 24px;
            line-height: 29px;
            margin-bottom: 15px;
          }
          .stn-text {
            font-weight: 400;
            font-size: 12px;
            line-height: 15px;
            text-align: left;
            color: #ebebeb;
          }
          .hero__gif {
            width: 300px;
            height: 300px;
            top: 50%;
            left: 50%;
            transform: translate(-150px, -150px);
          }
          .hero__btn {
            min-width: unset;
            width: 140px;
            padding: 8px 0;
          }
          .hero__title {
            font-weight: 800;
            font-size: 24px;
            line-height: 29px;
            letter-spacing: -0.03em;
            color: #fafafa;
          }
          .hero__container::after {
            display: none;
          }
          .hero {
            margin-bottom: 125px;
          }
          .about {
            margin-bottom: 125px;
          }
          .about canvas {
            width: 517px !important;
          }
          .about__title::after {
            display: none;
          }
          .about__subtitle {
            font-weight: 800;
            font-size: 20px;
            line-height: 20px;
            letter-spacing: 0.03em;
            color: rgba(250, 250, 250, 0.1);
            writing-mode: unset;
            transform: rotate(0);
            max-width: 192px;
            margin-bottom: 15px;
          }
          .about__wrapper {
            display: block;
            width: 100%;
          }
          .about__content::after {
            width: 146px;
            height: 146px;
            top: -70%;
          }
          .about__btn-block {
            margin-top: 40px;
          }
          .about__btn {
            padding: 8px 0;
            width: 90%;
          }
          .slider__item {
            width: 270px !important;
            min-height: 364px !important;
          }
          .members {
            margin-bottom: 150px !important;
          }
          .team {
            margin-bottom: 150px !important;
          }
          .team__top {
            margin-bottom: 20px;
          }
          .slick-current .slider__item {
            opacity: 1;
          }
          .slider__name {
            font-size: 20px;
            line-height: 24px;
          }
          .slider__role {
            font-size: 12px;
            line-height: 15px;
          }
          .utilities__title::after {
            display: none;
          }
          .utilities__text {
            font-weight: 400;
            font-size: 12px;
            line-height: 15px;
            color: #fafafa;
          }
          .utilities canvas {
            position: absolute;
            right: -60%;
            top: unset;
            bottom: -10%;
          }
          .roadmap__title::before {
            display: none;
          }
          .roadmap__caption {
            font-weight: 600;
            font-size: 16px;
            line-height: 19px;
            margin-bottom: 10px;
          }
          .roadmap__text {
            font-weight: 300;
            font-size: 14px;
            line-height: 17px;
          }
          .roadmap__wrapper--2 {
            padding-top: 46px;
          }
          .roadmap canvas {
            left: -80%;
            width: 599px !important;
            height: auto !important;
          }
          .roadmap__column--2,
          .roadmap__column--3 {
            margin-bottom: 20px;
          }
          .roadmap__column--1,
          .roadmap__column--2,
          .roadmap__column--3,
          .roadmap__column--4 {
            max-width: unset;
          }
          .social canvas {
            right: -46%;
            top: 0;
            opacity: 0.3;
          }
          .groups__wrapper::after {
            right: 0;
            top: -9%;
            width: 200px;
            height: 200px;
          }
          .groups__wrapper {
            gap: 30px;
          }
          .groups__item {
            display: block;
          }
          .groups__item img {
            width: 54px;
            height: 54px;
            margin-bottom: 10px;
          }
          .groups__caption {
            font-weight: 800;
            font-size: 14px;
            line-height: 17px;
            margin-bottom: 5px;
            color: #fafafa;
          }
          .groups__subs {
            font-weight: 300;
            font-size: 12px;
            line-height: 15px;
            color: #ebebeb;
          }
          .dropdown {
            padding: 10px 20px 10px 20px;
            min-height: unset;
          }
          .dropdown__header {
            gap: 10px;
          }
          .dropdown__title {
            font-weight: 600;
            font-size: 16px;
            line-height: 22px;
            color: #fafafa;
          }
          .dropdown__body {
            font-weight: 300;
            font-size: 14px;
            line-height: 17px;
            color: #ebebeb;
          }
          .dropdown__body--active {
            margin-top: 10px;
          }
          .slick-list {
            overflow: unset !important;
          }
          .social__column--1 {
            display: block;
          }
          .social__vertical {
            writing-mode: unset;
            transform: rotate(0);
          }
          .social__subtitle {
            font-weight: 800;
            font-size: 24px;
            line-height: 24px;
            margin-bottom: 10px;
            letter-spacing: 0.03em;
            color: rgba(250, 250, 250, 0.1);
          }
          .social__text {
            font-style: normal;
            font-weight: 400;
            font-size: 14px;
            line-height: 17px;
            color: #ebebeb;
            margin-bottom: 10px;
          }
          .social__subtitle--app {
            max-width: 273px;
          }
          .social__column {
            margin-bottom: 20px;
          }
          .social__column--2 {
            margin-right: unset;
          }
          .social__link::after {
            right: 40px;
          }
          .social__link {
            font-weight: 700;
            font-size: 20px;
            line-height: 24px;
            color: #fafafa;
          }
          .social canvas {
            width: 450px !important;
            height: auto !important;
            position: absolute;
            right: -46%;
            z-index: -1;
            top: 0;
            opacity: 0.5;
          }
          .footer__container {
            text-align: center;
          }
          .footer__link-list {
            justify-content: center;
            margin-bottom: 20px;
          }
          .footer__social-list {
            justify-content: center;
          }
          .footer__content {
            display: block;
            margin-left: auto;
          }
        }
        @media (max-width: 360px) {
          .slider__item {
            width: 80% !important;
            min-height: unset;
            height: 300px !important;
          }
          .slick-current .slider__item {
            width: 80% !important;
            min-height: unset;
            height: 300px !important;
          }
        }
        @keyframes rotating {
          from {
            transform: rotate(0);
          }
          to {
            transform: rotate(360deg);
          }
        }
        canvas {
          animation: rotating 30s linear infinite;
        }
      `}</style>
    </>
  )
}

UnitedToken.getLayout = UnitedMetaverseTokenLayout

UnitedToken.propTypes = {
  infuraId: PropTypes.string,
  contractId: PropTypes.string,
}

export default UnitedToken
