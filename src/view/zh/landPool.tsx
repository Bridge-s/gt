import { Button, Col, Row, Tooltip, Modal, message, Input, Form, notification, Spin, Tabs, Radio, Skeleton, Divider, Pagination, Slider, InputNumber } from 'antd'
import React, { useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import CP from '../components/model/cpPng'
import '../css/home.css'
import '../components/model/model.css'
import { Mycontext } from '../../utils/useApp'
import CfModel from '../components/model/cfModel'
import { useTranslation } from 'react-i18next'
import { copyFile } from 'fs'

type poolCliden = {
    title: string,
    desc: string,
    actions: React.ReactNode[],
    png: any
}
const fightPercent = ['0%', '0%', '120%', '160%', '300%', '1000%', '2000%']


type modelProps = {
    handleOk: any,
    setIsModalVisible?: Function,
    isModalVisible: boolean,
    handleCancel?: any,
    infoItem: any
}

const Num = (props: modelProps) => {
    const { t } = useTranslation()
    const [num, dispatch] = useReducer((state: any, value: any) => {
        if (value > (12 - props.infoItem.todayUsed) || value === 0) {
            return Number(state)
        }
        return Number(value)
    }, 1)
    const handler = (type: string, value: any) => {
        (props as any)[type](value)
        dispatch(1)
    }
    return (
        <>
            <Modal width="300px" centered closable visible={props.isModalVisible} onOk={props?.handleOk} onCancel={props?.handleCancel} modalRender={
                () =>
                    <div className="back-png" style={{ padding: '15px', width: '100%', borderRadius: '15px', pointerEvents: 'auto' }}>
                        <label>{t('zdcs')}：</label>
                        <Input suffix={
                            <div style={{
                                fontSize: '14px',
                                fontWeight: 500,
                                borderLeft: '1px solid #999',
                                paddingLeft: '5px',
                                cursor: 'pointer'
                            }} onClick={dispatch.bind(null, 12 - props.infoItem.todayUsed)}>max</div>
                        }
                            style={{ margin: '15px 0' }}
                            max={12 - props.infoItem.todayUsed}
                            value={num}
                            placeholder={t('srzdcs')}
                            type="number"
                            min={1}
                            onChange={(e: any) => dispatch(e.target.value)}></Input>
                        <div style={{ textAlign: 'right' }}>
                            <div className="card-but-select" onClick={handler.bind(null, 'handleCancel', false)} style={{ marginRight: '10px' }}>{t('qx')}</div>
                            <div className="card-but" style={{ marginRight: '10px' }} onClick={handler.bind(null, 'handleOk', num)}>{t('qd')}</div>
                        </div>
                    </div>
            }>
            </Modal >
        </>
    )
}
const Fh = () => {
    const { t, i18n } = useTranslation()
    const l = i18n.language
    /**获取合约对象 */
    const contract = useContext(Mycontext)
    /**刷新 */
    const [selector, setter] = useState(null)
    /**卡牌对象数组 */
    const [cards, setCards] = useState<any>([])
    /**恐龙图片 */
    const cpPngArrList = useRef<any[]>([require('../../utils/img/nov/cb.png')])
    /**用户信息 */
    const [useInfo, setInfo] = useState<any>({})
    // 设置确认弹窗开启
    const [cfStatus, setIs] = useState(false)
    /**选择的卡牌 */
    const [kpItem, setKpItem] = useState<any>({})
    // 获取购买数量
    const [amount, dispatch] = useReducer((state: any, e: any) => {
        if (e.target.value > (120 - kpItem.energy)) {
            return 120 - kpItem.energy
        }
        return e.target.value
    }, '1')
    const init = () => {
        setCards([])
        contract.getTokens && contract.getTokens().then((res: any) => {
            const list = res
            if (Array.isArray(list)) {
                list.forEach((item: any, index: number) => {
                    setTimeout(async () => {
                        const _res = await contract.getTokenInfo(item)
                        // 没开的蛋
                        if (_res.levelCode !== '0') {
                            _res.tokenId = item
                            _res.loading = false
                            _res.fightPercent = fightPercent[+_res.levelCode[0]]
                            _res.fightNums = 12 - _res.todayUsed
                            _res.png = require('../../utils/img/kl/kl_L' + _res.levelCode[0] + '.png')
                            const card: any = _res
                            setCards((state: any) => {
                                state.push(card)
                                return [...state]
                            })
                        }
                    }, index * 100)
                })
            }
        })
    }
    useEffect(() => {
        init()
    }, [contract])
    /**判断是否授权 */
    const isApprovedForAll = async () => {
        if (contract.isApprovedForAll) {
            const res = await contract.isApprovedForAll()
            if (!res) {
                notification.info({
                    message: t('sqhe') + '...',
                    duration: null,
                    key: 'auth'
                })
                try {
                    await contract.setApprovalForAll()
                } catch (err) {
                    throw err
                }
                notification.close('auth')
            }
        }
    }
    const { TabPane } = Tabs;
    function callback() {
        // console.log(key);
    }

    // const copyText = document.querySelectorAll('#linkInput') as NodeListOf<HTMLElement>;
    const copy = () => {
        // let inputText = document.getElementById('linkInput');
        // let currentFocus = document.activeElement;
        // inputText.focus();
        // inputText.setSelectionRange(0, inputText.value.length);
        // document.execCommand('copy', true);
        // currentFocus.focus();
    }

    return (
        <div style={{ overflowX: "hidden" }}>
            <div className="box">
                <div style={{ width: "1000px", margin: "0 auto" }} className="box-item">
                    <div className="theme-item">Invite dividends</div>
                    <Row className="invite-content">
                        <div className="invite-item">
                            <div style={{ paddingRight: "120px" }} className="invite-num-1">0.00</div>
                            <div className="invite-describe invite-num-1" style={{ borderRight: "2px solid #fced95", paddingRight: "120px" }}>Invite Rewards(LOS)</div>
                        </div>
                        <div className="invite-item">
                            <div style={{ padding: "0 120px" }} className="invite-num-2">0</div>
                            <div className="invite-describe invite-num-2" style={{ borderRight: "2px solid #fced95", padding: "0 120px" }}>Number of invitations</div>
                        </div>
                        <div className="invite-item">
                            <div style={{ paddingLeft: "120px" }} className="invite-num-3">0.00</div>
                            <div className="invite-describe invite-num-3" style={{ paddingLeft: "120px" }}>Invite Rewards(xLOS)</div>
                        </div>
                    </Row>
                    <Row style={{ justifyContent: "center", marginTop: "90px" }} className="link-item">
                        <div className="lable-content">Invitation link: </div>
                        <div style={{ width: "830px" }} className="line-item">
                            <Input bordered className="link-input" id="linkInput" defaultValue="https://app.youxi/#/invite/null" />
                            <Button className="copy-btn" onClick={copy}>Copy</Button>
                        </div>

                    </Row>
                    <Row style={{ justifyContent: "center", marginTop: "90px" }} className="link-item">
                        <div className="lable-content">Invitation rules: </div>
                        <Col className="rules-content" style={{ width: "805px" }}>
                            <div>1、The invitee buys the secret key and gets a reward of 10%.</div>
                            <div>2、The invitee receives the gift and receives 5% of the gift as a reward.</div>
                            <div>3、The invitee`s School of Wizardry receives income, and 10% of the reward is used as a reward.</div>
                        </Col>
                    </Row>
                    <Input style={{ width: 'calc(100% - 200px)' }} className="list-input" defaultValue="Invitation list" />
                </div>
            </div>
        </div>
    )
}
export default Fh