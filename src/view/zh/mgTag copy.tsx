import { Mycontext } from '../../utils/useApp'
import { useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import Tbtn, { childType } from '../components/tabsBtn'
import { Row, Col, Button, message, Tooltip, Modal, Input, notification, Spin } from 'antd'
import '../css/home.css'
import '../components/model/model.css'
import CP from '../components/model/cpPng'
import heartPng from '../../utils/img/icon/heart.png'
import firlt from '../../utils/img/icon/fight.png'
import CfModel from '../components/model/cfModel'
import { useTranslation } from 'react-i18next'
const fightPercent = ['0%', '0%', '120%', '160%', '300%', '1000%', '2000%']
type Action = {
    type: string,
    value?: any
}

type modelProps = {
    handleOk: any,
    setIsModalVisible?: Function,
    isModalVisible: boolean,
    loading: boolean,
    handleCancel?: any,

}
const Num = (props: modelProps) => {
    const [num, setNum] = useState(1)
    const { t } = useTranslation()
    const onChange = (e: any) => {
        setNum(e.target.value)
    }

    return (
        <>
            <Modal width="300px" centered closable={false} visible={props.isModalVisible} onOk={props?.handleOk} onCancel={props?.handleCancel} modalRender={
                () =>
                    <div className="back-png" style={{ padding: '15px', borderRadius: '15px', pointerEvents: 'auto', width: '100%' }}>
                        <label>{t('csjgs')}：</label>
                        <Input style={{ margin: '15px 0' }} value={num} placeholder={t('csjg')} type="number" min={1} onChange={onChange}></Input>
                        <div style={{ textAlign: 'right' }}>
                            <div className="card-but-select" onClick={props?.handleCancel} style={{ marginRight: '10px' }}>{t('qx')}</div>
                            <div className="card-but" onClick={props?.handleOk.bind(null, num)}>
                                <Spin spinning={props.loading}>
                                    {t('qd')}
                                </Spin></div>
                        </div>
                    </div>
            }>
            </Modal>
        </>
    )
}

const Mt = () => {
    const { t } = useTranslation()
    /**获取合约对象 */
    const contract = useContext(Mycontext)
    // selected已选择的key
    const [selected, dispath] = useReducer((state: any, action: Action) => {
        if (action.type === 'change') {
            return action.value
        }
        if (action.type === 'resize') {
            return state
        }
    }, 0)
    /**打开盲盒的状态 */
    const [openStatus, setOpenStatus] = useState(false)
    /**控制恐龙图片的显示 */
    const [cpStatus, setCpStatus] = useState(false)
    /**恐龙图片 */
    const cpPngArrList = useRef<any[]>([])
    /**页面加载中状态 */
    const [spinning, setSpinning] = useState(false)
    /**选择的卡牌 */
    const [kpItem, setKpItem] = useState<any>({})
    /**确认出售弹窗 */
    const [sellStatus, setSell] = useState(false)
    /**判断是否出售 */
    const [sellLoading, setSellLoading] = useState(false)
    const [cards, setCards] = useState<any>([])
    /**init */
    const init = () => {
        setCards((state: any) => [])
        contract.myInventory && contract.myInventory().then((res: any) => {
            setSpinning(true)
            let list: any[] = []
            res.available = res.available.map((item: any) => ({
                value: item,
                isSell: false
            }))
            res.marketplace = res.marketplace.map((item: any) => ({
                value: item,
                isSell: true
            }))
            if (selected === 0) {
                // 全部
                list = [...res.available, ...res.marketplace]
            } else if (selected === 1) {
                // 可用
                list = res.available
            } else {
                // 出售中
                list = res.marketplace
            }
            if (Array.isArray(list)) {
                list.forEach(async (item: any, index: number) => {
                    setTimeout(async () => {
                        const _res = await contract.getTokenInfo(item.value)
                        if (item.isSell) {
                            const [price] = await contract.orderSale(item.value)
                            _res.price = price / 1e18
                        }
                        _res.tokenId = item.value
                        _res.isSell = item.isSell
                        _res.loading = false
                        _res.fightPercent = fightPercent[+_res.levelCode[0]]
                        if (_res.levelCode !== '0') {
                            const klPng = require('../../utils/img/kl/kl_L' + _res.levelCode[0] + '.png')
                            _res.png = klPng
                        } else {
                            _res.png = require('../../utils/img/kld.png')
                        }
                        const cardsList: any = _res
                        setCards((state: any) => {
                            state.push(cardsList)
                            return [...state]
                        })
                        setSpinning(false)
                    }, index * 100)
                })
            }
        })
    }
    const oncancel = () => {
        setCpStatus(false)
    }
    /**打开盲盒 */
    const open = async (item: any) => {
        item.loading = true
        setOpenStatus(true)
        await isApprovedForAll()
        notification.info({
            message: t('kqz') + '...',
            duration: null,
            key: "open"
        })
        contract.open(item.tokenId).then((res: any) => {
            init()
            let level = res.events.Open.returnValues.level[0]
            const klPng = require('../../utils/img/kl/kl_L' + level + '.png')
            cpPngArrList.current = [klPng]
            setCpStatus(true)
        }).catch((err: any) => {
            console.log(err)
        }).finally(() => {
            item.loading = false
            notification.close('open')
            setOpenStatus(false)
        })
    }
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
    /**出售盲盒，需要判断体力值为满体力值状态 */
    const placeOrder = async (item: any) => {
        if (Number(item.energy) === 120) {
            try {
                await isApprovedForAll()
                setKpItem(item)
                setSell(true)
            } catch (err: any) {
                item.loading = false
                console.log(err)
            }
        } else {
            notification.warning({
                message: t("qbctlzcs"),
                duration: 1.5,
            })
        }
    }
    /**出售 */
    const sellComfirm = (num: number) => {
        setSellLoading(true)
        contract.placeOrder && contract.placeOrder(kpItem.tokenId, num)
            .then((res: any) => {
                init()
                notification.success({
                    message: t('cscg'),
                    duration: 1.5,
                })
            }).catch((err: any) => {
                console.log(err)
            }).finally(() => {
                setSellLoading(false)
                setSell(false)
            })
    }
    /**取消出售 */
    const cancelSell = async (item: any) => {
        try {
            await isApprovedForAll()
            item.loading = true
            setOpenStatus(true)
            contract.cancelOrder && contract.cancelOrder(item.tokenId)
                .then((res: any) => {
                    init()
                }).finally(() => {
                    item.loading = false
                    setOpenStatus(false)
                })
        } catch (err: any) {

        }
    }
    // 设置确认弹窗开启
    const [cfStatus, setIs] = useState(false)

    /**补充体力值 */
    const replenish = async (item: any) => {

        if (Number(item.energy) < 120) {
            try {
                await isApprovedForAll()
                setKpItem(item)
                setIs(true)
            } catch (err: any) {
                console.log(err)
            }
        } else {
            // message.warning('体力值已满，无需补充！')
            notification.info({
                message: t('tlzm'),
                duration: 1.5,
            })
        }
    }

    const handleCancel = () => {
        setIs(false)
    }
    // 获取购买数量
    const [amount, dispatch] = useReducer((state: any, e: any) => {
        if (e.target.value > (120 - kpItem.energy)) {
            return 120 - kpItem.energy
        }
        return e.target.value
    }, '1')

    const [dinosaurAuthLoading, setDinosaurAuthLoading] = useState(false)

    // 确认回复提体力
    const klhandleOk = () => {
        setDinosaurAuthLoading(true)
        contract.recovery && contract.recovery(kpItem.tokenId, amount)
            .then((res: any) => {
                notification.success({
                    message: t('bdcg'),
                    duration: 1.5,
                })
            }).finally(() => {
                setIs(false)
                setDinosaurAuthLoading(false)
            })
    }

    /**获取背包信息 */
    useEffect(() => {
        init()
    }, [contract, selected])
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const lists: childType[] = [
        { name: t('qb'), click: (item: any, index: any) => dispath({ type: 'change', value: index }) },
        { name: t('ky'), click: (item: any, index: any) => dispath({ type: 'change', value: index }) },
        { name: t('csz'), click: (item: any, index: any) => dispath({ type: 'change', value: index }) },
    ]
    const width = window.innerWidth < 600 ? {
        margin: '10px 5px 0 5px'
    } : {
        width: '100px', margin: '10px 15px 0 0'
    }
    const marginTop = window.innerWidth < 600 ? '3px' : '10px'
    const autoWidth = window.innerWidth < 600 ? '15px' : '20px'

    return (
        <div>
            {
                useMemo(() => <Tbtn lists={lists} gap={40} btnStyle={width}></Tbtn>, [lists])
            }
            <Row justify="space-between" className="flex-justify-center mobile-row">
                {
                    cards.map((item: any, key: number) => (
                        <Col style={{}} key={key} className="col-width-30 mobile-col" xs={12}>
                            {/* {item.levelCode === '0' ? t.kcx : ''} */}
                            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', height: '100%' }}>
                                <img src={item.png.default} style={{ height: '100%', width: "100%" }} alt="" />
                                {
                                    item.levelCode !== '0' ? (
                                        <div className="label-head" style={{ bottom: '33%' }}>
                                            <div style={{ position: 'relative' }}>
                                                <img src={require("../../utils/img/icon/remain.png").default} width="100%" height="100%" alt="" />
                                                <div className="label-value"># {item.tokenId}</div>
                                            </div>
                                        </div>
                                    ) : ''
                                }
                                {item.levelCode === '0' ?
                                    <div className="card-but" style={{
                                        position: 'absolute',
                                        bottom: '8%',
                                        marginTop: '10px'
                                    }} onClick={() => !item.loading && open(item)}>
                                        <Spin spinning={item.loading}>
                                            {t('op')}
                                        </Spin></div>
                                    :
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '8%',
                                        left: '10px',
                                        right: '10px',
                                    }}>
                                        <Tooltip title={"PVE" + t('jc')}>
                                            <div style={{ display: 'flex', justifyContent: "space-between", width: '80%', marginLeft: '10%' }}>
                                                <img src={firlt} width={autoWidth} alt="" />
                                                <span style={{ marginRight: '10px' }}>{item.fightPercent}</span>
                                            </div>
                                        </Tooltip>
                                        {
                                            item.isSell
                                                ? (
                                                    <>
                                                        <Tooltip title={t('csjgs')}>
                                                            <div style={{ display: 'flex', justifyContent: "space-between", width: '80%', marginLeft: '10%' }}>
                                                                <span>{t('csjgs')}</span>
                                                                <span>{item.price} gToken</span>
                                                            </div>
                                                        </Tooltip>
                                                        <div className="card-but" onClick={() => !item.loading && cancelSell(item)} style={{ marginTop }}>
                                                            <Spin spinning={item.loading}>
                                                                {t('qxcs')}
                                                            </Spin></div>
                                                    </>)
                                                : (<>
                                                    <Tooltip title={t('sytl')}>
                                                        <div style={{ display: 'flex', justifyContent: "space-between", width: '80%', marginLeft: '10%' }} onClick={() => replenish(item)}>
                                                            <img src={heartPng} width={autoWidth} alt="" />
                                                            <div style={{ position: 'relative' }}>
                                                                <span>{item.energy}/120</span>
                                                                <span className="add-font">+</span>
                                                                {/* <img src={require('../utils/img/icon/add.png').default} width="15px" alt="" style={{position:'relative',right:'-10%'}}/> */}
                                                            </div>
                                                        </div>
                                                    </Tooltip>
                                                    <div className="card-but" onClick={() => !item.loading && placeOrder(item)} style={{ marginTop }}>
                                                        <Spin spinning={item.loading}>
                                                            {t('cs')}
                                                        </Spin>
                                                    </div>
                                                </>)
                                        }
                                    </div>
                                }
                            </div>
                        </Col>
                    ))
                }
            </Row>
            <CP isModalVisible={cpStatus} setIsModalVisible={setCpStatus} pngList={cpPngArrList.current} modalStyle={{ width: '250px', height: '350px' }}></CP>
            <CfModel handleCancel={handleCancel} isModalVisible={cfStatus} modalRender={() => (
                <div className="back-png" style={{ padding: '15px', borderRadius: '15px', pointerEvents: 'auto', width: '100%' }}>
                    <label>{t('bctlz')}：</label>
                    <Input suffix={
                        <div style={{
                            fontSize: '14px',
                            fontWeight: 500,
                            borderLeft: '1px solid #999',
                            paddingLeft: '5px',
                            cursor: 'pointer'
                        }} onClick={dispatch.bind(null, { target: { value: 120 - kpItem.energy } })}>max</div>
                    }
                        min={1}
                        value={amount}
                        placeholder={t('srubctlz')}
                        type="number"
                        onChange={(e: any) => dispatch(e)} max={120 - kpItem.energy}
                        style={{ marginBottom: '15px' }}></Input>
                    <div style={{ textAlign: 'right' }}>
                        <div className="card-but-select" onClick={handleCancel} style={{ marginRight: '10px' }}>{t('qx')}</div>
                        <div className="card-but" style={{ marginRight: '10px' }} onClick={klhandleOk}>
                            <Spin spinning={dinosaurAuthLoading}>
                                {t('gm')}
                            </Spin>
                        </div>
                    </div>
                </div>
            )}>
            </CfModel>
            <Num isModalVisible={sellStatus} handleCancel={setSell.bind(null, false)} handleOk={sellComfirm} loading={sellLoading}></Num>
        </div>
    )
}
export default Mt