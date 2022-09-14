import React from 'react'
import PropTypes from 'prop-types'

import type { Errors } from '@/model/apiModel'
import { FC } from '@/model/commonModel'

type ErrorType = {
  statusCode?: string
  errors: Errors
}
const ServerError: FC<ErrorType> = ({ statusCode = '', errors = [] }: ErrorType) => {
  return (
    <div className='error-wrapper'>
      <div>
        <h1>{statusCode || 'Server error'}</h1>
        <div className='error-block'>
          {errors.map((error, key) => {
            return (
              <div key={key} className='error-field'>
                {typeof error === 'string' ? (
                  error
                ) : (
                  <>
                    {error.statusCode ? error.statusCode + ': ' : ''} {error.text} <br />
                    URL: {error.url} <br />
                    {Object.keys(error.data).length ? <pre>{JSON.stringify(error.data, null, 2)}</pre> : ''}
                    <hr />
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <style jsx>{`
        .error-wrapper {
          color: #000;
          background: #fff;
          height: 100vh;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .error-wrapper h1 {
          display: inline-block;
          border-right: 1px solid rgba(0, 0, 0, 0.3);
          margin: 0;
          margin-right: 20px;
          padding: 10px 23px 10px 0;
          font-size: 24px;
          font-weight: 500;
          vertical-align: top;
        }
        .error-block {
          display: inline-flex;
          text-align: left;
          line-height: 1.5;
          height: 49px;
          align-items: center;
        }
        .error-block .error-field {
          font-size: 14px;
          font-weight: normal;
          line-height: 1.5;
          margin: 0;
          padding: 0;
        }
      `}</style>
      <style global jsx>{`
        body {
          margin: 0;
        }
      `}</style>
    </div>
  )
}

ServerError.propTypes = {
  statusCode: PropTypes.string,
  errors: PropTypes.arrayOf(
    PropTypes.shape({
      statusCode: PropTypes.number,
      text: PropTypes.string,
      url: PropTypes.string,
      data: PropTypes.object,
    }),
  ),
}

export default ServerError
