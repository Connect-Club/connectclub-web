import React from 'react'
// import DeleteSubscription from "@/components/supercreator/DeleteSubscription";
import { Button } from 'antd'
import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'

import { useSupercreatorSubscriptions } from '@/api/subscriptionApi'
import global_styles from '@/components/admin/css/admin.module.css'
import CreateEditSubscription from '@/components/supercreator/CreateEditSubscription'
import styles from '@/components/supercreator/supercreator.module.css'
import { doRequest } from '@/lib/Api'
import { Delete, Loader } from '@/lib/svg'
import { FC } from '@/model/commonModel'
import { CurrentUser } from '@/model/usersModel'

type Props = {
  args?: string[]
  user?: CurrentUser
}

const Home: FC<Props> = () => {
  const router = useRouter()

  const [subscriptions, , isLoading] = useSupercreatorSubscriptions()

  const onSubscriptionSave = (id: string | undefined) => {
    if (id) {
      router.push('/supercreator/' + id)
    } else {
      location.reload()
    }
  }

  return (
    <div className={global_styles.block}>
      <p>Welcome to your personal working space, where you can manage your subscriptions</p>

      {isLoading ? (
        <Loader />
      ) : (
        <>
          {subscriptions.length > 0 ? (
            <div className={global_styles['mt-1']}>
              <div className={styles.tr}>
                <div className={clsx(styles.th, styles.name)}>Name</div>
                <div className={styles.th}>Price</div>
                <div className={styles.th}>Created</div>
                {/*<div className={styles.th} />*/}
              </div>
              {subscriptions.map((subscription) => (
                <div className={styles.tr} key={subscription.id}>
                  <div className={clsx(styles.name)}>
                    <Link href={`/supercreator/${subscription.id}`}>
                      <a title={subscription.name}>{subscription.name}</a>
                    </Link>
                  </div>
                  <div>{`${subscription.price} ${subscription.currency ?? ''}`}</div>
                  <div>{new Date(subscription.createdAt * 1000).toLocaleString()}</div>
                  {/*<div><DeleteSubscription id={subscription.id} /></div>*/}
                </div>
              ))}
            </div>
          ) : (
            <div>
              <CreateEditSubscription onSuccess={onSubscriptionSave}>
                <Button type='primary'>+ Add new subscription</Button>
              </CreateEditSubscription>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DeleteSubscription = ({ id }: { id: string }) => {
  const onDeleteSubscription = async () => {
    await doRequest({
      endpoint: process.env.NEXT_PUBLIC_API_POST_DELETE_SUBSCRIPTION!.replace(/{id}/, id),
    })
    location.reload()
  }
  return (
    <a title='Delete subscription' onClick={onDeleteSubscription}>
      <Delete color='#f00' />
    </a>
  )
}

Home.propTypes = {
  args: PropTypes.arrayOf(PropTypes.string),
  user: PropTypes.object,
}

export default Home
