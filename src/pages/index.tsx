import React, { useEffect, useMemo, useRef, useState } from 'react'
import Slider from 'react-slick'
import clsx from 'clsx'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import useTranslation from 'next-translate/useTranslation'

import JoinApps from '@/components/JoinApps'
import styles from '@/css/home.module.css'
import public_styles from '@/css/public.module.css'
import { FullLogo } from '@/lib/svg'
import { isDevelopment } from '@/lib/utils'
import { FC } from '@/model/commonModel'

type Slide = {
  img: string
  name: string
  sizes: {
    width: number
    height: number
  }
  description: string
}
type SlideMenuItemType = {
  index: number
  slide: Partial<Pick<Slide, 'sizes'>> & Omit<Slide, 'sizes'>
  sliderRef: React.RefObject<Slider>
  setActive: React.Dispatch<React.SetStateAction<any>>
}

const Home: FC<unknown> = () => {
  const { t } = useTranslation('home')
  const router = useRouter()

  const [activeSlide, setActiveSlide] = useState(0)
  const [activeCombineSlide1, setActiveCombineSlide1] = useState(0)
  const [activeCombineSlide2, setActiveCombineSlide2] = useState(0)
  const [activeCombineSlider, setActiveCombineSlider] = useState('first')
  const [urlParams, setUrlParams] = useState('')

  const slider = useRef<Slider>(null)
  // const partnersSlider = useRef<Slider>(null);
  const reviewsSlider = useRef<Slider>(null)
  const combineSlider1 = useRef<Slider>(null)
  const combineSlider2 = useRef<Slider>(null)
  const combineSlider = useRef<Slider>(null)

  /* Slider initial settings */
  const initialSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    arrows: false,
    slidesToScroll: 1,
    slidesToShow: 1,
    autoplay: true,
    autoplaySpeed: 6000,
  }

  const initialSlider1Settings = {
    ...initialSettings,
    ...{
      afterChange: (index: number) => {
        setActiveSlide(index)
      },
    },
  }

  const initialCombineSliderSettings = {
    ...initialSettings,
    ...{
      autoplay: false,
      infinite: false,
      swipe: false,
      touchMove: false,
    },
  }

  const initialCombineSlider1Settings = {
    ...initialSettings,
    ...{
      autoplaySpeed: 7000,
      afterChange: (index: number) => {
        setActiveCombineSlide1(index)
      },
    },
  }

  const initialCombineSlider2Settings = {
    ...initialSettings,
    ...{
      autoplaySpeed: 7000,
      afterChange: (index: number) => {
        setActiveCombineSlide2(index)
      },
    },
  }

  // const initialPartnersSliderSettings = {
  //     ...initialSettings, ...{
  //         slidesToScroll: 5,
  //         slidesToShow: 5,
  //         variableWidth: true,
  //         autoplay: false,
  //         responsive: [
  //             {
  //                 breakpoint: 768,
  //                 settings: {
  //                     slidesToShow: 1,
  //                     slidesToScroll: 1,
  //                     variableWidth: false
  //                 }
  //             }
  //         ]
  //     }
  // }

  // const featuredElements = [
  //     '/img/home/featured/item1.png',
  //     '/img/home/featured/item2.png',
  //     '/img/home/featured/item3.png',
  // ]

  const sliderElements1: Slide[] = [
    {
      img: '/img/home/slider/slide1.png',
      name: t('slider1.menu.item1.name'),
      sizes: {
        width: 325,
        height: 660,
      },
      description: t('slider1.menu.item1.description'),
    },
    {
      img: '/img/home/slider/slide3.png',
      name: t('slider1.menu.item3.name'),
      sizes: {
        width: 600,
        height: 600,
      },
      description: t('slider1.menu.item3.description'),
    },
    {
      img: '/img/home/slider/slide5.png',
      name: t('slider1.menu.item5.name'),
      sizes: {
        width: 600,
        height: 600,
      },
      description: t('slider1.menu.item5.description'),
    },
  ]

  const combinedSliderElements1: Omit<Slide, 'sizes'>[] = useMemo(
    () => [
      {
        img: '/img/home/combine_slider1/slide1.png',
        name: t('combined_slider.slider1.menu.item1.name'),
        description: t('combined_slider.slider1.menu.item1.description'),
      },
      {
        img: '/img/home/combine_slider1/slide2.png',
        name: t('combined_slider.slider1.menu.item2.name'),
        description: t('combined_slider.slider1.menu.item2.description'),
      },
      {
        img: '/img/home/combine_slider1/slide3.png',
        name: t('combined_slider.slider1.menu.item3.name'),
        description: t('combined_slider.slider1.menu.item3.description'),
      },
    ],
    [t],
  )

  const combinedSliderElements2: Omit<Slide, 'sizes'>[] = [
    {
      img: '/img/home/combine_slider2/slide1.png',
      name: t('combined_slider.slider2.menu.item1.name'),
      description: t('combined_slider.slider2.menu.item1.description'),
    },
    {
      img: '/img/home/combine_slider2/slide2.png',
      name: t('combined_slider.slider2.menu.item2.name'),
      description: t('combined_slider.slider2.menu.item2.description'),
    },
    {
      img: '/img/home/combine_slider2/slide3.png',
      name: t('combined_slider.slider2.menu.item3.name'),
      description: t('combined_slider.slider2.menu.item3.description'),
    },
  ]

  // const partnersSliderElements: Omit<Slide, 'description' | 'sizes'>[] = [
  //     {
  //         img: t('partners.list.item1.image'),
  //         name: t('partners.list.item1.title'),
  //     },
  //     {
  //         img: t('partners.list.item2.image'),
  //         name: t('partners.list.item2.title'),
  //     },
  //     {
  //         img: t('partners.list.item3.image'),
  //         name: t('partners.list.item3.title'),
  //     },
  //     {
  //         img: t('partners.list.item4.image'),
  //         name: t('partners.list.item14.title'),
  //     },
  //     {
  //         img: t('partners.list.item1.image'),
  //         name: t('partners.list.item5.title'),
  //     },
  // ];

  const reviewsElements: Omit<Slide, 'sizes'>[] = [1, 2, 3, 4, 5, 6].map((index) => ({
    img: t(`reviews.item${index}.image`),
    name: t(`reviews.item${index}.name`),
    description: t(`reviews.item${index}.content`),
  }))

  const SliderMenuItem = ({ index, slide, sliderRef, setActive }: SlideMenuItemType) => {
    const onSliderMenuClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault()
      setActive(index)
      sliderRef.current && sliderRef.current.slickGoTo(index)
    }

    const onSliderNext = () => {
      sliderRef.current && sliderRef.current.slickNext()
    }

    const onSliderPrev = () => {
      sliderRef.current && sliderRef.current.slickPrev()
    }
    return (
      <div className={clsx('d-flex align-items-center', styles.slider__arrow_block)}>
        <svg
          onClick={onSliderPrev}
          className={clsx(styles.slider__arrow, styles.slider__left_arrow)}
          viewBox='0 0 11 16'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path d='M9.86667 6.4C10.9333 7.2 10.9333 8.8 9.86667 9.6L3.2 14.6C1.88153 15.5889 -6.84e-07 14.6481 -6.11959e-07 13L-1.74846e-07 3C-1.02805e-07 1.35191 1.88153 0.411145 3.2 1.4L9.86667 6.4Z' />
        </svg>
        <a onClick={onSliderMenuClick} href='#' title={slide.name}>
          {slide.name}
        </a>
        <svg
          onClick={onSliderNext}
          className={clsx(styles.slider__arrow, styles.slider__right_arrow)}
          viewBox='0 0 11 16'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path d='M9.86667 6.4C10.9333 7.2 10.9333 8.8 9.86667 9.6L3.2 14.6C1.88153 15.5889 -6.84e-07 14.6481 -6.11959e-07 13L-1.74846e-07 3C-1.02805e-07 1.35191 1.88153 0.411145 3.2 1.4L9.86667 6.4Z' />
        </svg>
      </div>
    )
  }

  // eslint-disable-next-line react/display-name
  const SliderControls = useMemo(
    () =>
      ({ sliderRef }: { sliderRef: React.RefObject<Slider> }) => {
        const onSliderNext = () => {
          sliderRef.current && sliderRef.current.slickNext()
        }

        const onSliderPrev = () => {
          sliderRef.current && sliderRef.current.slickPrev()
        }
        return (
          <>
            <svg
              onClick={onSliderPrev}
              className={clsx(styles.slider__arrow, styles.slider__left_arrow)}
              viewBox='0 0 11 16'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path d='M9.86667 6.4C10.9333 7.2 10.9333 8.8 9.86667 9.6L3.2 14.6C1.88153 15.5889 -6.84e-07 14.6481 -6.11959e-07 13L-1.74846e-07 3C-1.02805e-07 1.35191 1.88153 0.411145 3.2 1.4L9.86667 6.4Z' />
            </svg>
            <svg
              onClick={onSliderNext}
              className={clsx(styles.slider__arrow, styles.slider__right_arrow)}
              viewBox='0 0 11 16'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path d='M9.86667 6.4C10.9333 7.2 10.9333 8.8 9.86667 9.6L3.2 14.6C1.88153 15.5889 -6.84e-07 14.6481 -6.11959e-07 13L-1.74846e-07 3C-1.02805e-07 1.35191 1.88153 0.411145 3.2 1.4L9.86667 6.4Z' />
            </svg>
          </>
        )
      },
    [],
  )

  const handleExploreClick = () => {
    const exploreBlockDOM = document.getElementById('explore-block')
    exploreBlockDOM && exploreBlockDOM.scrollIntoView({ behavior: 'smooth' })
  }

  const CombineSliderControls = () => {
    const Control = ({ sliderIndex, index }: { sliderIndex: string; index: number }) => {
      const handleActiveCombineSlider = () => {
        setActiveCombineSlider(sliderIndex)
        combineSlider.current && combineSlider.current.slickGoTo(index)
      }

      return (
        <a
          title={t(`combined_slider.controls.${sliderIndex}`)}
          onClick={handleActiveCombineSlider}
          className={activeCombineSlider === sliderIndex ? styles.selected : undefined}
        >
          {t(`combined_slider.controls.${sliderIndex}`)}
        </a>
      )
    }

    return (
      <div className={styles.combined_sliders_controls}>
        <Control sliderIndex={'first'} index={0} />
        <Control sliderIndex={'second'} index={1} />
      </div>
    )
  }

  useEffect(() => {
    let params: Record<string, string> = {}
    let searchParams = ''
    const referer = document.referrer ? new URL(document.referrer).hostname : ''

    if (Object.keys(router.query).length) {
      params = Object.keys(router.query).reduce((accum, curVal) => {
        if (curVal.includes('utm_') && router.query[curVal]) {
          accum[curVal] = router.query[curVal] as string
        }
        return accum
      }, params)

      if (!params['utm_source'] && referer) {
        params['utm_source'] = referer
      }
      if (!params['utm_campaign']) {
        params['utm_campaign'] = `home${referer ? `[${referer}]` : ``}`
      }

      if (Object.keys(params).length) {
        searchParams = new URLSearchParams(params).toString()
        setUrlParams((prev) => (prev.length ? `${prev}&` : '') + searchParams)
      }
    } else {
      setUrlParams(`utm_campaign=home${referer ? `[${referer}]&utm_source=${referer}` : ``}`)
    }
  }, [router.query])

  return (
    <>
      <Head>
        <title>{t('title')}</title>
        <meta name='description' content={t('description')} />

        <meta property='og:title' content={t('title')} />
        <meta property='og:description' content={t('description')} />
        <meta property='og:url' content={`https://${isDevelopment ? 'stage.' : ''}connect.club`} />
      </Head>
      {/*<div className={clsx(styles.promo, 'relative')}>*/}
      {/*    <div className={styles.promo__title}>{t('connectcon.title')}</div>*/}
      {/*    <Link href='/l/connectcon-nft'>*/}
      {/*        <a title={t('connectcon.button')} className={styles.promo__button}>*/}
      {/*            {t('connectcon.button')}*/}
      {/*        </a>*/}
      {/*    </Link>*/}
      {/*    <PromoBg />*/}
      {/*</div>*/}
      <div className={clsx(styles.promo, styles.header, 'relative')}>
        <div className={styles.promo__title} dangerouslySetInnerHTML={{ __html: t('header.title') }} />
        <Link href={`/club/united-metaverse-by-connect-club?${urlParams || 'utm_campaign=home'}`}>
          <a title={t('header.button')} className={styles.promo__button}>
            {t('header.button')}
          </a>
        </Link>
      </div>
      <div className={clsx(styles.home_page)}>
        <a
          href='https://discord.gg/FZWdCn7XZU'
          className={styles.discord_button}
          title={'Join the Connect.Club Discord server'}
        >
          <Image src='/img/svg/discord.svg' width={96} height={96} alt={'Join the Connect.Club Discord server'} />
        </a>

        <section className={clsx(public_styles.block, styles.first_block, 'smooth-scroll-section')}>
          <div className={clsx(styles.cols, 'container relative')}>
            <div className={clsx('d-flex align-items-center gutter-1', styles.logo)}>
              <Link href='/'>
                <a title='Connect club' style={{ width: '170px' }}>
                  <FullLogo id='header' />
                </a>
              </Link>
              <div className={styles.product_hunt}>
                <a href='https://www.producthunt.com/posts/connect-club-2-0' target={'_blank'} rel={'noreferrer'}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      'https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=317749&theme=light&period=daily'
                    }
                    alt='Connect.Club 2.0 - Social network in the Metaverse for genuine human connection'
                    width={250}
                    height={54}
                  />
                </a>
              </div>
            </div>
            <div className={styles.cols__col_left}>
              <h1 className={clsx(public_styles.h1, styles.cols__title)}>{t('h1')}</h1>
              <p>{t('main_description')}</p>
              <a title={t('explore_button')} className={styles.button} onClick={handleExploreClick}>
                {t('explore_button')}
              </a>
            </div>
            <div className={styles.cols__col_right}>
              <div className={styles.cols__video}>
                <video width='100%' loop autoPlay playsInline muted>
                  <source src='/img/home/video.mp4' type='video/mp4' />
                </video>
                <Image
                  src='/img/home/phone1.png'
                  width={480}
                  height={970}
                  quality={100}
                  priority={true}
                  alt={t('h1')}
                />
              </div>
            </div>
          </div>
        </section>

        {/*<section className={clsx(public_styles.block_small)}>*/}
        {/*    <div className={'container'}>*/}
        {/*        <div className={'h2 align-center'}>{t('partners.heading')}</div>*/}
        {/*        <div className={styles.partners_slider}>*/}
        {/*            <Slider {...initialPartnersSliderSettings} ref={partnersSlider}>*/}
        {/*                {partnersSliderElements.map((slide, index) => (*/}
        {/*                    <div key={index} className={clsx(styles.partners_image)}>*/}
        {/*                        <Image src={slide.img}*/}
        {/*                               layout={'fill'}*/}
        {/*                               quality={100}*/}
        {/*                               alt={slide.name}*/}
        {/*                               objectFit={'cover'}*/}
        {/*                        />*/}
        {/*                    </div>*/}
        {/*                ))}*/}
        {/*            </Slider>*/}
        {/*            <SliderControls sliderRef={partnersSlider} />*/}
        {/*        </div>*/}
        {/*    </div>*/}
        {/*</section>*/}

        <section className={clsx(public_styles.block_small)}>
          <div className={'container'}>
            <div className={styles.reviews_slider}>
              <Slider {...initialSettings} autoplaySpeed={6500} ref={reviewsSlider}>
                {reviewsElements.map((slide, index) => (
                  <div key={index} className={styles.reviews_slider_item}>
                    <div className={styles.reviews_slider_image}>
                      <Image src={slide.img} width={144} height={144} objectFit={'cover'} alt={slide.name} />
                    </div>
                    <div>
                      <div className={styles.reviews_slider_content}>{slide.description}</div>
                      <div className={styles.reviews_slider_name}>{slide.name}</div>
                    </div>
                  </div>
                ))}
              </Slider>
              <SliderControls sliderRef={reviewsSlider} />
            </div>
          </div>
        </section>

        <section id={'explore-block'} className={clsx(public_styles.block, 'smooth-scroll-section')}>
          <div className={clsx(styles.cols, styles.slider__block, 'container relative')}>
            <div className={clsx(styles.cols__col_left, styles.with_circle)}>
              <Slider {...initialSlider1Settings} ref={slider}>
                {sliderElements1.map((slide, index) => (
                  <div key={index} className={clsx(styles.slider_item, styles.with_circle)}>
                    <Image
                      src={slide.img}
                      width={slide.sizes.width}
                      height={slide.sizes.height}
                      quality={100}
                      alt={slide.name}
                      priority={true}
                    />
                  </div>
                ))}
              </Slider>
            </div>
            <div className={styles.cols__col_right}>
              <div className={clsx(public_styles.h1, styles.cols__title)}>{t('slider1.title')}</div>
              <ul className={styles.slider__menu}>
                {sliderElements1.map((slide, index) => (
                  <li className={activeSlide === index ? styles.selected : undefined} key={index}>
                    <SliderMenuItem index={index} slide={slide} sliderRef={slider} setActive={setActiveSlide} />
                    <p>{slide.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className={clsx(public_styles.block_small, 'smooth-scroll-section')}>
          <div className={styles.combined_sliders}>
            <CombineSliderControls />

            <div>
              <Slider {...initialCombineSliderSettings} ref={combineSlider}>
                <div
                  className={clsx(
                    styles.combined_slider_first,
                    activeCombineSlider !== 'first' ? styles.hide_combine_slider : undefined,
                  )}
                >
                  <div className={clsx(styles.cols, styles.cols_revert, styles.slider__block, 'container relative')}>
                    <div className={styles.cols__col_left}>
                      <ul className={styles.slider__menu}>
                        {combinedSliderElements1.map((slide, index) => (
                          <li className={activeCombineSlide1 === index ? styles.selected : undefined} key={index}>
                            <SliderMenuItem
                              index={index}
                              slide={slide}
                              sliderRef={combineSlider1}
                              setActive={setActiveCombineSlide1}
                            />
                            <p>{slide.description}</p>
                          </li>
                        ))}
                      </ul>
                      <div className={styles.combined_slider_button_block}>
                        <Link href={`/club/united-metaverse-by-connect-club?${urlParams || 'utm_campaign=home'}`}>
                          <a title={t('combined_slider.slider1.button')} className={styles.button}>
                            {t('combined_slider.slider1.button')}
                          </a>
                        </Link>
                        <div
                          className={styles.combined_slider_extra}
                          dangerouslySetInnerHTML={{
                            __html: t('combined_slider.slider1.extra'),
                          }}
                        />
                      </div>
                    </div>
                    <div className={clsx(styles.cols__col_right, styles.with_circle, styles.mobile_no_circle)}>
                      <Slider {...initialCombineSlider1Settings} ref={combineSlider1}>
                        {combinedSliderElements1.map((slide, index) => (
                          <div
                            key={index}
                            className={clsx(styles.slider_item, styles.with_circle, styles.mobile_no_circle)}
                          >
                            <Image
                              src={slide.img}
                              width={325}
                              height={660}
                              quality={100}
                              alt={slide.name}
                              priority={true}
                            />
                          </div>
                        ))}
                      </Slider>
                    </div>
                  </div>
                </div>
                <div
                  className={clsx(
                    styles.combined_slider_second,
                    activeCombineSlider !== 'second' ? styles.hide_combine_slider : undefined,
                  )}
                >
                  <div className={clsx(styles.cols, styles.slider__block, 'container relative')}>
                    <div className={clsx(styles.cols__col_left, styles.with_circle, styles.mobile_no_circle)}>
                      <Slider {...initialCombineSlider2Settings} ref={combineSlider2}>
                        {combinedSliderElements2.map((slide, index) => (
                          <div
                            key={index}
                            className={clsx(styles.slider_item, styles.with_circle, styles.mobile_no_circle)}
                          >
                            <Image
                              src={slide.img}
                              width={325}
                              height={660}
                              quality={100}
                              alt={slide.name}
                              priority={true}
                            />
                          </div>
                        ))}
                      </Slider>
                    </div>
                    <div className={styles.cols__col_right}>
                      <ul className={styles.slider__menu}>
                        {combinedSliderElements2.map((slide, index) => (
                          <li className={activeCombineSlide2 === index ? styles.selected : undefined} key={index}>
                            <SliderMenuItem
                              index={index}
                              slide={slide}
                              sliderRef={combineSlider2}
                              setActive={setActiveCombineSlide2}
                            />
                            <p>{slide.description}</p>
                          </li>
                        ))}
                      </ul>
                      <div className={styles.combined_slider_button_block}>
                        <Link href={`/club/united-metaverse-by-connect-club?${urlParams || 'utm_campaign=home'}`}>
                          <a title={t('combined_slider.slider2.button')} className={styles.button}>
                            {t('combined_slider.slider2.button')}
                          </a>
                        </Link>
                        <div
                          className={styles.combined_slider_extra}
                          dangerouslySetInnerHTML={{
                            __html: t('combined_slider.slider2.extra'),
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Slider>
            </div>
          </div>
        </section>

        {/*<section className={clsx(public_styles.block_small)}>*/}
        {/*    <div className={'container'}>*/}
        {/*        <div className={clsx(styles.h2, 'align-center')}>{t('featured')}</div>*/}
        {/*        <div className={'d-flex justify-content-between'}>*/}
        {/*            {featuredElements.map((img, index) => (*/}
        {/*                <div key={index}>*/}
        {/*                    <Image src={img}*/}
        {/*                           width={198}*/}
        {/*                           height={60}*/}
        {/*                           quality={100}*/}
        {/*                           alt={'Featured in'}*/}
        {/*                           objectFit={'cover'}*/}
        {/*                    />*/}
        {/*                </div>*/}
        {/*            ))}*/}
        {/*        </div>*/}
        {/*    </div>*/}
        {/*</section>*/}

        {/*<section className={clsx(public_styles.block, 'smooth-scroll-section')}>*/}
        {/*    <div className={clsx(styles.cols, styles.cols_revert, 'container')}>*/}
        {/*        <div className={clsx(styles.cols__col_left)}>*/}
        {/*            <div className={clsx(public_styles.h1, styles.cols__title)}>*/}
        {/*                {t('section3.title')}*/}
        {/*            </div>*/}
        {/*            <p>{t('section3.description')}</p>*/}
        {/*        </div>*/}
        {/*        <div className={clsx(styles.cols__col_right, styles.with_circle)}>*/}
        {/*            <Image src='/img/home/phone2.png'*/}
        {/*                   width={480}*/}
        {/*                   height={970}*/}
        {/*                   quality={100}*/}
        {/*                   alt={t('section3.title')}*/}
        {/*            />*/}
        {/*        </div>*/}
        {/*    </div>*/}
        {/*</section>*/}

        {/*<section className={clsx(public_styles.block, 'smooth-scroll-section')}>*/}
        {/*    <div className={clsx(styles.cols, styles.slider__block, 'container relative')}>*/}
        {/*        <div className={clsx(styles.cols__col_left, styles.with_circle, styles.mobile_white_circle)}>*/}
        {/*            <Slider {...initialSlider2Settings} ref={slider2}>*/}
        {/*                {sliderElements2.map((slide, index) => (*/}
        {/*                    <div key={index} className={clsx(styles.slider_item, styles.with_circle)}>*/}
        {/*                        <Image src={slide.img}*/}
        {/*                               width={slide.sizes.width}*/}
        {/*                               height={slide.sizes.height}*/}
        {/*                               quality={100}*/}
        {/*                               alt={slide.name}*/}
        {/*                               priority={true}*/}
        {/*                        />*/}
        {/*                    </div>*/}
        {/*                ))}*/}
        {/*            </Slider>*/}
        {/*        </div>*/}
        {/*        <div className={styles.cols__col_right}>*/}
        {/*            <div className={clsx(public_styles.h1, styles.cols__title)}>*/}
        {/*                {t('slider2.title')}*/}
        {/*            </div>*/}
        {/*            <ul className={styles.slider__menu}>*/}
        {/*                {sliderElements2.map((slide, index) => (*/}
        {/*                    <li className={activeSlide2 === index ? styles.selected : undefined} key={index}>*/}
        {/*                        <SliderMenuItem index={index} slide={slide} sliderRef={slider2} />*/}
        {/*                        <p>{slide.description}</p>*/}
        {/*                    </li>*/}
        {/*                ))}*/}
        {/*            </ul>*/}
        {/*        </div>*/}
        {/*    </div>*/}
        {/*</section>*/}

        <section className={clsx(public_styles.block, 'smooth-scroll-section')}>
          <div className={clsx('container relative')}>
            <div className={clsx(public_styles.h1, styles.cols__title)}>{t('section5.title')}</div>
            <p className={'mb-sm'}>
              Our goal is to{` `}
              <Link href={'/dao'}>
                <a title={'launch DAO'}>launch DAO</a>
              </Link>
              {` `}
              to improve user experience, generate new opportunities, exchange value, support ideas, and new projects,
              allow creators to monetize their activities, and create tangible value for the future of the Metaverse.
            </p>
            <p>{t('section5.description')}</p>
          </div>
        </section>

        <section className={clsx(public_styles.block, styles.last_block, 'smooth-scroll-section')}>
          <div className={clsx('container relative')}>
            <div className={clsx(public_styles.h1, styles.cols__title)}>{t('section4.title')}</div>
            <p>{t('section4.description')}</p>
            <JoinApps className={styles.apps} />
          </div>
        </section>

        <style global jsx>
          {`
            .slick-list,
            .slick-slider,
            .slick-track {
              position: relative;
              display: block;
            }
            .slick-loading .slick-slide,
            .slick-loading .slick-track {
              visibility: hidden;
            }
            .slick-slider {
              box-sizing: border-box;
              -webkit-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;
              -webkit-touch-callout: none;
              -khtml-user-select: none;
              -ms-touch-action: pan-y;
              touch-action: pan-y;
              -webkit-tap-highlight-color: transparent;
            }
            .slick-list {
              overflow: hidden;
              margin: 0;
              padding: 0;
            }
            .slick-list:focus {
              outline: 0;
            }
            .slick-list.dragging {
              cursor: pointer;
              cursor: hand;
            }
            .slick-slider .slick-list,
            .slick-slider .slick-track {
              -webkit-transform: translate3d(0, 0, 0);
              -moz-transform: translate3d(0, 0, 0);
              -ms-transform: translate3d(0, 0, 0);
              -o-transform: translate3d(0, 0, 0);
              transform: translate3d(0, 0, 0);
            }
            .slick-track {
              top: 0;
              left: 0;
            }
            .slick-track:after,
            .slick-track:before {
              display: table;
              content: '';
            }
            .slick-track:after {
              clear: both;
            }
            .slick-slide {
              display: none;
              float: left;
              height: 100%;
              min-height: 1px;
            }
            .slick-slide img {
              display: block;
            }
            .slick-slide.slick-loading img {
              display: none;
            }
            .slick-slide.dragging img {
              pointer-events: none;
            }
            .slick-initialized .slick-slide {
              display: block;
            }
            .slick-vertical .slick-slide {
              display: block;
              height: auto;
              border: 1px solid transparent;
            }
          `}
        </style>
      </div>
    </>
  )
}

// const PromoBg = () => {
//     return (
//         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2800 80" fill="none" className={styles.promo__bg}>
//             <mask id="mask0_161:6862" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="2800" height="80">
//                 <rect width="2800" height="80" fill="#0A0528" />
//             </mask>
//             <g mask="url(#mask0_161:6862)">
//                 <rect width="2800" height="80" fill="url(#paint0_linear_161:6862)" />
//                 <g opacity="0.8">
//                     <path d="M1999.14 -313.628H800V415H1999.14V-313.628Z" fill="#0A0528" />
//                     <path d="M1084.69 -314.797L1084.6 -315L1084.64 -314.797L1104.42 -211.637C1107.68 -212.023 1110.97 -212.273 1114.23 -212.672C1115.51 -212.803 1116.8 -212.864 1118.09 -212.854C1121.32 -212.901 1124.54 -212.854 1127.77 -212.955L1084.69 -314.797ZM1173.96 150.997C1175.74 150.679 1177.54 150.375 1179.35 150.071C1177.54 150.373 1175.74 150.681 1173.96 150.997ZM1182.66 149.537L1181.76 149.686L1183.28 149.449L1184.78 149.212L1182.66 149.537ZM1224.23 144.805L1223.14 144.886H1222.77L1224.55 144.751L1224.23 144.805ZM1084.69 -314.797L1084.6 -315L1084.64 -314.797L1104.42 -211.637C1107.68 -212.023 1110.97 -212.273 1114.23 -212.672C1115.51 -212.803 1116.8 -212.864 1118.09 -212.854C1121.32 -212.901 1124.54 -212.854 1127.77 -212.955L1084.69 -314.797ZM1173.96 150.997C1175.74 150.679 1177.54 150.375 1179.35 150.071C1177.54 150.373 1175.74 150.681 1173.96 150.997ZM1182.66 149.537L1181.76 149.686L1183.28 149.449L1184.78 149.212L1182.66 149.537ZM1224.23 144.805L1223.14 144.886H1222.77L1224.55 144.751L1224.23 144.805Z" fill="#0A0528" />
//                     <path d="M1446.83 177.574C1426.79 165.718 1396.29 156.086 1359.47 150.044L1317.67 79.335L1446.83 177.574Z" fill="#82FF64" />
//                     <path d="M1219.95 4.99023V4.99709L1219.94 4.99023H1219.95Z" fill="url(#paint1_linear_161:6862)" />
//                     <path d="M1219.94 4.97697H1219.94L1131.95 -203.053L1219.94 4.97697Z" fill="url(#paint2_linear_161:6862)" />
//                     <path d="M1219.95 4.99023V4.99709L1219.94 4.99023H1219.95Z" fill="url(#paint3_linear_161:6862)" />
//                     <path d="M989.952 195.682C986.204 190.951 985.199 186.219 991.932 178.189C998.664 170.159 1014.81 162.826 1013.79 152.011C1012.77 141.196 995.304 140.52 978.079 107.271C973.039 97.5244 968.842 82.6405 970.041 74.2387C970.922 68.0878 974.507 26.0452 954.109 -8.33237L954.565 -9.40039L1066.31 210.553C1066.31 210.627 1066.31 210.688 1066.31 210.762C1039.98 211.322 1013.7 213.343 987.566 216.819C988.753 215.284 991.051 213.5 993.58 211.147C998.015 207.011 993.718 200.427 989.952 195.682Z" fill="url(#paint4_linear_161:6862)" />
//                     <path d="M1095.03 175.945C1076.78 186.084 1066.3 197.899 1066.3 210.552L954.553 -9.40088L1014.83 -151.048L1054.62 -120.787C1054.24 -119.796 1053.81 -118.832 1053.32 -117.9C1051.36 -114.108 1050.05 -109.931 1048.32 -106.004C1043.5 -95.1893 1038.41 -84.4894 1033.81 -73.5597C1031.5 -68.0829 1029.69 -62.373 1028.42 -56.5129C1027.4 -51.7408 1029.44 -47.2797 1032.65 -43.9407C1040.33 -35.9445 1037.59 -33.9167 1034.11 -26.7992C1028.38 -15.0651 1020.56 -4.87888 1012.4 5.01668C1006.23 12.4924 1006.64 19.9681 1015.15 24.997C1015.77 25.362 1016.44 25.673 1017.09 25.9704C1024.26 29.5866 1026.15 33.3515 1024.68 41.7871C1024.31 43.2533 1023.49 44.5415 1022.36 45.4438C1019.67 47.7081 1019.5 50.3848 1020.26 53.6969C1021.67 59.9019 1025.16 64.0114 1030.29 66.9044C1032.78 68.3171 1035.05 70.2841 1037.71 72.1902C1037.05 72.4651 1036.38 72.691 1035.69 72.8661C1028.66 74.1571 1025.82 80.0782 1025.45 87.8919C1025.25 92.0692 1027.89 94.3605 1030.96 96.1382C1036.39 99.2812 1036.3 99.3286 1034.85 105.601C1033.99 109.326 1033.54 113.172 1033.01 116.984C1031.57 127.278 1036.42 134.044 1043.81 139.391C1050.58 144.305 1058.17 146.353 1066.15 147.617C1075.22 149.05 1084.13 148.218 1093.05 146.569C1093.54 146.577 1094.02 146.643 1094.5 146.765C1094.3 149.82 1094.32 152.848 1093.87 155.87C1092.83 162.744 1093.49 169.442 1095.03 175.945Z" fill="url(#paint5_linear_161:6862)" />
//                     <path d="M1219.94 4.97697H1219.94L1131.95 -203.053L1219.94 4.97697Z" fill="url(#paint6_linear_161:6862)" />
//                     <path d="M1219.95 4.99023V4.99709L1219.94 4.99023H1219.95Z" fill="url(#paint7_linear_161:6862)" />
//                     <path d="M1824.47 151.93C1816.33 152.025 1808.37 152.322 1800.58 152.822C1798.19 152.971 1795.83 153.14 1793.48 153.329C1791.14 153.518 1788.82 153.723 1786.52 153.944C1783.07 154.282 1779.65 154.62 1776.31 155.059C1774.65 155.262 1772.98 155.476 1771.32 155.702C1769.65 155.927 1768.02 156.152 1766.43 156.377C1764.81 156.612 1763.21 156.862 1761.62 157.128C1760.56 157.297 1759.51 157.472 1758.46 157.655L1755.33 158.209C1754.3 158.392 1753.28 158.588 1752.26 158.784L1749.23 159.379L1747.74 159.683L1744.77 160.311C1737.9 161.805 1731.45 163.475 1725.41 165.3L1698.13 124.67L1698.28 124.183C1698.82 122.883 1699.24 121.523 1699.52 120.128L1750.74 -50.3206L1809.18 -112.587C1811.58 -109.748 1814.18 -106.686 1816.97 -103.354C1816.35 -99.0076 1815.92 -93.634 1814.65 -88.4835C1811.53 -76.0059 1808.03 -63.6499 1804.66 -51.2466C1801.38 -39.1611 1802.11 -28.4679 1809.65 -17.5382C1816.17 -8.07526 1816.32 4.01705 1811.16 14.9062C1807.27 23.1322 1802.15 30.6756 1797.69 38.5636C1794.44 44.3158 1791.08 50.0544 1788.32 56.0566C1785.01 63.2552 1786.59 68.6693 1791.63 74.1781C1795.66 78.5851 1800.48 80.9374 1805.66 82.8773C1807.54 83.5532 1809.41 84.4792 1811.86 85.581C1810.11 90.3598 1808.61 94.6519 1806.97 98.8765C1805.04 103.845 1804.61 108.799 1807.72 113.28C1811.01 118.012 1814.67 122.439 1818.41 127.319C1817.89 128.096 1817.45 128.935 1817.11 129.82C1814.82 136.64 1814.69 142.433 1819.13 145.664C1821.33 147.278 1823.16 149.423 1824.47 151.93Z" fill="url(#paint8_linear_161:6862)" />
//                     <path d="M1982.53 193.317C1981.41 191.508 1980.13 189.83 1978.69 188.308C1978.45 188.051 1978.21 187.795 1977.96 187.544C1977.46 187.031 1976.93 186.531 1976.39 186.03L1975.55 185.28L1974.86 184.685C1974.34 184.239 1973.79 183.8 1973.22 183.333C1973.04 183.185 1972.85 183.036 1972.66 182.894C1972.15 182.502 1971.63 182.117 1971.08 181.738C1970.54 181.353 1969.99 180.975 1969.43 180.596C1968.59 180.028 1967.72 179.467 1966.79 178.913C1965.43 178.079 1964 177.261 1962.51 176.459C1961.51 175.919 1960.48 175.389 1959.43 174.871C1957.85 174.087 1956.21 173.319 1954.5 172.566L1953.36 172.066L1952.27 171.599L1951.49 171.275L1951.16 171.14L1950.05 170.687L1948.91 170.234C1948.4 170.031 1947.89 169.835 1947.37 169.639L1945.81 169.051C1944.76 168.659 1943.69 168.281 1942.6 167.902L1940.96 167.341C1939.19 166.746 1937.39 166.165 1935.54 165.597C1934.15 165.174 1932.74 164.757 1931.3 164.347L1929.87 163.941C1928.42 163.536 1926.95 163.141 1925.45 162.758C1924.46 162.501 1923.45 162.245 1922.44 162.001C1920.41 161.501 1918.35 161.019 1916.25 160.555C1910.07 159.203 1903.59 157.966 1896.85 156.898L1894.94 156.601C1893.69 156.405 1892.38 156.215 1891.09 156.033L1889.14 155.763C1887.4 155.524 1885.65 155.298 1883.89 155.087C1866 152.934 1848.01 151.871 1830.01 151.903C1828.15 151.903 1826.3 151.903 1824.45 151.903C1823.15 149.362 1821.32 147.187 1819.1 145.549C1814.66 142.318 1814.79 136.526 1817.08 129.706C1817.42 128.82 1817.86 127.981 1818.38 127.205C1814.64 122.324 1810.98 117.897 1807.69 113.166C1804.57 108.684 1805.01 103.703 1806.94 98.7617C1808.58 94.5371 1810.06 90.245 1811.83 85.4662C1809.33 84.3983 1807.53 83.506 1805.63 82.7625C1800.45 80.8159 1795.64 78.4704 1791.6 74.0634C1786.56 68.5546 1784.98 63.1404 1788.29 55.9418C1791.05 49.9193 1794.4 44.2009 1797.66 38.4488C1802.11 30.5269 1807.24 22.9836 1811.13 14.7914C1816.29 3.91574 1816.13 -8.19009 1809.62 -17.653C1802.13 -28.5828 1801.38 -39.2827 1804.63 -51.3615C1807.99 -63.7647 1811.5 -76.1206 1814.62 -88.5982C1815.87 -93.715 1816.29 -99.0886 1816.94 -103.469C1814.12 -106.801 1811.55 -109.863 1809.15 -112.702L1871.1 -178.692L1937.01 41.3147L1982.53 193.317Z" fill="url(#paint9_linear_161:6862)" />
//                     <path d="M1986.85 -244.319L1937.05 41.4153L1871.1 -178.599L1939.38 -251.335C1940.29 -251.416 1941.2 -251.484 1942.1 -251.544C1950.15 -252.065 1958.29 -252.349 1966.28 -251.544C1971.55 -250.997 1976.65 -248.368 1981.79 -246.57C1983.48 -245.961 1985.15 -245.062 1986.85 -244.319Z" fill="url(#paint10_linear_161:6862)" />
//                     <path d="M1533.96 180.603L1535.26 179.203L1533.96 180.603ZM1532.21 181.501C1532.77 181.204 1533.34 180.913 1533.94 180.623C1533.35 180.902 1532.77 181.195 1532.21 181.501ZM1535.69 178.751L1651.51 55.3467L1535.69 178.751ZM1698.31 124.217C1698.85 122.917 1699.27 121.557 1699.56 120.161L1698.31 124.217Z" fill="white" />
//                     <path d="M1700.18 113.058C1700.25 105.251 1699.78 97.5113 1702.39 89.9409C1703.99 85.2906 1702.39 82.0529 1697.14 76.5711C1698.7 75.4829 1700.26 74.5433 1701.69 73.374C1706.22 69.7848 1706.86 66.4525 1704.11 61.2614C1703.84 60.7477 1703.55 60.2407 1703.3 59.7135C1699.84 52.454 1701.3 48.9662 1708.58 47.2088C1713.54 46.0057 1718.02 44.3632 1719.46 38.0569C1721.03 31.1692 1718.99 25.8902 1714.3 21.2601C1708.99 15.9947 1703.75 10.6413 1698.52 5.28122L1712.26 -9.3323L1717.88 -15.2872L1750.78 -50.334L1699.56 120.114C1699.99 117.791 1700.2 115.426 1700.18 113.058Z" fill="#3C87F0" />
//                     <path d="M1719.45 38.0563C1718.01 44.3626 1713.54 46.0051 1708.58 47.2082C1701.29 48.9656 1699.83 52.4534 1703.3 59.7129C1703.55 60.2401 1703.84 60.7471 1704.11 61.2608C1706.86 66.4519 1706.22 69.7842 1701.68 73.3734C1700.25 74.5089 1698.69 75.4823 1697.14 76.5705C1702.41 82.0523 1704.01 85.29 1702.38 89.9403C1699.77 97.5175 1700.25 105.25 1700.18 113.057C1700.17 115.428 1699.95 117.792 1699.5 120.114L1698.25 124.169C1698.2 124.311 1698.13 124.453 1698.07 124.595L1651.51 55.2856L1698.5 5.21973C1703.74 10.5798 1708.98 15.9332 1714.29 21.1986C1718.99 25.9098 1721.02 31.1686 1719.45 38.0563Z" fill="#A000FF" />
//                     <path d="M1698.08 124.655C1693.84 133.956 1685.87 136.991 1676.85 137.207C1667.57 137.43 1658.26 136.964 1648.99 137.424C1644.15 137.66 1639.04 138.417 1634.62 140.452C1630.82 142.216 1626.9 145.467 1624.73 149.239C1621.77 154.349 1619.18 159.702 1616.65 165.103L1616.41 165.623C1581.27 166.88 1551.26 172.098 1533.91 180.622L1535.22 179.223L1535.65 178.763L1651.47 55.3594L1698.08 124.655Z" fill="url(#paint11_linear_161:6862)" />
//                     <path d="M1472.72 347.651C1472.65 343.341 1471.41 339.15 1469.14 335.606L1469 335.383L1421.66 255.272C1453.43 243.369 1472.72 227.714 1472.72 210.559C1472.72 200.421 1466.02 190.856 1453.98 182.252C1459.76 176.02 1466.11 170.7 1474.08 167.381C1481.54 164.258 1486.64 158.743 1489.23 150.395C1491.91 141.784 1495.04 133.342 1497.76 124.751C1498.39 122.824 1498.76 120.29 1498.11 118.546C1496.48 114.247 1494.7 109.806 1492.06 106.224C1487.57 100.14 1482.38 94.7936 1479.61 87.257C1478.72 84.8372 1475.72 83.046 1473.36 81.6062C1470 79.5785 1466.17 78.3889 1462.82 76.3138C1459.7 74.3874 1456.94 71.8189 1454.08 69.4194C1447.53 63.9173 1440.57 58.929 1435.66 51.4262C1433.4 47.9655 1430.66 44.8765 1428.38 41.4293C1425.15 36.5423 1422.14 31.4999 1419.05 26.4913C1418.1 24.9164 1417.5 23.0508 1416.4 21.6111C1412.39 16.3118 1411.23 10.2353 1410.92 3.50307C1410.63 -1.62112 1409.56 -6.65765 1407.74 -11.4011C1404.97 -18.7282 1401.59 -25.751 1400.94 -33.8351C1400 -45.4813 1400.58 -56.4313 1411.11 -63.4812C1411.56 -63.803 1411.94 -64.2209 1412.23 -64.7091C1412.53 -65.1973 1412.73 -65.7456 1412.82 -66.3201C1413.29 -73.5458 1417.04 -78.7369 1421.31 -83.8334C1422.94 -85.7936 1423.87 -88.6256 1424.62 -91.2212C1425.25 -93.4315 1425.25 -95.8783 1425.44 -98.2238C1426.69 -111.79 1432.8 -121.239 1443.81 -126.39L1517.26 194.31L1518 197.561C1517.96 197.974 1517.94 198.39 1517.94 198.805C1517.94 206.159 1524.18 213.615 1535.03 220.198L1535.86 220.698C1502.7 229.539 1477.39 241.483 1463.9 255.171L1463.86 255.211C1456.82 262.376 1453.02 270.034 1453.02 277.99C1453.02 318.545 1552.12 351.47 1674.38 351.47C1676.99 351.47 1679.59 351.454 1682.18 351.422C1702.06 375.972 1724.13 403.32 1732.87 414.959H1400.33C1401.01 409.248 1401.9 401.84 1402.94 393.282C1444.43 384.685 1472.72 367.469 1472.72 347.651Z" fill="url(#paint12_linear_161:6862)" />
//                     <path d="M1651.52 55.3463L1535.69 178.75L1535.26 179.21L1533.96 180.602C1533.36 180.891 1532.78 181.188 1532.21 181.494C1531.65 181.798 1531.1 182.103 1530.56 182.407C1529.75 182.873 1528.99 183.34 1528.25 183.82C1527.77 184.137 1527.29 184.495 1526.84 184.793C1526.61 184.955 1526.39 185.117 1526.17 185.286C1525.51 185.78 1524.92 186.287 1524.29 186.8L1524.06 187.017L1523.83 187.226C1523.62 187.406 1523.41 187.596 1523.2 187.794L1522.63 188.368C1522.47 188.544 1522.3 188.72 1522.14 188.902C1521.84 189.234 1521.55 189.578 1521.28 189.916C1521.19 190.031 1521.1 190.146 1521.02 190.268L1520.76 190.619L1520.44 191.086C1520.31 191.268 1520.19 191.457 1520.07 191.647C1519.95 191.836 1519.93 191.883 1519.86 191.998L1519.59 192.492C1519.44 192.776 1519.29 193.066 1519.16 193.357C1519.08 193.533 1519 193.708 1518.94 193.884C1518.85 194.094 1518.77 194.31 1518.69 194.56C1518.62 194.81 1518.56 194.952 1518.5 195.155C1518.44 195.358 1518.42 195.412 1518.39 195.547C1518.36 195.682 1518.34 195.763 1518.31 195.865C1518.29 195.966 1518.26 196.088 1518.24 196.202C1518.23 196.252 1518.23 196.302 1518.24 196.351L1518.2 196.54C1518.14 196.885 1518.09 197.216 1518.06 197.575L1517.31 194.323L1443.86 -126.376C1444.88 -126.859 1445.93 -127.309 1447.03 -127.728C1454.98 -130.641 1463 -133.365 1471.09 -135.745C1473.69 -136.502 1474.31 -137.813 1474.91 -140.341C1476.55 -147.208 1479.79 -152.65 1486.99 -154.042C1488.06 -154.245 1489.11 -155.793 1489.78 -156.976C1492.69 -162.099 1495.77 -166.891 1501.02 -168.764L1651.52 55.3463Z" fill="#41B4FF" />
//                     <path d="M1717.82 -15.2881L1712.2 -9.33315C1711.13 -9.33315 1698.46 5.28036 1698.46 5.28036L1651.47 55.3462L1500.95 -168.764C1502.09 -169.175 1503.27 -169.433 1504.47 -169.534C1505.72 -169.649 1506.97 -170.366 1508.27 -170.555C1510.77 -170.913 1512.28 -172.272 1513.19 -174.901C1514.82 -179.633 1518.33 -181.992 1522.8 -182.188C1528.99 -182.458 1535.21 -182.255 1540.91 -182.255C1542.63 -187.575 1543.49 -192.354 1545.63 -196.328C1548 -200.862 1551.06 -204.926 1554.69 -208.346C1561.42 -214.429 1569.33 -216.673 1577.98 -213.348C1587.21 -209.799 1594.89 -203.662 1601.93 -196.45C1602.98 -195.457 1604.2 -194.715 1605.53 -194.273C1608.82 -193.104 1612.23 -192.313 1615.52 -191.076C1618.44 -189.968 1621.21 -189.048 1624.4 -189.88C1626.34 -190.25 1628.33 -190.232 1630.26 -189.826C1638.49 -188.535 1645.51 -184.101 1652.18 -179.119C1659.05 -174.009 1665.82 -168.98 1673.99 -166.533C1675.92 -165.965 1677.54 -164.269 1679.4 -163.309C1681.26 -162.252 1683.23 -161.429 1685.26 -160.855C1690.84 -159.551 1696.41 -159.118 1701.32 -154.867C1710.59 -146.837 1713.52 -128.053 1708.66 -118.563C1707.55 -116.262 1706.58 -113.882 1705.76 -111.439C1703.09 -103.936 1699.2 -96.602 1702.64 -88.1259C1702.73 -87.6648 1702.77 -87.1919 1702.75 -86.7199C1704.42 -73.5867 1701.34 -60.832 1699.99 -47.9556C1698.61 -34.6601 1702.99 -24.6834 1713.85 -18.127C1714.99 -17.451 1716.51 -17.1266 1717.27 -16.0992C1717.47 -15.8463 1717.66 -15.575 1717.82 -15.2881Z" fill="url(#paint13_linear_161:6862)" />
//                     <path d="M1469 335.376C1468.56 334.7 1468.09 333.977 1467.58 333.281C1467.46 333.112 1467.33 332.936 1467.2 332.767C1466.97 332.463 1466.73 332.165 1466.48 331.861C1466.24 331.557 1465.99 331.267 1465.73 330.969C1465.22 330.374 1464.69 329.779 1464.12 329.198C1463.79 328.86 1463.49 328.522 1463.12 328.198C1462.95 328.029 1462.77 327.86 1462.6 327.704C1462.23 327.353 1461.85 327.028 1461.47 326.67L1460.88 326.156C1460.53 325.859 1460.18 325.562 1459.83 325.271C1459.63 325.102 1459.43 324.947 1459.2 324.791C1458.9 324.548 1458.58 324.311 1458.29 324.075C1458 323.838 1457.67 323.602 1457.35 323.399L1456.73 322.932C1456.3 322.615 1455.86 322.304 1455.41 322.006C1455.19 321.844 1454.96 321.695 1454.74 321.547C1454.39 321.317 1454.05 321.087 1453.7 320.871L1452.64 320.195L1451.56 319.519L1450.45 318.843L1448.93 317.971C1448.42 317.68 1447.9 317.396 1447.37 317.113C1444.06 315.342 1440.49 313.661 1436.65 312.07L1435.94 311.773L1434.32 311.097L1432.45 310.36L1431.48 310.002C1430.85 309.759 1430.17 309.522 1429.51 309.285C1427.53 308.582 1425.49 307.906 1423.4 307.258C1422.78 307.062 1422.2 306.879 1421.59 306.697C1420.07 306.237 1418.53 305.784 1416.96 305.345L1415.28 304.892L1414.03 304.561C1412.78 304.236 1411.53 303.923 1410.28 303.621C1409.52 303.432 1408.76 303.249 1407.98 303.074L1405.85 302.594C1405.13 302.432 1404.42 302.276 1403.69 302.127C1402.24 301.816 1400.78 301.526 1399.32 301.242C1398.63 301.107 1397.93 300.971 1397.23 300.85L1395.94 300.613L1393.57 300.201C1392.06 299.944 1390.53 299.699 1388.98 299.464L1386.87 299.153L1385.44 298.95L1383.57 298.7L1381.91 298.491L1379.66 298.214L1378.95 298.133C1378.42 298.065 1377.89 298.011 1377.34 297.95L1376.41 297.849C1375.46 297.747 1374.53 297.646 1373.56 297.558C1372.58 297.47 1371.68 297.376 1370.72 297.294C1369.93 297.22 1369.13 297.153 1368.33 297.092L1366.56 296.956L1366.02 296.916C1365.03 296.842 1364.02 296.774 1363.01 296.713C1362.18 296.659 1361.35 296.605 1360.52 296.564C1358.75 296.463 1356.97 296.375 1355.18 296.314C1354.06 296.267 1352.93 296.227 1351.81 296.199C1350.69 296.172 1349.56 296.139 1348.43 296.118C1347.49 296.118 1346.55 296.085 1345.63 296.078C1344.5 296.078 1343.36 296.078 1342.22 296.078C1342.22 288.643 1339.37 281.437 1334 274.563L1298.4 190.458L1278.41 143.143L1257.53 93.8002C1258.01 92.7796 1258.5 91.7724 1259.01 90.7585C1265.83 77.24 1272.09 63.3971 1279.2 50.0611L1279.36 49.7568C1282.57 43.7546 1286.14 37.9552 1289.87 32.2842L1317.68 79.3286L1359.47 150.037L1379.21 183.421L1420.84 253.866L1421.66 255.218L1469 335.376Z" fill="url(#paint14_linear_161:6862)" />
//                     <path d="M1039.7 415H800V-43.4942C812.488 -48.5006 825.511 -51.7734 838.76 -53.2343C903.813 -60.0679 937.196 -36.8363 954.096 -8.33254L830.878 281.221C828.4 285.722 827.066 290.852 827.012 296.091C827.012 321.85 861.306 344.947 915.561 360.622C915.086 382.062 915.236 399.589 919.308 401.177C924.036 403.036 976.617 373.904 997.446 378.588C1016.3 382.805 1036.16 409.978 1039.7 415Z" fill="url(#paint15_linear_161:6862)" />
//                     <path d="M991.938 178.19C985.205 186.213 986.198 190.938 989.958 195.683C993.718 200.428 998.021 207.011 993.562 211.161C991.064 213.514 988.734 215.298 987.547 216.832C906.693 227.755 846.33 251.92 830.891 281.221L954.096 -8.33203C974.494 26.0456 970.909 68.0882 970.029 74.2391C968.83 82.6409 973.027 97.5247 978.067 107.272C995.292 140.541 1012.75 141.196 1013.78 152.011C1014.8 162.826 998.665 170.18 991.938 178.19Z" fill="url(#paint16_linear_161:6862)" />
//                     <path d="M1173.96 150.997C1141.31 156.783 1114 165.435 1095.03 175.946C1093.49 169.443 1092.83 162.765 1093.85 155.891C1094.29 152.903 1094.28 149.841 1094.47 146.786C1094 146.664 1093.51 146.598 1093.03 146.59C1084.1 148.239 1075.19 149.071 1066.12 147.638C1058.17 146.374 1050.56 144.326 1043.78 139.412C1036.39 134.065 1031.54 127.299 1032.98 117.005C1033.51 113.193 1033.96 109.347 1034.83 105.622C1036.27 99.3699 1036.36 99.3225 1030.93 96.1592C1027.86 94.3815 1025.23 92.1037 1025.43 87.9129C1025.79 80.0992 1028.64 74.1781 1035.67 72.8871C1036.35 72.712 1037.02 72.4862 1037.68 72.2112C1035.03 70.2916 1032.77 68.3381 1030.26 66.9254C1025.14 64.0325 1021.64 59.9228 1020.23 53.7178C1019.47 50.4058 1019.64 47.7291 1022.33 45.4648C1023.47 44.5625 1024.28 43.2742 1024.65 41.808C1026.12 33.3724 1024.23 29.6414 1017.06 25.9914C1016.44 25.6669 1015.75 25.383 1015.12 25.018C1006.61 19.9891 1006.21 12.5134 1012.37 5.03769C1020.54 -4.85786 1028.36 -15.0441 1034.08 -26.7782C1037.56 -33.8957 1040.33 -35.9235 1032.62 -43.9197C1029.41 -47.2587 1027.37 -51.7198 1028.39 -56.4919C1029.67 -62.352 1031.47 -68.0619 1033.78 -73.5387C1038.38 -84.4819 1043.48 -95.1683 1048.3 -105.983C1050.05 -109.91 1051.36 -114.094 1053.29 -117.879C1053.78 -118.811 1054.22 -119.775 1054.59 -120.766L1133.29 -60.8921L1173.96 150.997Z" fill="#A000FF" />
//                     <path d="M1289.85 32.291C1286.1 37.9621 1282.54 43.7818 1279.34 49.7637L1279.18 50.0679C1272.07 63.404 1265.8 77.2536 1258.98 90.7654C1258.48 91.7725 1257.99 92.7932 1257.51 93.8071L1219.95 5.01746L1131.95 -203.053L1127.77 -212.955L1084.67 -314.797H1084.7L1143.76 -214.882L1289.85 32.291Z" fill="#41B4FF" />
//                     <path d="M1257.51 93.7999C1254.35 100.559 1251.58 107.562 1246.51 113.023C1243.13 116.68 1241.56 121.29 1241.07 126.129C1240.48 132.017 1239.96 137.918 1239.55 143.825C1238.51 143.879 1237.48 143.927 1236.43 143.987L1235.43 144.041L1233.8 144.136L1231.58 144.265L1228.3 144.481H1227.86L1226.44 144.582H1226.03L1225.47 144.623L1224.52 144.697H1224.2L1223.12 144.778H1222.75L1221.19 144.9H1221.15L1218.59 145.116L1218.21 145.15C1217.73 145.15 1217.26 145.224 1216.79 145.272L1215.38 145.4L1212.12 145.711H1211.88L1207.57 146.15C1205.62 146.353 1203.68 146.569 1201.76 146.826C1199.83 147.083 1197.92 147.286 1196.02 147.502L1193.18 147.874C1192.43 147.969 1191.68 148.07 1190.94 148.178L1190.53 148.239L1187.98 148.604H1187.9L1187.23 148.699L1185.16 149.01H1184.94H1184.76L1182.64 149.334L1181.73 149.483C1181.37 149.544 1181 149.598 1180.64 149.665L1179.35 149.875C1177.54 150.172 1175.74 150.479 1173.96 150.794L1133.33 -61.1155L1104.42 -211.847C1107.68 -212.232 1110.97 -212.482 1114.23 -212.881C1115.51 -213.013 1116.8 -213.074 1118.09 -213.064C1121.32 -213.111 1124.54 -213.064 1127.77 -213.165L1131.95 -203.263L1219.94 4.767L1257.51 93.7999Z" fill="url(#paint17_linear_161:6862)" />
//                     <path d="M1219.94 4.97697H1219.94L1131.95 -203.053L1219.94 4.97697Z" fill="url(#paint18_linear_161:6862)" />
//                     <path d="M1219.95 4.99023V4.99709L1219.94 4.99023H1219.95Z" fill="white" />
//                     <path d="M1321.15 -55.7692C1319.4 -44.0081 1317.22 -32.3011 1314.73 -20.6954C1311.22 -4.50044 1304.63 10.7236 1295.37 24.0036C1293.49 26.7343 1291.64 29.4875 1289.82 32.2634L1143.78 -214.882C1145.73 -216.856 1147.46 -219.134 1149.62 -220.776C1151.04 -221.743 1152.72 -222.127 1154.38 -221.858C1157.18 -221.317 1159.84 -219.438 1162.62 -219.282C1166.64 -219.053 1170.41 -220.073 1174.29 -216.917C1176.79 -214.889 1180.9 -215.112 1184.45 -214.287C1186.95 -219.073 1188.6 -219.188 1192.09 -214.564C1193.03 -213.327 1194.31 -212.395 1195.51 -211.259C1198 -216.585 1198.79 -216.937 1203.75 -215.119C1204.65 -214.802 1205.52 -214.39 1206.35 -213.888C1210.3 -211.394 1214.22 -208.853 1218.15 -206.332C1220.59 -210.239 1221.84 -210.867 1225.13 -209.407C1228.42 -207.947 1231.24 -204.736 1235.43 -205.886C1236.15 -206.082 1237.31 -204.912 1238.09 -204.189C1239.26 -203.135 1240.3 -201.911 1241.43 -200.721C1242.95 -205.115 1244.9 -206.616 1247.86 -204.777C1255.98 -199.755 1266.15 -198.058 1271.24 -187.487C1274.09 -189.623 1276.07 -189.069 1278.01 -186.885C1281.53 -182.911 1285.61 -179.45 1288.68 -175.111C1291.76 -170.771 1294.79 -165.79 1296.51 -160.585C1299.91 -150.318 1301.72 -139.739 1297.07 -129.08C1296.45 -127.681 1296.98 -125.254 1297.7 -123.72C1299.06 -120.866 1300.74 -118.201 1302.69 -115.785C1310.58 -106.227 1314.88 -94.7566 1318.31 -82.7387C1320.82 -73.9314 1322.51 -64.9145 1321.15 -55.7692Z" fill="#82FF64" />
//                     <path d="M2800 -244.109V415H1792.88C1796.29 390.836 1806.44 343.663 1807.6 339.932C1808.01 338.666 1808.49 337.427 1809.03 336.221C1861.5 322.79 1895.31 301.708 1895.31 278.01C1895.31 268.96 1890.38 260.294 1881.38 252.325C1887.88 251.559 1894.18 250.658 1900.26 249.621C1950.64 241.071 1985.13 223.673 1985.13 203.598C1985.07 199.925 1984 196.356 1982.06 193.344L1936.55 41.4431L1986.35 -244.291C1987.76 -243.604 1989.27 -243.183 1990.82 -243.047C1993.47 -242.941 2797.45 -243.3 2800 -244.109Z" fill="url(#paint19_linear_161:6862)" />
//                 </g>
//             </g>
//             <defs>
//                 <linearGradient id="paint0_linear_161:6862" x1="1400" y1="0" x2="1400" y2="80" gradientUnits="userSpaceOnUse">
//                     <stop stopColor="#3677D7" />
//                     <stop offset="1" stopColor="#2E66BC" />
//                 </linearGradient>
//                 <linearGradient id="paint1_linear_161:6862" x1="1224.39" y1="8.23714" x2="1224.39" y2="8.23714" gradientUnits="userSpaceOnUse">
//                     <stop stopColor="#3C87F0" />
//                     <stop offset="0.99" stopColor="#0A0528" />
//                 </linearGradient>
//                 <linearGradient id="paint2_linear_161:6862" x1="47900.4" y1="66262.4" x2="60297.8" y2="66262.4" gradientUnits="userSpaceOnUse">
//                     <stop stopColor="#3C87F0" />
//                     <stop offset="0.99" stopColor="#0A0528" />
//                 </linearGradient>
//                 <linearGradient id="paint3_linear_161:6862" x1="1224.39" y1="8.23714" x2="1224.39" y2="8.23714" gradientUnits="userSpaceOnUse">
//                     <stop stopColor="#3C87F0" />
//                     <stop offset="0.99" stopColor="#0A0528" />
//                 </linearGradient>
//                 <linearGradient id="paint4_linear_161:6862" x1="954.096" y1="103.716" x2="1066.3" y2="103.716" gradientUnits="userSpaceOnUse">
//                     <stop stopColor="#FF6E00" />
//                     <stop offset="0.99" stopColor="#A000FF" />
//                 </linearGradient>
//                 <linearGradient id="paint5_linear_161:6862" x1="917.104" y1="-53.0792" x2="1040.29" y2="139.022" gradientUnits="userSpaceOnUse">
//                     <stop stopColor="#3C87F0" />
//                     <stop offset="0.99" stopColor="#0A0528" />
//                 </linearGradient>
//                 <linearGradient id="paint6_linear_161:6862" x1="47900.4" y1="66262.4" x2="60297.8" y2="66262.4" gradientUnits="userSpaceOnUse">
//                     <stop stopColor="#FF6E00" />
//                     <stop offset="0.99" stopColor="#A000FF" />
//                 </linearGradient>
//                 <linearGradient id="paint7_linear_161:6862" x1="1224.39" y1="8.23714" x2="1224.39" y2="8.23714" gradientUnits="userSpaceOnUse">
//                     <stop stopColor="#FF6E00" />
//                     <stop offset="0.99" stopColor="#A000FF" />
//                 </linearGradient>
//                 <linearGradient id="paint8_linear_161:6862" x1="1672.19" y1="100.019" x2="1814.61" y2="151.446" gradientUnits="userSpaceOnUse">
//                     <stop stopColor="#3C87F0" />
//                     <stop offset="0.99" stopColor="#0A0528" />
//                 </linearGradient>
//                 <linearGradient id="paint9_linear_161:6862" x1="1800.54" y1="-36.1803" x2="2041.73" y2="107.568" gradientUnits="userSpaceOnUse">
//                     <stop stopColor="#FF6E00" />
//                     <stop offset="0.99" stopColor="#A000FF" />
//                 </linearGradient>
//                 <linearGradient id="paint10_linear_161:6862" x1="1884.22" y1="-105.463" x2="2064.32" y2="-255.203" gradientUnits="userSpaceOnUse">
//                     <stop stopColor="#82FF64" />
//                     <stop offset="0.99" stopColor="#41B4FF" />
//                 </linearGradient>
//                 <linearGradient id="paint11_linear_161:6862" x1="1421.74" y1="106.101" x2="1592.04" y2="-82.6563" gradientUnits="userSpaceOnUse">
//                     <stop stopColor="#FF6E00" />
//                     <stop offset="0.99" stopColor="#A000FF" />
//                 </linearGradient>
//                 <linearGradient id="paint12_linear_161:6862" x1="1400.2" y1="163.893" x2="1749.72" y2="365.778" gradientUnits="userSpaceOnUse">
//                     <stop stopColor="#3C87F0" />
//                     <stop offset="0.99" stopColor="#0A0528" />
//                 </linearGradient>
//                 <linearGradient id="paint13_linear_161:6862" x1="1500.75" y1="55.4071" x2="1735.32" y2="-162.268" gradientUnits="userSpaceOnUse">
//                     <stop stopColor="#82FF64" />
//                     <stop offset="0.99" stopColor="#41B4FF" />
//                 </linearGradient>
//                 <linearGradient id="paint14_linear_161:6862" x1="1283.09" y1="166.935" x2="1490.34" y2="272.543" gradientUnits="userSpaceOnUse">
//                     <stop stopColor="#3C87F0" />
//                     <stop offset="0.99" stopColor="#0A0528" />
//                 </linearGradient>
//                 <linearGradient id="paint15_linear_161:6862" x1="736.92" y1="47.6341" x2="1009.46" y2="174.12" gradientUnits="userSpaceOnUse">
//                     <stop stopColor="#3C87F0" />
//                     <stop offset="0.99" stopColor="#0A0528" />
//                 </linearGradient>
//                 <linearGradient id="paint16_linear_161:6862" x1="814.677" y1="248.047" x2="1037.71" y2="150.195" gradientUnits="userSpaceOnUse">
//                     <stop stopColor="#82FF64" />
//                     <stop offset="0.99" stopColor="#41B4FF" />
//                 </linearGradient>
//                 <linearGradient id="paint17_linear_161:6862" x1="1121.65" y1="112.185" x2="1280.29" y2="115.648" gradientUnits="userSpaceOnUse">
//                     <stop stopColor="#FF6E00" />
//                     <stop offset="0.99" stopColor="#A000FF" />
//                 </linearGradient>
//                 <linearGradient id="paint18_linear_161:6862" x1="47900.4" y1="66262.4" x2="60297.8" y2="66262.4" gradientUnits="userSpaceOnUse">
//                     <stop stopColor="#FF6E00" />
//                     <stop offset="0.99" stopColor="#A000FF" />
//                 </linearGradient>
//                 <linearGradient id="paint19_linear_161:6862" x1="1793.04" y1="335.917" x2="1995.32" y2="341.098" gradientUnits="userSpaceOnUse">
//                     <stop stopColor="#3C87F0" />
//                     <stop offset="0.99" stopColor="#0A0528" />
//                 </linearGradient>
//             </defs>
//         </svg>
//     )
// }

export default Home
