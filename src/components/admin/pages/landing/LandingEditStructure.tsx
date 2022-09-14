import React, { useEffect, useState } from 'react'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'
import { Form, Input, Select } from 'antd'
import { FormInstance } from 'antd/lib/form/hooks/useForm'
import { arrayMoveImmutable } from 'array-move'
import clsx from 'clsx'
import PropTypes from 'prop-types'

import global_styles from '@/components/admin/css/admin.module.css'
import DeleteModuleButton from '@/components/admin/pages/landing/DeleteModuleButton'
import styles from '@/components/admin/pages/landing/landing.module.css'
import ModuleButton from '@/components/admin/pages/landing/modules/ModuleButton'
import ModuleForm from '@/components/admin/pages/landing/modules/ModuleForm'
import ModuleJs from '@/components/admin/pages/landing/modules/ModuleJs'
import ModuleSpeakers from '@/components/admin/pages/landing/modules/ModuleSpeakers'
import ModuleTable from '@/components/admin/pages/landing/modules/ModuleTable'
import ModuleText from '@/components/admin/pages/landing/modules/ModuleText'
import ModuleSystemModal from '@/components/admin/pages/landing/ModuleSystemModal'
import flattenInput from '@/lib/flattenInput'
import { FC } from '@/model/commonModel'
import { Landing, Module, ModuleType, ModuleWithComponent } from '@/model/landingModel'

type SortableListType = {
  children: React.ReactNode
}

type SortEndProps = {
  oldIndex: number
  newIndex: number
}

