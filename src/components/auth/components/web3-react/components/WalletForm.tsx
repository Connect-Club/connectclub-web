// @ts-nocheck
import React, { useEffect } from 'react'

import { Accounts } from '@/components/auth/components/web3-react/components/Accounts'
import Provider, { Connectors, useWeb3 } from '@/components/auth/components/web3-react/components/Provider'
import { Status } from '@/components/auth/components/web3-react/components/Status'
import { getName } from '@/components/auth/components/web3-react/lib/utils'

const WalletForm = () => {
  const ActiveProvider = () => {
    const { isActive, isActivating, ENSNames, provider, accounts, connector, reconnect, error } = useWeb3()

    useEffect(() => {
      ;(async () => {
        await reconnect()
      })()
    }, [reconnect])

    return (
      <>
        {isActive && getName(connector)}
        <div style={{ marginBottom: '1rem' }}>
          <Status isActivating={isActivating} isActive={isActive} error={error} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <Accounts accounts={accounts} provider={provider} ENSNames={ENSNames} />
        </div>
      </>
    )
  }
  return (
    <div>
      <Provider>
        <ActiveProvider />
      </Provider>
      <Connectors />
    </div>
  )
}

export default WalletForm
