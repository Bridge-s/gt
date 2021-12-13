import '../css/ctoleft.css'
import { Drawer } from 'antd'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

const CtoLeft = (props: any) => {
    const { t, i18n } = useTranslation()
    const l = i18n.language
    const Aside = l === 'en' ? require('./en/aside').default : require('./zh/aside').default
    const [visible, setVisible] = useState(false)
    props.cref.current.setter = (bool: boolean) => {
        setVisible(bool)
    }
    const onClose = () => {
        setVisible(false)
        props.cref.current.getter(false)
    }

    return (
        <>
            <div className="left-aside">
                <Aside onClick={() => { }}></Aside>
            </div>
            <Drawer
                placement="left"
                closable={false}
                visible={visible}
                width="100%"
                onClose={onClose}
            >
                <Aside onClick={onClose}></Aside>
            </Drawer>
        </>
    )
}
export default CtoLeft