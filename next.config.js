// eslint-disable-next-line @typescript-eslint/no-var-requires
const nextTranslate = require('next-translate')

const permanentRedirectToHomePage = [
  '/about',
  '/landing-connect',
  '/hr',
  '/Uac',
  '/errorNoUser.html',
  '/5c502b62d48d1e8b86c6f416/event/5f1fc57fb8f328671416adc2',
  '/ukc/event/communitybuilders',
]

module.exports = nextTranslate({
  poweredByHeader: false,
  productionBrowserSourceMaps: true,
  images: {
    domains: ['storage.googleapis.com', 'api.producthunt.com', process.env.PICS_DOMAIN],
  },
  async redirects() {
    return [
      {
        source: '/privacy/onlinemeetup',
        destination: '/privacy',
        permanent: true,
      },
      {
        source: '/connectcon',
        destination: '/connectcon/nft-business',
        permanent: true,
      },
      {
        source: '/room/:page*',
        destination: '/account/rooms/:page*',
        permanent: true,
      },
      // {
      //     source: '/connectcon/1/events/:date*',
      //     destination: '/connectcon/1',
      //     permanent: true,
      // },
      // {
      //     source: '/connectcon/1/speakers',
      //     destination: '/connectcon/1',
      //     permanent: true,
      // },
      // {
      //     source: '/connectcon/1/contact',
      //     destination: '/connectcon/1',
      //     permanent: true,
      // },
      {
        source: '/en',
        has: [
          {
            type: 'query',
            key: 'clubId',
            value: '(?<clubId>.*)',
          },
        ],
        locale: false,
        destination: '/club/:clubId',
        permanent: false,
      },
    ].concat(
      permanentRedirectToHomePage.map((source) => ({
        source: source,
        destination: '/',
        permanent: true,
      })),
    )
  },
})
