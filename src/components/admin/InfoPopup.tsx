import React, { ReactNode } from 'react'
import ReactDOM from 'react-dom'

import global_styles from '@/components/admin/css/admin.module.css'

class InfoPopup {
  _class = 'info-popup'
  _success_class = `${this._class}__success`
  _error_class = `${this._class}__error`
  _close_class = `${this._class}__close`
  _show_class = `${this._class}__show`
  _popup: HTMLDivElement | null = null
  _container: HTMLDivElement | null = null
  _timeout: ReturnType<typeof setTimeout> | null = null

  create() {
    if (canUseDOM && !this._popup) {
      const node = document.createElement('div')
      const close = document.createElement('span')
      close.className = this._close_class
      close.innerText = '×'
      close.setAttribute('title', 'Close')
      close.onclick = () => {
        this.destroy()
      }
      const container = document.createElement('div')
      node.insertAdjacentHTML(
        'beforeend',
        `
                <style>
                    .${this._class} { position: fixed; z-index: 1001; max-width: 620px; border-width: 1px; border-style: solid; transition: top linear 0.5s; top: -100%; right: .65rem; padding: 8px 35px 8px 14px; }
                    .${this._success_class} { background-color: #e8f5e9; border-color: #d8edd6; color: #409945;  }
                    .${this._close_class} { cursor: pointer; position: absolute; right: 10px; top: 1px; font-size: 24px; opacity: .6; font-weight: 200; }
                    .${this._close_class}:hover { opacity: 1 }
                    .${this._error_class} { background-color: #fff1f0; border-color: #ffa39e; color: #cf1322;  }
                    .${this._class}.${this._show_class} { top: 110px; }
                </style>
            `,
      )
      node.className = this._class
      node.appendChild(container)
      node.appendChild(close)
      this._popup = node
      this._container = container

      document.body.appendChild(node)
    }
  }

  success(content: ReactNode | ReactNode[]) {
    this.render(content, this._success_class)
  }

  error(content: ReactNode | ReactNode[]) {
    this.render(content, this._error_class)
  }

  render(content: ReactNode | ReactNode[], popupClass: string) {
    if (!this._popup) {
      this.create()
    }
    if (this._popup) {
      this._popup.className = `${this._class} ${popupClass} ${this._class}__show`
      if (document.querySelector(`.${global_styles.adminPage}`)) {
        this._popup.style.right =
          (document.querySelector(`.${global_styles.adminPage}`) as HTMLDivElement).offsetLeft + 20 + 'px'
      }
      ReactDOM.render(React.createElement(React.Fragment, null, content), this._container)
      this._timeout && clearTimeout(this._timeout)
      this._timeout = setTimeout(() => {
        this.destroy()
      }, 5000)
    }
  }

  destroy() {
    if (this._popup && this._container) {
      const unmountResult = ReactDOM.unmountComponentAtNode(this._container)
      if (unmountResult && this._popup.parentNode) {
        this._popup.parentNode.removeChild(this._popup)
        this._popup = null
      }
    }
  }
}

const canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement)

const popup = new InfoPopup()

export default popup
