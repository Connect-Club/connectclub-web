import React, { ReactElement, ReactNode, useCallback, useEffect, useState } from 'react'
import clsx from 'clsx'
import Cookies from 'universal-cookie'

import { getCurrentUser } from '@/api/userApi'
import global_styles from '@/components/admin/css/admin.module.css'
import ModalRegister from '@/components/auth/components/ModalRegister'
import Web3Provider, { useWeb3 } from '@/components/web3/Web3Provider'
import { doRequest } from '@/lib/Api'
import { LoaderSpin } from '@/lib/svg'
import { FC, GetTokenType, TokenApiResponse } from '@/model/commonModel'
import { AuthSignature } from '@/model/cryptoModel'

type Props = {
  [key: string]: any
  children: ReactElement
  onConnecting?: ReactNode
  enableReconnect?: boolean
  onConnect?: () => void
  onAuth?: () => void
  onError?: () => void
  onSuccess?: (responseData: GetTokenType) => void
}
const WalletAuth: FC<Props> = ({
  enableReconnect = false,
  onConnecting,
  onConnect: onWalletConnect,
  onAuth,
  onError,
  onSuccess,
  children,
  ...props
}) => {
  const cookies = new Cookies()
  const Content = () => {
    const { connect, signer, connected, disconnect, accountId, reconnect, error: web3Error } = useWeb3()

    const [error, setError] = useState('')
    const [isSignatureAuth, setIsSignatureAuth] = useState(false)
    const [isRegister, setIsRegister] = useState(false)
    const [responseData, setResponseData] = useState<GetTokenType>({} as GetTokenType)

    const onConnect = async (e: React.MouseEvent<HTMLAnchorElement>) => {
      setError('')
      e.preventDefault()
      await connect()
    }

    const getAuthSignature = useCallback(async () => {
      const result = {
        message: '',
        signature: '',
      }

      setIsSignatureAuth(true)

      const response = await doRequest<AuthSignature>({
        endpoint: process.env.NEXT_PUBLIC_API_POST_AUTH_SIGNATURE!,
        data: {
          deviceId: accountId,
        },
      })

      if (response._cc_errors.length) {
        setError('Auth-signature request failed')
      } else if (response.data?.response.message) {
        const signature = await signer?.signMessage(response.data.response.message)
        result['message'] = response.data.response.message
        result['signature'] = signature || ''
      }
      setIsSignatureAuth(false)
      if (!result['signature']) {
        throw new Error('Auth-signature request failed')
      }
      return result
    }, [accountId, signer])

    const OnRegisterSuccess = async () => {
      if (onSuccess) {
        await onSuccess(responseData)
      } else {
        window.location.reload()
      }
    }

    useEffect(() => {
      if (connected) {
        onWalletConnect && onWalletConnect()

        getAuthSignature()
          .then((data) => {
            ;(async () => {
              const response = await doRequest<TokenApiResponse, TokenApiResponse>({
                endpoint: process.env.NEXT_PUBLIC_API_POST_GET_TOKEN!,
                data: {
                  signature: data.signature,
                  address: accountId,
                  text: data.message,
                },
              })
              if (response?._cc_errors?.length) {
                cookies.remove('cc_user')
                setError('Server error. Authentification failed')
                onError && onError()
              } else if (response.data.data) {
                cookies.set('cc_user', response.data.data, { path: '/' })

                if (onAuth) {
                  await onAuth()
                }

                setResponseData(response.data.data)

                const [currentUser] = await getCurrentUser(response.data.data.access_token)
                if (currentUser && !currentUser.username) {
                  setIsRegister(true)
                } else if (onSuccess) {
                  await onSuccess(response.data.data)
                } else {
                  window.location.reload()
                }
              }
            })()
          })
          .catch(disconnect)
      }
    }, [accountId, connected, disconnect, getAuthSignature])

    /* Reconnect to the wallet */
    useEffect(() => {
      ;(async () => {
        enableReconnect && (await reconnect())
      })()
    }, [reconnect])

    useEffect(() => {
      if (web3Error) {
        setError(`${web3Error}${web3Error === 'User Rejected' ? `. Check the wallet extension` : ``}`)
      }
    }, [web3Error])

    return (
      <div {...props}>
        {!connected ? (
          React.cloneElement(children, { onClick: onConnect })
        ) : onConnecting ? (
          onConnecting
        ) : (
          <div className={'align-center'}>
            Connecting,
            {isSignatureAuth ? ' check your wallet to sign in... ' : ' wait, please... '}
            <LoaderSpin />
          </div>
        )}
        {error !== '' && (
          <div className={clsx(global_styles.error_text, global_styles.mt_1, 'align-center')}>{error}</div>
        )}
        <ModalRegister show={isRegister} onSuccess={OnRegisterSuccess} />
      </div>
    )
  }

  return (
    <Web3Provider>
      <Content />
    </Web3Provider>
  )
}

export default WalletAuth
