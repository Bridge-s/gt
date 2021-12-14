import { useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import Bc from './components/model/blindCard'
import Tbtn, { childType } from './components/tabsBtn'
import './css/home.css'
import './components/model/model.css'
import headerpng from '../utils/img/icon/eggmh.png'
import cpPng from '../utils/img/icon/cp.png'
import { Button, Col, Row, Modal, Input, Form, notification, Spin, Tabs, Radio, Skeleton, Divider, Pagination } from 'antd'
import { Mycontext } from '../utils/useApp'
import Egg from './components/model/egg'
import Sell from './components/model/sell'
import CP from './components/model/cpPng'
import CfModel from './components/model/cfModel'
import { useTranslation } from 'react-i18next'
import InfiniteScroll from 'react-infinite-scroll-component';

const Ms = () => {
    const contract = useContext(Mycontext)
    const { t } = useTranslation()
    /**控制恐龙盲盒打开 */
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [sellStatus, setSellStatus] = useState(false)
    /**卡牌信息 */
    const [cards, setCards] = useState<any>([])
    /**卡牌状态：1:可用 2：出售中 */
    const [cardStatus, setCardStatus] = useState(1)
    /**设置分页数据 */
    const [pageList, setList] = useState([])
    /**分页 */
    let page = 1
    /**选中的卡牌 */
    let targetRow = {}
    const getData = (list: any[]) => {
        list.forEach(async (item: any, index: number) => {
            const _res = await contract.getTokenInfo(item.value)
            console.log(_res)
            if (item.isSell) {
                const [price] = await contract.orderSale(item.value)
                _res.price = price / 1e18
            }
            _res.tokenId = item.value
            _res.isSell = item.isSell
            _res.loading = false
            // const klPng = require('../utils/img/hero-' + _res.levelCode[0] + '.png')
            const klPng = require('../utils/img/hero-1' + '.png')

            _res.png = klPng
            setCards((cards: any) => {
                cards.push(_res)
                return [...cards]
            })
        })
    }

    const init = () => {
        setCards((cards: any) => {
            return []
        })
        contract.myInventory && contract.myInventory().then((res: any) => {
            let list: any[] = []
            res.available = res.available.map((item: any) => ({
                value: item,
                isSell: false
            }))
            res.marketplace = res.marketplace.map((item: any) => ({
                value: item,
                isSell: true
            }))

            if (cardStatus === 1) {
                // 可用
                list = res.available
            } else {
                setCards((cards: any) => {
                    return []
                })
                // 出售中
                list = res.marketplace
            }
            if (Array.isArray(list)) {
                setList(list)
                getData(pageList.slice((page - 1) * 9, 9 * page))
            }
        })
    }
    useEffect(() => {
        init()
    }, [contract])

    const { TabPane } = Tabs;

    // 移动端下一页
    function callback() {
        if (window.innerWidth < 600) {
            page++
            getData(pageList.slice((page - 1) * 9, 9 * page))
            console.log(page);
        }
    }

    const transferClick = (item) => {
        targetRow = item
        setIsModalVisible(true)
    }

    const sellClick = (item) => {
        targetRow = item
        setSellStatus(true)
    }
    /**切换卡牌状态 */
    const changeCardStatus = (value: number) => {
        setCardStatus(value)
        page = 1;
        init();
    }
    // pc-切换分页
    const changePage = (value: number) => {
        page = value
        setCards((cards: any) => [])
        getData(pageList.slice((page - 1) * 9, 9 * page))
    }

    return (
        <div>
            <Row justify="space-between" className="flex-justify-center">
                <div className="tag-name" onClick={changeCardStatus.bind(null, 1)} style={{ 'color': cardStatus === 1 ? '#fcee94' : '' }}>Available</div>
                <div className="tag-name" onClick={changeCardStatus.bind(null, 2)} style={{ 'color': cardStatus === 2 ? '#fcee94' : '' }}>On Marketplace</div>
            </Row>
            <div className="tabs">
                <Tabs defaultActiveKey="1" onChange={callback} style={{ marginTop: '40px' }}>
                    <TabPane tab="Heros" key="1">
                        <Row justify="space-between" style={{ margin: "40px 20px", justifyContent: "flex-start" }} className="radioGroup">
                            <Radio.Group defaultValue="a" buttonStyle="solid">
                                <Radio.Button value="a" className="all-btn">ALL</Radio.Button>
                                <Radio.Button value="b" className="all-btn">WEREWOLF</Radio.Button>
                                <Radio.Button value="c" className="all-btn">PANDA</Radio.Button>
                                <Radio.Button value="d" className="all-btn">ARCHER</Radio.Button>
                                <Radio.Button value="e" className="all-btn">WARRIOR</Radio.Button>
                                <Radio.Button value="f" className="all-btn">WIZARD</Radio.Button>
                                <Radio.Button value="g" className="all-btn">BERSERK</Radio.Button>
                            </Radio.Group>
                        </Row>
                        <InfiniteScroll
                            height={document.getElementsByTagName("body")[0].offsetHeight - 380}
                            next={callback}
                            hasMore={true}
                            loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
                            endMessage={<Divider plain></Divider>}
                            dataLength={pageList.length}
                        >
                            <Row justify="space-between" style={{ margin: "10px 50px", justifyContent: "space-between" }} className="row-box">
                                {
                                    cards.map(item => (
                                        <div className="item">
                                            <img src={item.png.default} alt="" className="hero-item" />
                                            <br />
                                            <Button className="hero-item-btn" onClick={transferClick.bind(null, item)}>Transfer</Button>
                                            <Button className="hero-item-btn" onClick={sellClick.bind(null, item)}>Sell</Button>
                                        </div>
                                    ))
                                }

                            </Row>
                            <Pagination onChange={changePage} defaultCurrent={1} total={pageList.length} showSizeChanger={false} size="small" style={{ marginTop: "30px" }} className="page" />
                        </InfiniteScroll>
                    </TabPane>
                    <TabPane tab="Equipments" key="2">

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