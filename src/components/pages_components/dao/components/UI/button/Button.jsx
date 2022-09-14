import React from 'react'

import classes from './Button.module.css'

function Button({ children, classNames, link, ...props }) {
  return (
    <form action={link} target='_blank'>
      <button {...props} className={`${classes.stnBtn} ${classNames}`}>
        {children}
      </button>
    </form>
  )
}

export default Button
