import React from 'react'
import styles from './BottomMenuContainer.module.scss'



interface props {
    active: boolean
}

const BottomMenuContainer = (props: React.PropsWithChildren<props>)=>{

  return (
    // This serves the dual purpose of preventing a flashbang
    <div className={styles.overflowContainer}>
      <div style={{transform:!props.active?`translateY(105%)`:''}} className={styles.settingsBarContainer}>
        {props.children}
      </div>
    </div>
  )
}

export default BottomMenuContainer