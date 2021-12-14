import React, { useEffect, useState } from 'react'
import { Modal, Button, Input } from 'antd'
import './model.css'

const Militbuy = (props: any) => {
    const handleOk = () => {
        props.handleOk()
        props.setIsModalVisible(false)
    }
    const [parent,setValue]=useState('')

    const handleCancel = () => {
        props.setIsModalVisible(false)
    }
    useEffect(()=>{
        if (window.location.hash.includes('?id=')) {
            let parentId = window.location.hash.match(/.*?id=(.*)$/)?.[1]
            setValue(parentId)
        }
    },[])
    return (
        <>
            <Modal className="wallet-modal" visible={props.isModalVisible} bodyStyle={{ background: 'transparent' }} closable={false} modalRender={() => (
                <div style={{ textAlign: 'left' }}>
                    <div style={{ textAlign: 'right' }}>
                        <img src={require("../../../utils/img/close.png").default} className="close-img" style={{ pointerEvents: 'auto' }} onClick={handleCancel}></img>
                    </div>
                    <div className="label-name">Bind ID</div>
                    <div className="label-name2">Parent ID：</div>
                    <Input className="basic-input" defaultValue="" style={{ pointerEvents: 'auto' }} value={parent} onChange={(e)=>{setValue(e.target.value)}}/>
                    <br />
                    <div style={{ textAlign: "center" }}>
                        <Button className="submit-btn" size="large" shape="round" onClick={handleOk.bind(null,parent)} style={{ pointerEvents: 'auto' }}>确定</Button>
                    </div>
                </div>
            )}>
            </Modal>
        </>
    )
}
export default Militbuy