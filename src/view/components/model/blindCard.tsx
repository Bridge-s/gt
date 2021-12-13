import '../../css/blindCard.css'
import { Card } from 'antd'
import Meta from 'antd/lib/card/Meta'
import React, { ReactNode } from 'react'
interface props {
    title: string,
    desc?: string | ReactNode,
    style?: React.CSSProperties | undefined,
    actions?: React.ReactNode[]
    className?: string
}
const Bc: React.FC<props> = (prop) => {
    return (
        <Card
            style={{ borderRadius: '15px', padding: '15px', ...prop?.style }}
            bordered={false}
            className={"bk "+ prop?.className }
            cover={
                prop.children
            }
            actions={
                prop.actions
            }
        >
            <Meta
                title={prop.title}
                description={prop?.desc}
            />
        </Card>
    )
}
export default Bc