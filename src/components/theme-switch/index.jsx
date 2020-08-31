import React, { useState, useEffect } from 'react'
import Switch from 'react-switch'

import * as Dom from '../../utils/dom'
import { THEME } from '../../constants'

import './index.scss'

const key = 'THEME'

const MoonIcon = () => {
  return (
    <svg width="24" height="24">
      <rect width="24" height="24" fill="none" rx="0" ry="0" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.8102 3.2H13.8202C13.4902 3.2 13.2302 2.93 13.2302 2.6C13.2302 2.27 13.5002 2 13.8302 2H16.2602C16.5002 2 16.7202 2.15 16.8102 2.37C16.9002 2.59 16.8502 2.85 16.6802 3.02L15.2702 4.43H16.2602C16.5902 4.43 16.8602 4.7 16.8602 5.03C16.8602 5.36 16.5902 5.63 16.2602 5.63H13.8202C13.5802 5.63 13.3602 5.48 13.2702 5.26C13.1802 5.04 13.2302 4.78 13.4002 4.61L14.8102 3.2ZM20.1401 11.0101H21.1301C21.4601 11.0101 21.7401 11.2801 21.7401 11.6101C21.7401 11.9401 21.4701 12.2101 21.1401 12.2101H18.7001C18.4601 12.2101 18.2401 12.0601 18.1501 11.8401C18.0601 11.6201 18.1101 11.3601 18.2801 11.1901L19.6901 9.78008H18.7001C18.3701 9.78008 18.1001 9.51008 18.1001 9.18008C18.1001 8.85008 18.3701 8.58008 18.7001 8.58008H21.1301C21.3701 8.58008 21.5901 8.73008 21.6801 8.95008C21.7701 9.17008 21.7201 9.43008 21.5501 9.60008L20.1401 11.0101ZM11.0302 9.8499H12.8502L10.7002 11.9999C10.5302 12.1699 10.4802 12.4299 10.5702 12.6499C10.6602 12.8699 10.8802 13.0199 11.1202 13.0199H14.2902C14.6202 13.0199 14.8902 12.7499 14.8902 12.4199C14.8902 12.0899 14.6202 11.8199 14.2902 11.8199H12.5602L14.7102 9.6699C14.8802 9.4999 14.9302 9.2399 14.8402 9.0199C14.7502 8.7999 14.5302 8.6499 14.2902 8.6499H11.0202C10.6902 8.6499 10.4202 8.9199 10.4202 9.2499C10.4202 9.5799 10.7002 9.8499 11.0302 9.8499ZM14.5501 16.89C15.6601 16.89 16.7201 16.66 17.7101 16.19C17.9401 16.08 18.2101 16.13 18.3801 16.3C18.5601 16.48 18.6101 16.75 18.5001 16.98C17.0901 20.05 13.9901 22.03 10.6001 22.03C5.79013 22.03 1.88013 18.12 1.88013 13.31C1.88013 9.94004 3.87013 6.84004 6.93013 5.40004C7.16013 5.29004 7.43012 5.34004 7.61012 5.52004C7.79012 5.70004 7.84013 5.97004 7.73013 6.20004C7.27013 7.19004 7.03012 8.26004 7.03012 9.38004C7.03012 13.52 10.4001 16.89 14.5501 16.89ZM3.09013 13.31C3.09013 17.46 6.46012 20.83 10.6101 20.83C12.9901 20.83 15.2001 19.7 16.6001 17.85C15.9401 18.01 15.2501 18.09 14.5501 18.09C9.74013 18.09 5.83012 14.18 5.83012 9.38004C5.83012 8.68004 5.91013 7.99004 6.07013 7.32004C4.22013 8.73004 3.09013 10.94 3.09013 13.31Z"
      />
    </svg>
  )
}

