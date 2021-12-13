import React, { useState } from 'react'
import { Modal, Button, Input } from 'antd'
import './model.css'

const Sell = (props: any) => {
    const handleOk = () => {
        props.setSellStatus(false)
    }

    const handleCancel = () => {
        props.setSellStatus(false)
    }

    return (
        <>
            <Modal className="wallet-modal" visible={props.isModalVisible} bodyStyle={{ background: 'transparent' }} closable={false} modalRender={() => (
                <div style={{ textAlign: 'left' }}>
                    <div style={{ textAlign: 'right' }}>
                        <img src={require("../../../utils/img/close.png").default} className="close-img" style={{ pointerEvents: 'auto' }} onClick={handleCancel}></img>
                    </div>
                    <div className="label-name">Price</div>
                    <Input className="basic-input" defaultValue="" style={{ pointerEvents: 'auto' }} />
                    <br />
                    <div style={{ textAlign: "center" }}>
                        <Button className="submit-btn" size="large" shape="round" onClick={handleOk} style={{ pointerEvents: 'auto' }}>确定</Button>
                    </div>
                </div>
            )}>
            </Modal>
        </>
    )
}
export default Sell