type Props = {
  landing: Landing
  form: FormInstance
}
const LandingEditStructure: FC<Props> = ({ landing, form }) => {
  const [modules, setModules] = useState(landing.params?.modules || [])

  const moduleComponents: { [key in ModuleType]: ModuleWithComponent } = {
    text: {
      id: 'text',
      name: 'Text',
      title: '',
      params: {
        text: '',
        columns: 1,
        columns_justify_content: 'space-between',
        appearance: {
          border_color: { r: 165, g: 249, b: 129, a: 1 },
        },
      },
      Component: ModuleText,
    },
    js: {
      id: 'js',
      name: 'Javascript',
      title: '',
      params: {
        type: 'src',
        strategy: 'afterInteractive',
      },
      Component: ModuleJs,
      beforeSave: (values) => {
        /* Remove all script tags */
        if (values.params.type === 'inline' && values.params.value) {
          const SCRIPT_REGEX = /(<script[^>]*>)|(<\/script>)/gim
          values.params.value = values.params.value.replace(SCRIPT_REGEX, '')
        }
        return values
      },
    },
    speakers: {
      id: 'speakers',
      name: 'Speakers',
      title: '',
      params: {
        show_more_button: false,
        link_url: '',
        link_text: '',
        speakers: [],
        appearance: {
          image_filter: true,
          name: { r: 255, g: 255, b: 255, a: 1 },
          description: { r: 255, g: 255, b: 255, a: 0.5 },
          background: { r: 10, g: 5, b: 40, a: 0 },
          button_text_color: { r: 65, g: 180, b: 255, a: 1 },
          button_border_color: { r: 26, g: 57, b: 104, a: 1 },
          button_border_radius: 10,
        },
      },
      Component: ModuleSpeakers,
    },
    table: {
      id: 'table',
      name: 'Table',
      title: '',
      params: {
        tables: [],
        appearance: {
          title_background: { r: 0, g: 0, b: 0, a: 1 },
          title_color: { r: 255, g: 255, b: 255, a: 1 },
          text: { r: 0, g: 0, b: 0, a: 1 },
        },
      },
      Component: ModuleTable,
    },
    button: {
      id: 'button',
      name: 'Button',
      title: '',
      params: {
        name: '',
        link: '',
        alignment: 'left',
        onclick: '',
        appearance: {
          background: { r: 117, g: 220, b: 208, a: 1 },
          background_hover: { r: 92, g: 214, b: 200, a: 1 },
          text: { r: 0, g: 0, b: 0, a: 1 },
          border_color: { r: 117, g: 220, b: 208, a: 0 },
          border_radius: 4,
        },
      },
      beforeSave: (values) => {
        /* Remove all script tags */
        if (values.params.onclick !== '') {
          const SCRIPT_REGEX = /(<script[^>]*>)|(<\/script>)/gim
          values.params.onclick = values.params.onclick.replace(SCRIPT_REGEX, '')
        }
        return values
      },
      Component: ModuleButton,
    },
    form: {
      id: 'form',
      name: 'Form',
      title: '',
      params: {
        fields: [],
        button_name: 'Submit',
        onsuccess: '',
        data: [],
        text_before: '',
        text_after: '',
        success_text: '',
        appearance: {
          button_background: { r: 0, g: 114, b: 239, a: 1 },
          button_background_hover: { r: 0, g: 137, b: 255, a: 1 },
          button_text: { r: 255, g: 255, b: 255, a: 1 },
          button_border_color: { r: 117, g: 220, b: 208, a: 0 },
          button_border_radius: 4,
        },
      },
      beforeSave: (values) => {
        /* Remove all script tags */
        if (values.params.onsuccess !== '') {
          const SCRIPT_REGEX = /(<script[^>]*>)|(<\/script>)/gim
          values.params.onsuccess = values.params.onsuccess.replace(SCRIPT_REGEX, '')
        }
        return values
      },
      Component: ModuleForm,
    },
  }

  const [activeModule, setActiveModule] = useState<ModuleWithComponent>(moduleComponents.text)
  const [showActiveModule, setShowActiveModule] = useState(false)

  const onDialogClose = () => {
    setShowActiveModule(false)
  }

  /* Calls, when select any module or click to an existing */
  const onModuleChange = (module: ModuleType | Module, index = -1) => {
    const moduleData =
      typeof module === 'string'
        ? moduleComponents[module]
        : moduleComponents[module.id]
        ? { ...moduleComponents[module.id], ...module }
        : undefined
    if (moduleData) {
      setActiveModule({ ...moduleData, index: index })
      setShowActiveModule(true)
    }
  }

  /* Dropdown for adding new modules */
  const AddModule: FC<unknown> = () => {
    const handleOnChange = (moduleId: ModuleType) => {
      onModuleChange(moduleId)
    }

    return (
      <Select placeholder={'+ Add module'} value={undefined} onChange={handleOnChange}>
        {Object.keys(moduleComponents).map((id) => (
          <Select.Option value={id} key={id}>
            {moduleComponents[id].name}
          </Select.Option>
        ))}
      </Select>
    )
  }

  /* Module popup save handler */
  const onModuleSave = async (values: Module) => {
    await setModules((prev) => {
      const newValue = [...prev]
      if (values.index === -1) {
        newValue.push(values)
      } else if (values.index !== undefined) {
        newValue.splice(values.index, 1, values)
      }
      updateFormModules(newValue)
      return newValue
    })
  }

  type ModuleItemType = {
    module: Module
    modIndex: number
  }
  const ModuleItem = SortableElement(({ module, modIndex }: ModuleItemType) => {
    const handleOnClick = () => {
      onModuleChange(module, modIndex)
    }
    const onDeleteModule = async () => {
      await setModules((prev) => {
        const newValue = [...prev]
        newValue.splice(modIndex, 1)
        updateFormModules(newValue)
        return newValue
      })
    }

    return (
      <div className={clsx(styles.item, global_styles['mb-1'], 'd-flex')}>
        <div style={{ flex: '1' }} onClick={handleOnClick}>
          {module.name} <span className={clsx(global_styles.hint)}>{module.id}</span>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <DeleteModuleButton onSuccess={onDeleteModule} />
        </div>
      </div>
    )
  })

  const onSortEnd = async ({ oldIndex, newIndex }: SortEndProps) => {
    await setModules((prev) => {
      const newValue = arrayMoveImmutable(prev, oldIndex, newIndex)
      updateFormModules(newValue)
      return newValue
    })
  }

  const updateFormModules = async (newModules: Module[]) => {
    await form.setFieldsValue({
      params: {
        modules: newModules,
      },
    })
  }

  useEffect(() => {
    setModules(landing?.params?.modules || [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, flattenInput(landing))

  return (
    <>
      <p>Add modules to fill the landing</p>
      <AddModule />
      <div className={global_styles['m-1']}>
        <SortableList onSortEnd={onSortEnd} distance={10}>
          {modules.map((module, index) => (
            <ModuleItem key={index} module={module} index={index} modIndex={index} />
          ))}
        </SortableList>
      </div>
      {modules.length > 3 && (
        <div className={global_styles['mb-1']}>
          <AddModule />
        </div>
      )}
      <Form.Item name={['params', 'modules']} noStyle>
        <Input type={'hidden'} />
      </Form.Item>
      <ModuleSystemModal
        isVisible={showActiveModule}
        module={activeModule}
        onDialogClose={onDialogClose}
        onSave={onModuleSave}
      />
    </>
  )
}

const SortableList = SortableContainer(({ children }: SortableListType) => {
  return <div>{children}</div>
})

LandingEditStructure.propTypes = {
  landing: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
}

export default LandingEditStructure
