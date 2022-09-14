import React from 'react'

const useModal = ({ initialOpen = false } = {}) => {
  const [isOpen, setIsOpen] = React.useState(initialOpen)

  const onOpen = () => {
    setIsOpen(true)
  }

  const onClose = () => {
    setIsOpen(false)
  }

  const onToggle = () => {
    setIsOpen(!isOpen)
  }

  return { onOpen, onClose, isOpen, onToggle }
}

export default useModal
