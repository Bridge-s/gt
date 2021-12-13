import React, { useState } from 'react'
import { Modal, Button } from 'antd'
import './model.css'
import { useTranslation } from 'react-i18next'
const cpPngs: React.FC<any> = (props: any = { modalStyle: {} }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { t } = useTranslation()

    const handleOk = () => {
        props.setIsModalVisible(false)
    }

    const handleCancel = () => {
        props.setIsModalVisible(false)
    }

    return (
        <>
            <Modal width="100%" visible={props.isModalVisible} bodyStyle={{ background: 'transparent' }} closable={false} modalRender={() => (
                <div style={{ textAlign: 'center' }}>
                    <div>
                        {props.children}
                        {props.pngList.map((item: any, index: number) => (
                            <img src={item.default} className="transform-rotage" key={index} alt="" style={{ height: '250px', width: '200px', filter: 'drop-shadow(25px 4px 26px black)', ...props.modalStyle }} />
                        ))}
                    </div>
                    <Button shape="round" onClick={handleOk} style={{ pointerEvents: 'auto', marginTop: '20px' }}>{t('qd')}</Button>
                </div>
            )}>
            </Modal>
        </>
    )
}
export default cpPngs