const SunIcon = () => {
  return (
    <svg width="24" height="24">
      <rect width="24" height="24" fill="none" rx="0" ry="0" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.7488 5.67224C13.1057 5.67298 13.3958 5.38416 13.3965 5.0271C13.3973 4.67005 13.1084 4.37989 12.7515 4.37915C12.3943 4.37842 12.1043 4.66724 12.1035 5.02442C12.1028 5.38135 12.3916 5.67151 12.7488 5.67224ZM9.39535 6.57153C9.70504 6.39355 9.81173 5.99841 9.63388 5.68884C9.45602 5.37914 9.06076 5.27245 8.75119 5.45031C8.44162 5.62817 8.3348 6.02343 8.51266 6.333C8.69064 6.64257 9.08578 6.74926 9.39535 6.57153ZM6.94091 9.02688C6.76171 9.33571 6.3662 9.44094 6.05736 9.26174C5.74852 9.08254 5.6433 8.68691 5.8225 8.37807C6.0017 8.06923 6.39733 7.96413 6.70617 8.14333C7.015 8.32253 7.12011 8.71804 6.94091 9.02688ZM6.04309 12.3806C6.04383 12.0234 5.75501 11.7334 5.39795 11.7327C5.0409 11.7319 4.75074 12.0208 4.75 12.3779C4.74927 12.7349 5.03809 13.0249 5.39527 13.0256C5.7522 13.0265 6.04236 12.7376 6.04309 12.3806ZM5.82116 16.3781C5.6433 16.0684 5.74999 15.6734 6.05968 15.4954C6.36925 15.3176 6.7644 15.4244 6.94237 15.734C7.12023 16.0435 7.01342 16.4388 6.70385 16.6165C6.39428 16.7945 5.99902 16.6877 5.82116 16.3781ZM9.39773 18.1882C9.08889 18.0091 8.69338 18.1142 8.51418 18.423C8.33498 18.7319 8.44008 19.1275 8.74892 19.3067C9.05776 19.4858 9.45339 19.3808 9.63259 19.072C9.81179 18.7631 9.70656 18.3674 9.39773 18.1882ZM12.1035 19.7313C12.1043 19.3743 12.3943 19.0855 12.7515 19.0862C13.1084 19.0869 13.3973 19.377 13.3965 19.7341C13.3958 20.0911 13.1057 20.3799 12.7488 20.3792C12.3916 20.3784 12.1028 20.0884 12.1035 19.7313ZM16.1047 18.1869C15.7951 18.3647 15.6883 18.7599 15.8662 19.0695C16.0442 19.3791 16.4392 19.4859 16.7489 19.308C17.0584 19.1302 17.1652 18.735 16.9873 18.4255C16.8095 18.1158 16.4143 18.009 16.1047 18.1869ZM18.559 15.7315C18.7382 15.4227 19.134 15.3177 19.4428 15.4969C19.7516 15.676 19.8566 16.0716 19.6775 16.3804C19.4983 16.6893 19.1027 16.7945 18.7939 16.6153C18.485 16.4361 18.3799 16.0403 18.559 15.7315ZM20.105 11.7327C19.7478 11.7319 19.4578 12.0208 19.457 12.3779C19.4563 12.7349 19.7451 13.0249 20.1022 13.0256C20.4592 13.0265 20.7493 12.7376 20.75 12.3806C20.7507 12.0234 20.4619 11.7334 20.105 11.7327ZM19.679 8.38046C19.8569 8.69003 19.75 9.08529 19.4405 9.26315C19.1309 9.44101 18.7356 9.33432 18.5579 9.02462C18.3799 8.71505 18.4867 8.31991 18.7964 8.14193C19.106 7.96408 19.5011 8.07089 19.679 8.38046ZM16.1022 6.57006C16.4111 6.74926 16.8068 6.64415 16.986 6.33532C17.1652 6.02648 17.06 5.63085 16.7512 5.45165C16.4423 5.27245 16.0467 5.37767 15.8676 5.68651C15.6884 5.99535 15.7934 6.39086 16.1022 6.57006ZM8.26319 12.3795C8.26319 9.90466 10.2761 7.8916 12.75 7.8916C15.2249 7.8916 17.2379 9.90466 17.2379 12.3795C17.2379 14.8534 15.2249 16.8663 12.75 16.8663C10.2761 16.8663 8.26319 14.8534 8.26319 12.3795ZM9.5553 12.3795C9.5553 14.141 10.9885 15.5741 12.75 15.5741C14.5115 15.5741 15.9458 14.141 15.9458 12.3795C15.9458 10.618 14.5115 9.18372 12.75 9.18372C10.9885 9.18372 9.5553 10.618 9.5553 12.3795Z"
      />
    </svg>
  )
}
function getTheme(checked) {
  return checked ? THEME.DARK : THEME.LIGHT
}

function toggleTheme(theme) {
  switch (theme) {
    case THEME.LIGHT: {
      Dom.addClassToBody(THEME.LIGHT)
      Dom.removeClassToBody(THEME.DARK)
      break
    }
    case THEME.DARK: {
      Dom.addClassToBody(THEME.DARK)
      Dom.removeClassToBody(THEME.LIGHT)
      break
    }
  }
}

export const ThemeSwitch = () => {
  const [checked, setChecked] = useState(false)

  const handleChange = checked => {
    const theme = getTheme(checked)
    localStorage.setItem(key, checked)

    setChecked(checked)
    toggleTheme(theme)
  }

  useEffect(() => {
    const isDark = Dom.hasClassOfBody(THEME.DARK)
    const isItem = localStorage.getItem(key) === 'true'
    const isChecked = isItem ? isItem : isDark

    handleChange(isChecked)
  }, [])

  return (
    <div className="switch-container">
      <label htmlFor="normal-switch">
        <Switch
          onChange={handleChange}
          checked={checked}
          id="normal-switch"
          height={24}
          width={48}
          checkedIcon={
            <div className="icon checkedIcon">
              <MoonIcon />
            </div>
          }
          uncheckedIcon={
            <div className="icon uncheckedIcon">
              <SunIcon />
            </div>
          }
          offColor={'#d9dfe2'}
          offHandleColor={'#fff'}
          onColor={'#999'}
          onHandleColor={'#282c35'}
        />
      </label>
    </div>
  )
}
