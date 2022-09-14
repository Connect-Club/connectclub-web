import React, { useEffect, useState } from 'react'
import { CloseOutlined, FormatPainterOutlined, SettingOutlined } from '@ant-design/icons'
import { Button, Form, Input, Modal } from 'antd'
import clsx from 'clsx'
import PropTypes from 'prop-types'

import global_styles from '@/components/admin/css/admin.module.css'
import styles from '@/components/admin/pages/landing/landing.module.css'
import flattenInput from '@/lib/flattenInput'
import { FC } from '@/model/commonModel'
import { Module, ModuleWithComponent } from '@/model/landingModel'

type Props = {
  isVisible: boolean
  module: ModuleWithComponent
  onDialogClose: () => void
  onSave: (values: Module) => void
}
const ModuleSystemModal: FC<Props> = ({ isVisible = false, module, onDialogClose, onSave }) => {
  const [errors, setErrors] = useState<string[]>([])
  const [isModalVisible, setIsModalVisible] = useState<boolean>(isVisible)

  const Component = module.Component
  const [form] = Form.useForm()

  const hideDialog = () => {
    setIsModalVisible(false)
    onDialogClose && onDialogClose()
  }

  const handleOnOk = async (values: any) => {
    setErrors([])

    if (module.beforeSave) {
      values = module.beforeSave(values)
    }

    const data = Object.assign({}, values, {
      id: module.id,
      index: module.index,
    })

    onSave && onSave(data)
    hideDialog()
  }

  useEffect(() => {
    setIsModalVisible(isVisible)
  }, [isVisible])

  useEffect(() => {
    if (isModalVisible) {
      form.setFieldsValue(module)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, flattenInput(form, isModalVisible, module))

  return (
    <>
      <Modal
        title={<ModalTitle module={module} hideDialog={hideDialog} />}
        destroyOnClose={true}
        visible={isModalVisible}
        onCancel={hideDialog}
        closable={false}
        width={'80%'}
        wrapClassName={styles.modal}
        footer={[
          <Button key='back' onClick={hideDialog}>
            cancel
          </Button>,
          <Button key='submit' form='module_edit' type='primary' htmlType='submit'>
            Submit
          </Button>,
        ]}
      >
        <Form
          name='module_edit'
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          labelAlign='left'
          onFinish={handleOnOk}
          initialValues={module}
          form={form}
          preserve={false}
        >
          <Form.Item
            label='Name'
            name='name'
            extra='Only visible in admin in the list of modules'
            rules={[
              {
                required: true,
                message: 'Field is required!',
              },
            ]}
          >
            <Input />
          </Form.Item>
          {module.id !== 'js' && (
            <Form.Item label='Title' name='title'>
              <Input />
            </Form.Item>
          )}
          <Component form={form} />
        </Form>
        {errors.length > 0 && (
          <div
            className={clsx(global_styles['mt-1'], global_styles.error_text)}
            dangerouslySetInnerHTML={{ __html: errors.join('<br />') }}
          />
        )}
      </Modal>
    </>
  )
}

ModuleSystemModal.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  module: PropTypes.object.isRequired,
  onDialogClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
}

type ModalTitleType = {
  module: ModuleWithComponent
  hideDialog: () => void
}
const ModalTitle: FC<ModalTitleType> = ({ module, hideDialog }) => {
  const changeSettings = (showSettings = true) => {
    const settings = document.querySelector(`.${styles.modal_settings}`) as HTMLDivElement
    const appearance = document.querySelector(`.${styles.modal_appearance}`) as HTMLDivElement
    const settingsWrap = document.querySelector(`.${styles.modal_settings_wrap}`) as HTMLDivElement
    const appearanceWrap = document.querySelector(`.${styles.modal_appearance_wrap}`) as HTMLDivElement
    if (settings) {
      settings.style.display = showSettings ? 'block' : 'none'
    }
    if (appearance) {
      appearance.style.display = showSettings ? 'none' : 'block'
    }
    if (showSettings) {
      settingsWrap.classList.add(styles.selected)
      appearanceWrap.classList.remove(styles.selected)
    } else {
      settingsWrap.classList.remove(styles.selected)
      appearanceWrap.classList.add(styles.selected)
    }
  }
  const SettingsTab = () => {
    const handleClick = () => {
      changeSettings()
    }
    return (
      <div className={clsx(styles.modal_actions, styles.modal_settings_wrap, styles.selected)}>
        <SettingOutlined title={'Setting'} onClick={handleClick} />
      </div>
    )
  }
  const AppearanceTab = () => {
    const handleClick = () => {
      changeSettings(false)
    }
    return (
      <div className={clsx(styles.modal_actions, styles.modal_appearance_wrap)}>
        <FormatPainterOutlined title={'Appearance'} onClick={handleClick} />
      </div>
    )
  }
  return (
    <div className={'d-flex flex-flow-no-wrap'}>
      <div className={clsx(styles.text_ellipsis, styles.modal_title)} title={module.name} style={{ flex: 1 }}>
        Module {module.name}
      </div>
      {module?.params?.appearance ? (
        <>
          <SettingsTab />
          <AppearanceTab />
        </>
      ) : (
        <div className={styles.modal_actions}>
          <CloseOutlined style={{ color: 'rgba(0, 0, 0, 0.45)' }} title={'Close'} onClick={hideDialog} />
        </div>
      )}
    </div>
  )
}

ModalTitle.propTypes = {
  module: PropTypes.object.isRequired,
  hideDialog: PropTypes.func.isRequired,
}

export default ModuleSystemModal
