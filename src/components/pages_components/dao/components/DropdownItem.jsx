import React from 'react'

const DropdownItem = ({ title, body }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const ref = React.useRef(null)

  const handleFunc = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      ref.current.style.maxHeight = ref.current.scrollHeight + 'px'
    } else {
      ref.current.style.maxHeight = null
    }
  }

  return (
    <div className='dropdown' onClick={() => handleFunc()}>
      <div className='dropdown__header'>
        <h3 className='dropdown__title'>{title}</h3>
        <button className={isOpen ? 'dropdown__btn dropdown__btn--open' : 'dropdown__btn'} onClick={() => handleFunc()}>
          <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <rect y='11.5' width='24' height='1.5' fill='#FAFAFA' />
            <rect x='11.5' y='24' width='24' height='1.5' transform='rotate(-90 11.5 24)' fill='#FAFAFA' />
          </svg>
        </button>
      </div>
      <div ref={ref} className={isOpen ? 'dropdown__body dropdown__body--active' : 'dropdown__body'}>
        {body.map((item, index) => (
          <p key={index} className='dropdown__p'>
            {item}
          </p>
        ))}
      </div>
    </div>
  )
}

export default DropdownItem
