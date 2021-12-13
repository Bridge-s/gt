import '../css/home.css'
import React, { useState } from 'react'
import { Property } from 'csstype'
import { Col, Row } from 'antd'
export type childType = {
    name: String,
    click?: Function
}
interface TbtnPrpos {
    lists: Array<childType>,
    gap?: number,
    justify?: "space-around" | "space-between" | "center" | "end" | "start" | undefined,
    btnStyle?: React.CSSProperties,
    childStyle?: React.CSSProperties
}
const Tbtn = (props: TbtnPrpos) => {
    const [se, setSe] = useState(0)
    const onclick = (item: childType, index: number) => {
        setSe(index)
        if (item.click) {
            item.click(item, index)
        }
    }
    return (
        <div className="flex-btns" style={{ justifyContent: props.justify, gap: props?.gap }}>
            <Row justify={props.justify} style={{...props.childStyle}}>
                {props.lists.map((item, index) => (
                    <Col onClick={() => onclick(item, index)} className="padding20btn head-btn" style={{ opacity: se === index ? '1' : '', ...props.btnStyle }} key={index}>{item.name}</Col>
                ))}
            </Row>
        </div>
    )
}
export default React.memo(Tbtn)