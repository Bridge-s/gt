import { useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import Bc from '../components/model/blindCard'
import Tbtn, { childType } from '../components/tabsBtn'
import '../css/home.css'
import '../components/model/model.css'
import headerpng from '../../utils/img/icon/eggmh.png'
import cpPng from '../../utils/img/icon/cp.png'
import { Button, Col, Row, Modal, Input, Form, notification, Spin, Tabs, Radio, Skeleton, Divider, Pagination } from 'antd'
import { Mycontext } from '../../utils/useApp'
import Egg from '../components/model/egg'
import Sell from '../components/model/sell'
import CP from '../components/model/cpPng'
import CfModel from '../components/model/cfModel'
import { useTranslation } from 'react-i18next'
import InfiniteScroll from 'react-infinite-scroll-component';
/**
 * 
 * @returns 购买彩票的数量弹窗
 */
type modelProps = {
    handleOk: any,
    setIsModalVisible: Function,
    isModalVisible: boolean,
    loading: boolean,
    handleCancel?: Function,
    klInfo: any,
    setSellStatus: Function
}
const Num = (props: modelProps) => {
    const [num, setNum] = useState(1)
    const { t } = useTranslation()
    const onChange = (e: any) => {
        setNum(state => {
            if (Number(e.target.value) <= 10) {
                return e.target.value
            }
            return state
        })
    }
    return (
        <>
            {/* <Modal
                modalRender={() => (
                    <div style={{ textAlign: 'center', pointerEvents: 'auto' }}>
                        <Bc
                            className="back-png"
                            style={{ margin: '0 auto' }} title={t('cpmh')} desc={
                                <>
                                    <p>
                                        {t('kqyc')};
                                    </p>
                                    <p>
                                        {t('kqsc')} <span style={{ color: 'red' }}>95000</span> {t('wmdb')}
                                    </p>
                                    <div style={{ textAlign: 'left' }}>
                                        <Input suffix={
                                            <div style={{
                                                fontSize: '14px',
                                                fontWeight: 500,
                                                borderLeft: '1px solid #999',
                                                paddingLeft: '5px',
                                                cursor: 'pointer',
                                            }} onClick={setNum.bind(null, 10)}>max</div>
                                        } placeholder={t("gmcp")} min={1} value={num} onChange={onChange} type="number"></Input>
                                        <div style={{ marginTop: '10px' }}>{t('sxje')}: {num === 10 ? '95000' : num * props.klInfo.fee} gToken</div>
                                    </div>
                                    <div className="card-but" onClick={() => !props.loading && props.handleOk(num)}>
                                        <Spin spinning={props.loading}>
                                            {t('gm')}
                                        </Spin>
                                    </div>
                                </>
                            }>
                            <div className="bc-head">
                                <img src={cpPng} alt="" className="bc-yd transtion-transform3d" style={{ marginTop: '0', top: 0 }} />
                            </div>
                        </Bc>
                    </div>
                )} bodyStyle={{ borderRadius: '15px', maxWidth: '300px' }} centered closable={false} visible={props.isModalVisible} onOk={props.handleOk} onCancel={() => props.setIsModalVisible(false)}>
            </Modal> */}
        </>
    )
}

const Ms = () => {
    const { t } = useTranslation()
    const contract = useContext(Mycontext)
    const [isAuth, changeAuth] = useState(false)
    const [dinosaurAuthLoading, setDinosaurAuthLoading] = useState(false)
    const [lotteryAuthLoading, setLotteryAuthLoading] = useState(false)
    /**控制恐龙盲盒打开 */
    const [isModalVisible, setIsModalVisible] = useState(false)
    /**控制彩票盲盒输入数量 */
    const [isLotteryModalState, setILMS] = useState(false)
    /**控制彩票图片的显示 */
    const [cpStatus, setCpStatus] = useState(false)
    const [cpLoading, setCpLoading] = useState(false)
    const [sellStatus, setSellStatus] = useState(false)
    /**彩票图片 */
    const cpPngArrList = useRef<any[]>([])
    const ILMSCallback = (num: number) => {
        console.log(num, contract)
        if (num > 0 && contract.openLottery) {
            setCpLoading(true)
            contract.openLottery(num).then((res: any) => {
                cpPngArrList.current = []
                if (!Array.isArray(res.events.OpenLottery)) {
                    res.events.OpenLottery = [res.events.OpenLottery]
                }
                res.events.OpenLottery.forEach((item: any) => {
                    const reward = item.returnValues.reward / 1e18
                    cpPngArrList.current.push(require(`../../utils/img/nov/cp_${reward}.png`))
                })
                setCpStatus(true)
            }).finally(() => {
                setCpLoading(false)
                setILMS(false)
            })
        }
    }
    //恐龙盲盒信息
    const [klInfo, setKlinfo] = useState({
        fee: 0,
        left: 0,
        mhprice: 0
    })
    // 账户余额
    const [balaceof, setbalanceof] = useState('0.0000')

    // 获取购买数量
    const [buyNums, dispatch] = useReducer((state: any, e: any) => {
        let amount = e.target.value * klInfo.left > Number(balaceof)
        if (amount) {
            return state
        }
        return e.target.value
    }, '1')
    // 设置确认弹窗开启
    const [cfStatus, setIs] = useState(false)

    // 授权方法
    const auth = (type: string) => {

        if (!isAuth && contract.approve) {
            setDinosaurAuthLoading(true)
            setLotteryAuthLoading(true)
            contract.approve().then((res: any) => {
                contract.allowance().then((res: any) => {
                    changeAuth(!!Number(res))
                    setDinosaurAuthLoading(false)
                    setLotteryAuthLoading(false)
                })
            })
        } else if (isAuth && type === 'dinosaur' && contract.multMint) {
            // contract.accountInfo && contract.accountInfo().then((res: any) => {
            //     if (!Number(res.inviter)) {
            //         notification.warn({
            //             message: t("qndfk"),
            //             duration: 1.5
            //         })
            //         return
            //     }
            //     // 购买恐龙盲盒
            //     setIs(true)
            //     setDinosaurAuthLoading(false)
            // })

            // 购买恐龙盲盒
            setIs(true)
            setDinosaurAuthLoading(false)
        } else if (isAuth && type === 'lottery' && contract.openLottery) {
            contract.accountInfo && contract.accountInfo().then((res: any) => {
                if (!Number(res.inviter)) {
                    notification.warn({
                        message: t('qndfk'),
                        duration: 1.5
                    })
                    return
                }
                // 打开彩票盲盒
                setILMS(true)
            })
        }
    }
    // 恐龙盲盒确定
    const klhandleOk = () => {
        setDinosaurAuthLoading(true)
        contract.multMint(buyNums, 2).then((res: any) => {
            init()
            notification.success({
                message: t('gmcg'),
                duration: 1.5
            })
            setIsModalVisible(true)
        }).finally(() => {
            setIs(false)
            setDinosaurAuthLoading(false)
        })
    }
    const handleCancel = () => {
        setIs(false)
    }
    const init = () => {
        // 获取恐龙盲盒的信息
        contract.getSupplyInfo && contract.getSupplyInfo(2).then((res: any) => {
            console.log(res, '----------')
            setKlinfo((state: any) => {
                state.fee = Number(res.fee / 1e18).toFixed(4)
                state.left = res.left
                return { ...state }
            })
        })
    }
    useEffect(() => {
        //判断是否授权
        setDinosaurAuthLoading(true)
        setLotteryAuthLoading(true)
        contract.allowance && contract.allowance().then((res: any) => {
            console.log('contract.allowance', res)
            changeAuth(!!Number(res))
        }).finally(() => {
            setDinosaurAuthLoading(false)
            setLotteryAuthLoading(false)
        })
        init()
        // 获取账户余额
        contract.balanceOf && contract.balanceOf().then((res: any) => {
            setbalanceof((Number(res) / 1e18).toFixed(4))
        })
    }, [contract])
    const btnStyle = window.innerWidth < 600 ? { width: '100%' } : { width: '150%' }
    const { TabPane } = Tabs;

    function callback() {
        // console.log(key);
    }

    const transferClick = () => {
        setIsModalVisible(true)
    }

    const sellClick = () => {
        setSellStatus(true)
    }

    return (
        <div>
            <Row justify="space-between" className="flex-justify-center">
                <div className="tag-name">Available</div>
                <div className="tag-name">On Marketplace</div>
            </Row>
            <div className="tabs">
                <Tabs defaultActiveKey="1" onChange={callback} style={{ marginTop: '40px' }}>
                    <TabPane tab="英雄" key="1">
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
                            height={document.getElementsByTagName("body")[0].offsetHeight - 380}
                            next={callback}
                            hasMore={false}
                            loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
                            endMessage={<Divider plain></Divider>}
                            dataLength={10}
                        >
                            <Row justify="space-between" style={{ margin: "10px 50px", justifyContent: "space-between" }} className="row-box">
                                <div className="item">
                                    <img src={require("../../utils/img/hero-6.png").default} alt="" className="hero-item" />
                                    <br />
                                    <Button className="hero-item-btn" onClick={transferClick}>转让</Button>
                                    <Button className="hero-item-btn" onClick={sellClick}>出售</Button>
                                </div>
                                <div className="item">
                                    <img src={require("../../utils/img/hero-6.png").default} alt="" className="hero-item" />
                                    <br />
                                    <Button className="hero-item-btn" onClick={transferClick}>转让</Button>
                                    <Button className="hero-item-btn" onClick={sellClick}>出售</Button>
                                </div>
                                <div className="item">
                                    <img src={require("../../utils/img/hero-6.png").default} alt="" className="hero-item" />
                                    <br />
                                    <Button className="hero-item-btn" onClick={transferClick}>转让</Button>
                                    <Button className="hero-item-btn" onClick={sellClick}>出售</Button>
                                </div>
                                <div className="item">
                                    <img src={require("../../utils/img/hero-5.png").default} alt="" className="hero-item" />
                                    <br />
                                    <Button className="hero-item-btn" onClick={transferClick}>转让</Button>
                                    <Button className="hero-item-btn" onClick={sellClick}>出售</Button>
                                </div>
                                <div className="item">
                                    <img src={require("../../utils/img/hero-5.png").default} alt="" className="hero-item" />
                                    <br />
                                    <Button className="hero-item-btn" onClick={transferClick}>转让</Button>
                                    <Button className="hero-item-btn" onClick={sellClick}>出售</Button>
                                </div>
                                <div className="item">
                                    <img src={require("../../utils/img/hero-4.png").default} alt="" className="hero-item" />
                                    <br />
                                    <Button className="hero-item-btn" onClick={transferClick}>转让</Button>
                                    <Button className="hero-item-btn" onClick={sellClick}>出售</Button>
                                </div>
                                <div className="item">
                                    <img src={require("../../utils/img/hero-4.png").default} alt="" className="hero-item" />
                                    <br />
                                    <Button className="hero-item-btn" onClick={transferClick}>转让</Button>
                                    <Button className="hero-item-btn" onClick={sellClick}>出售</Button>
                                </div>
                                <div className="item">
                                    <img src={require("../../utils/img/hero-3.png").default} alt="" className="hero-item" />
                                    <br />
                                    <Button className="hero-item-btn" onClick={transferClick}>转让</Button>
                                    <Button className="hero-item-btn" onClick={sellClick}>出售</Button>
                                </div>
                                <div className="item">
                                    <img src={require("../../utils/img/hero-2.png").default} alt="" className="hero-item" />
                                    <br />
                                    <Button className="hero-item-btn" onClick={transferClick}>转让</Button>
                                    <Button className="hero-item-btn" onClick={sellClick}>出售</Button>
                                </div>
                                <div className="item">
                                    <img src={require("../../utils/img/hero-1.png").default} alt="" className="hero-item" />
                                    <br />
                                    <Button className="hero-item-btn" onClick={transferClick}>转让</Button>
                                    <Button className="hero-item-btn" onClick={sellClick}>出售</Button>
                                </div>
                            </Row>
                            <Pagination defaultCurrent={1} total={50} showSizeChanger={false} size="small" style={{ marginTop: "30px" }} className="page" />
                        </InfiniteScroll>
                    </TabPane>
                    <TabPane tab="装备" key="2">
                    </TabPane>
                </Tabs>
            </div>
            <Egg isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible}></Egg>
            <Sell isModalVisible={sellStatus} setSellStatus={setSellStatus}></Sell>
            {/* <Num klInfo={klInfo} isModalVisible={isLotteryModalState} setIsModalVisible={setILMS} loading={cpLoading} handleOk={ILMSCallback} />
            <CP isModalVisible={cpStatus} setIsModalVisible={setCpStatus} pngList={cpPngArrList.current}></CP>
            <CfModel isModalVisible={cfStatus} handleCancel={handleCancel} handleOk={klhandleOk} modalRender={() => (
                <div style={{ padding: '15px', borderRadius: '15px', pointerEvents: 'auto', width: '100%' }} className="back-png">
                    <div style={{ marginBottom: '15px', borderRadius: '15px' }}>{t('gmsl')}：</div>
                    <Input value={buyNums} placeholder={t('gmsls')} type="number" min={1} onChange={(e: any) => dispatch(e)} style={{ marginBottom: '15px', pointerEvents: 'auto' }}></Input>
                    <div>{t('sxje')}: {buyNums * klInfo.fee} gToken</div>
                    <div style={{ textAlign: 'center' }}>
                        <div className="card-but" style={{}} onClick={klhandleOk} >
                            <Spin spinning={dinosaurAuthLoading}>
                                {t('gm')}
                            </Spin>
                        </div>
                    </div>
                </div>
            )
            }>
            </CfModel > */}
        </div >
    )
}
export default Ms