import { Mycontext } from '../../utils/useApp'
import { useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import Tbtn, { childType } from '../components/tabsBtn'
import { Row, Col, Button, message, Tooltip, Modal, Input, notification, Spin, Tabs, Radio, Skeleton, Divider, Pagination } from 'antd'
import '../css/home.css'
import '../components/model/model.css'
import CP from '../components/model/cpPng'
import heartPng from '../../utils/img/icon/heart.png'
import firlt from '../../utils/img/icon/fight.png'
import CfModel from '../components/model/cfModel'
import { useTranslation } from 'react-i18next'
import InfiniteScroll from 'react-infinite-scroll-component';
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
    const { TabPane } = Tabs;

    function callback() {
        // console.log(key);
    }

    return (
        <div>
            <div className="tabs-trading">
                <Tabs defaultActiveKey="1" onChange={callback} style={{ marginTop: '80px' }}>
                    <TabPane tab="预训练" key="1">
                        <Row justify="space-between" style={{ margin: "40px 20px", justifyContent: "flex-start" }} className="radioGroup">
                            <Radio.Group defaultValue="a" buttonStyle="solid">
                                <Radio.Button value="a" className="all-btn">全部</Radio.Button>
                                <Radio.Button value="b" className="all-btn">狼人</Radio.Button>
                                <Radio.Button value="c" className="all-btn">熊猫</Radio.Button>
                                <Radio.Button value="d" className="all-btn">弓箭手</Radio.Button>
                                <Radio.Button value="e" className="all-btn">战士</Radio.Button>
                                <Radio.Button value="f" className="all-btn">巫师</Radio.Button>
                                <Radio.Button value="g" className="all-btn">武士</Radio.Button>
                            </Radio.Group>
                        </Row>
                        <InfiniteScroll
                            height={document.getElementsByTagName("body")[0].offsetHeight - 300}
                            next={callback}
                            hasMore={false}
                            loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
                            endMessage={<Divider plain></Divider>}
                            dataLength={10}
                        >
                            <Row justify="space-between" style={{ margin: "10px 50px", justifyContent: "space-between" }} className="row-box-buy">
                                <div className="item">
                                    <img src={require("../../utils/img/trading/hero-6.png").default} alt="" className="hero-item" />
                                    <br />
                                    <div className="gold-content-left">
                                        <div className="gold-item">
                                            <span>抵押</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>收益</span>
                                        </div>
                                    </div>
                                    <div className="gold-content-right">
                                        <div className="gold-item">
                                            <span>145MWC</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>24MWC / 24h</span>
                                        </div>
                                    </div>
                                    <Button className="hero-item-btn" style={{ marginTop: "20px" }}>训练</Button>
                                </div>
                                <div className="item">
                                    <img src={require("../../utils/img/trading/hero-6.png").default} alt="" className="hero-item" />
                                    <br />
                                    <div className="gold-content-left">
                                        <div className="gold-item">
                                            <span>抵押</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>收益</span>
                                        </div>
                                    </div>
                                    <div className="gold-content-right">
                                        <div className="gold-item">
                                            <span>145MWC</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>24MWC / 24h</span>
                                        </div>
                                    </div>
                                    <Button className="hero-item-btn" style={{ marginTop: "20px" }}>训练</Button>
                                </div>
                                <div className="item">
                                    <img src={require("../../utils/img/trading/hero-6.png").default} alt="" className="hero-item" />
                                    <br />
                                    <div className="gold-content-left">
                                        <div className="gold-item">
                                            <span>抵押</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>收益</span>
                                        </div>
                                    </div>
                                    <div className="gold-content-right">
                                        <div className="gold-item">
                                            <span>145MWC</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>24MWC / 24h</span>
                                        </div>
                                    </div>
                                    <Button className="hero-item-btn" style={{ marginTop: "20px" }}>训练</Button>
                                </div>
                                <div className="item">
                                    <img src={require("../../utils/img/trading/hero-5.png").default} alt="" className="hero-item" />
                                    <br />
                                    <div className="gold-content-left">
                                        <div className="gold-item">
                                            <span>抵押</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>收益</span>
                                        </div>
                                    </div>
                                    <div className="gold-content-right">
                                        <div className="gold-item">
                                            <span>145MWC</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>24MWC / 24h</span>
                                        </div>
                                    </div>
                                    <Button className="hero-item-btn" style={{ marginTop: "20px" }}>训练</Button>
                                </div>
                                <div className="item">
                                    <img src={require("../../utils/img/trading/hero-5.png").default} alt="" className="hero-item" />
                                    <br />
                                    <div className="gold-content-left">
                                        <div className="gold-item">
                                            <span>抵押</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>收益</span>
                                        </div>
                                    </div>
                                    <div className="gold-content-right">
                                        <div className="gold-item">
                                            <span>145MWC</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>24MWC / 24h</span>
                                        </div>
                                    </div>
                                    <Button className="hero-item-btn" style={{ marginTop: "20px" }}>训练</Button>
                                </div>
                                <div className="item">
                                    <img src={require("../../utils/img/trading/hero-4.png").default} alt="" className="hero-item" />
                                    <br />
                                    <div className="gold-content-left">
                                        <div className="gold-item">
                                            <span>抵押</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>收益</span>
                                        </div>
                                    </div>
                                    <div className="gold-content-right">
                                        <div className="gold-item">
                                            <span>145MWC</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>24MWC / 24h</span>
                                        </div>
                                    </div>
                                    <Button className="hero-item-btn" style={{ marginTop: "20px" }}>训练</Button>
                                </div>
                                <div className="item">
                                    <img src={require("../../utils/img/trading/hero-4.png").default} alt="" className="hero-item" />
                                    <br />
                                    <div className="gold-content-left">
                                        <div className="gold-item">
                                            <span>抵押</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>收益</span>
                                        </div>
                                    </div>
                                    <div className="gold-content-right">
                                        <div className="gold-item">
                                            <span>145MWC</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>24MWC / 24h</span>
                                        </div>
                                    </div>
                                    <Button className="hero-item-btn" style={{ marginTop: "20px" }}>训练</Button>
                                </div>
                                <div className="item">
                                    <img src={require("../../utils/img/trading/hero-3.png").default} alt="" className="hero-item" />
                                    <br />
                                    <div className="gold-content-left">
                                        <div className="gold-item">
                                            <span>抵押</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>收益</span>
                                        </div>
                                    </div>
                                    <div className="gold-content-right">
                                        <div className="gold-item">
                                            <span>145MWC</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>24MWC / 24h</span>
                                        </div>
                                    </div>
                                    <Button className="hero-item-btn" style={{ marginTop: "20px" }}>训练</Button>
                                </div>
                                <div className="item">
                                    <img src={require("../../utils/img/trading/hero-2.png").default} alt="" className="hero-item" />
                                    <br />
                                    <div className="gold-content-left">
                                        <div className="gold-item">
                                            <span>抵押</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>收益</span>
                                        </div>
                                    </div>
                                    <div className="gold-content-right">
                                        <div className="gold-item">
                                            <span>145MWC</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>24MWC / 24h</span>
                                        </div>
                                    </div>
                                    <Button className="hero-item-btn" style={{ marginTop: "20px" }}>训练</Button>
                                </div>
                                <div className="item">
                                    <img src={require("../../utils/img/trading/hero-1.png").default} alt="" className="hero-item" />
                                    <br />
                                    <div className="gold-content-left">
                                        <div className="gold-item">
                                            <span>抵押</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>收益</span>
                                        </div>
                                    </div>
                                    <div className="gold-content-right">
                                        <div className="gold-item">
                                            <span>145MWC</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>24MWC / 24h</span>
                                        </div>
                                    </div>
                                    <Button className="hero-item-btn" style={{ marginTop: "20px" }}>训练</Button>
                                </div>
                            </Row>
                            <Pagination defaultCurrent={1} total={50} showSizeChanger={false} size="small" style={{ marginTop: "30px" }} className="page" />
                        </InfiniteScroll>
                    </TabPane>
                    <TabPane tab="训练" key="2">
                        <Row justify="space-between" style={{ margin: "40px 20px", justifyContent: "flex-start" }} className="radioGroup">
                            <Radio.Group defaultValue="a" buttonStyle="solid">
                                <Radio.Button value="a" className="all-btn">全部</Radio.Button>
                                <Radio.Button value="b" className="all-btn">狼人</Radio.Button>
                                <Radio.Button value="c" className="all-btn">熊猫</Radio.Button>
                                <Radio.Button value="d" className="all-btn">弓箭手</Radio.Button>
                                <Radio.Button value="e" className="all-btn">战士</Radio.Button>
                                <Radio.Button value="f" className="all-btn">巫师</Radio.Button>
                                <Radio.Button value="g" className="all-btn">武士</Radio.Button>
                            </Radio.Group>
                        </Row>
                        <InfiniteScroll
                            height={document.getElementsByTagName("body")[0].offsetHeight - 300}
                            next={callback}
                            hasMore={false}
                            loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
                            endMessage={<Divider plain></Divider>}
                            dataLength={10}
                        >
                            <Row justify="space-between" style={{ margin: "10px 50px", justifyContent: "space-between" }} className="row-box-buy">
                                <div className="item">
                                    <img src={require("../../utils/img/trading/hero-6.png").default} alt="" className="hero-item" />
                                    <br />
                                    <div className="gold-content-left-2">
                                        <div className="gold-item">
                                            <span>抵押</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>收益</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>可用</span>
                                        </div>
                                    </div>
                                    <div className="gold-content-right-2">
                                        <div className="gold-item">
                                            <span>145MWC</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>24MWC / 24h</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>48MWC</span>
                                        </div>
                                    </div>
                                    <Button className="hero-item-btn" style={{ marginTop: "20px" }}>撤回</Button>
                                    <Button className="hero-item-btn" style={{ marginTop: "10px" }}>收回</Button>
                                </div>
                                <div className="item">
                                    <img src={require("../../utils/img/trading/hero-5.png").default} alt="" className="hero-item" />
                                    <br />
                                    <div className="gold-content-left-2">
                                        <div className="gold-item">
                                            <span>抵押</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>收益</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>可用</span>
                                        </div>
                                    </div>
                                    <div className="gold-content-right-2">
                                        <div className="gold-item">
                                            <span>145MWC</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>24MWC / 24h</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>48MWC</span>
                                        </div>
                                    </div>
                                    <Button className="hero-item-btn" style={{ marginTop: "20px" }}>撤回</Button>
                                    <Button className="hero-item-btn" style={{ marginTop: "10px" }}>收回</Button>
                                </div>
                                <div className="item">
                                    <img src={require("../../utils/img/trading/hero-5.png").default} alt="" className="hero-item" />
                                    <br />
                                    <div className="gold-content-left-2">
                                        <div className="gold-item">
                                            <span>抵押</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>收益</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>可用</span>
                                        </div>
                                    </div>
                                    <div className="gold-content-right-2">
                                        <div className="gold-item">
                                            <span>145MWC</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>24MWC / 24h</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>48MWC</span>
                                        </div>
                                    </div>
                                    <Button className="hero-item-btn" style={{ marginTop: "20px" }}>撤回</Button>
                                    <Button className="hero-item-btn" style={{ marginTop: "10px" }}>收回</Button>
                                </div>
                                <div className="item">
                                    <img src={require("../../utils/img/trading/hero-4.png").default} alt="" className="hero-item" />
                                    <br />
                                    <div className="gold-content-left-2">
                                        <div className="gold-item">
                                            <span>抵押</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>收益</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>可用</span>
                                        </div>
                                    </div>
                                    <div className="gold-content-right-2">
                                        <div className="gold-item">
                                            <span>145MWC</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>24MWC / 24h</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>48MWC</span>
                                        </div>
                                    </div>
                                    <Button className="hero-item-btn" style={{ marginTop: "20px" }}>撤回</Button>
                                    <Button className="hero-item-btn" style={{ marginTop: "10px" }}>收回</Button>
                                </div>
                                <div className="item">
                                    <img src={require("../../utils/img/trading/hero-4.png").default} alt="" className="hero-item" />
                                    <br />
                                    <div className="gold-content-left-2">
                                        <div className="gold-item">
                                            <span>抵押</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>收益</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>可用</span>
                                        </div>
                                    </div>
                                    <div className="gold-content-right-2">
                                        <div className="gold-item">
                                            <span>145MWC</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>24MWC / 24h</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>48MWC</span>
                                        </div>
                                    </div>
                                    <Button className="hero-item-btn" style={{ marginTop: "20px" }}>撤回</Button>
                                    <Button className="hero-item-btn" style={{ marginTop: "10px" }}>收回</Button>
                                </div>
                                <div className="item">
                                    <img src={require("../../utils/img/trading/hero-3.png").default} alt="" className="hero-item" />
                                    <br />
                                    <div className="gold-content-left-2">
                                        <div className="gold-item">
                                            <span>抵押</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>收益</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>可用</span>
                                        </div>
                                    </div>
                                    <div className="gold-content-right-2">
                                        <div className="gold-item">
                                            <span>145MWC</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>24MWC / 24h</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>48MWC</span>
                                        </div>
                                    </div>
                                    <Button className="hero-item-btn" style={{ marginTop: "20px" }}>撤回</Button>
                                    <Button className="hero-item-btn" style={{ marginTop: "10px" }}>收回</Button>
                                </div>
                                <div className="item">
                                    <img src={require("../../utils/img/trading/hero-3.png").default} alt="" className="hero-item" />
                                    <br />
                                    <div className="gold-content-left-2">
                                        <div className="gold-item">
                                            <span>抵押</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>收益</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>可用</span>
                                        </div>
                                    </div>
                                    <div className="gold-content-right-2">
                                        <div className="gold-item">
                                            <span>145MWC</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>24MWC / 24h</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>48MWC</span>
                                        </div>
                                    </div>
                                    <Button className="hero-item-btn" style={{ marginTop: "20px" }}>撤回</Button>
                                    <Button className="hero-item-btn" style={{ marginTop: "10px" }}>收回</Button>
                                </div>
                                <div className="item">
                                    <img src={require("../../utils/img/trading/hero-2.png").default} alt="" className="hero-item" />
                                    <br />
                                    <div className="gold-content-left-2">
                                        <div className="gold-item">
                                            <span>抵押</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>收益</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>可用</span>
                                        </div>
                                    </div>
                                    <div className="gold-content-right-2">
                                        <div className="gold-item">
                                            <span>145MWC</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>24MWC / 24h</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>48MWC</span>
                                        </div>
                                    </div>
                                    <Button className="hero-item-btn" style={{ marginTop: "20px" }}>撤回</Button>
                                    <Button className="hero-item-btn" style={{ marginTop: "10px" }}>收回</Button>
                                </div>
                                <div className="item">
                                    <img src={require("../../utils/img/trading/hero-2.png").default} alt="" className="hero-item" />
                                    <br />
                                    <div className="gold-content-left-2">
                                        <div className="gold-item">
                                            <span>抵押</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>收益</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>可用</span>
                                        </div>
                                    </div>
                                    <div className="gold-content-right-2">
                                        <div className="gold-item">
                                            <span>145MWC</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>24MWC / 24h</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>48MWC</span>
                                        </div>
                                    </div>
                                    <Button className="hero-item-btn" style={{ marginTop: "20px" }}>撤回</Button>
                                    <Button className="hero-item-btn" style={{ marginTop: "10px" }}>收回</Button>
                                </div>
                                <div className="item">
                                    <img src={require("../../utils/img/trading/hero-1.png").default} alt="" className="hero-item" />
                                    <br />
                                    <div className="gold-content-left-2">
                                        <div className="gold-item">
                                            <span>抵押</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>收益</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>可用</span>
                                        </div>
                                    </div>
                                    <div className="gold-content-right-2">
                                        <div className="gold-item">
                                            <span>145MWC</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>24MWC / 24h</span>
                                        </div>
                                        <div className="gold-item">
                                            <span>48MWC</span>
                                        </div>
                                    </div>
                                    <Button className="hero-item-btn" style={{ marginTop: "20px" }}>撤回</Button>
                                    <Button className="hero-item-btn" style={{ marginTop: "10px" }}>收回</Button>
                                </div>
                            </Row>
                            <Pagination defaultCurrent={1} total={50} showSizeChanger={false} size="small" style={{ marginTop: "30px" }} className="page" />
                        </InfiniteScroll>
                    </TabPane>
                </Tabs>
            </div>
        </div>
    )
}
export default Mt