/**
 * WDYR (why-did-you-render) helps locate unnecessary re-renders.
 * Applied in development environment, on the frontend only.
 *
 * It will only log unnecessary re-renders, not expected re-renders.
 *
 * @see https://github.com/welldone-software/why-did-you-render
 * @see https://github.com/vercel/next.js/tree/canary/examples/with-why-did-you-render
 */
import React from 'react'

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const whyDidYouRender = require('@welldone-software/why-did-you-render')

  whyDidYouRender(React, {
    trackAllPureComponents: true,
    trackHooks: true,
    logOnDifferentValues: true,
    collapseGroups: true,
  })
}
