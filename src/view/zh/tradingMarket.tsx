import { Mycontext } from '../../utils/useApp'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import Tbtn, { childType } from '../components/tabsBtn'
import '../css/home.css'
import { Row, Col, Tooltip, Button, notification, Spin } from 'antd'
import Bc from '../components/model/blindCard'
import { Order } from '../../utils/contract'
import { LoadingOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />

const fightPercent = ['0%', '0%', '120%', '160%', '300%', '1000%', '2000%']
const Tm = () => {
    const { t } = useTranslation()

    /**获取合约对象 */
    const contract = useContext(Mycontext)
    /**刷新 */
    const [selector, setter] = useState(false)
    /**卡牌对象数组 */
    const [cards, setCards] = useState<any>([])
    // selected已选择的key
    const [selected, setSelected] = useState(0)

    /**购买 */
    const onBuy = async (item: any) => {
        if (contract.allowance) {
            item.loading = true
            setter(true)
            const res = await contract.allowance(Order.address)
            if (!Number(res)) {
                try {
                    notification.info({
                        message: t('sqhe') + '...',
                        duration: null,
                        key: 'auth'
                    })
                    await contract.approve(Order.address)
                    notification.close('auth')
                } catch (err) {
                    notification.close('auth')
                    item.loading = false
                    setter(false)
                    return
                }
            }
            if (contract.fillOrder) {
                contract.fillOrder(item.tokenId, item.price)
                    .then((res: any) => {
                        init()
                        notification.success({
                            message: t('gmcg'),
                            duration: 1.5
                        })
                    }).finally(() => {
                        item.loading = false
                        setter(false)
                    })
            }
        }
    }
    const init = () => {
        setCards([])
        contract.allMarketplace && contract.allMarketplace().then((res: any) => {
            const list = res
            if (Array.isArray(list)) {
                list.forEach((item: any, index: number) => {
                    setTimeout(async () => {
                        const _res = await contract.getTokenInfo(item)
                        if (selected === 0 || +_res.levelCode[0] === selected) {
                            const [price] = await contract.orderSale(item)
                            _res.price = price / 1e18
                            _res.tokenId = item
                            _res.loading = false
                            _res.fightPercent = fightPercent[+_res.levelCode[0]]
                            _res.png = require('../../utils/img/kl/kl_L' + _res.levelCode[0] + '.png')
                            const card: any = _res
                            console.log(card)
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
    }, [contract,selected])
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const lists: childType[] = [
        { name: t('qb'), click: setSelected.bind(null, 0) },
        { name: t('yx'), click: setSelected.bind(null, 1) },
        { name: t('ex'), click: setSelected.bind(null, 2) },
        { name: t('sx'), click: setSelected.bind(null, 3) },
        { name: t('six'), click: setSelected.bind(null, 4) },
        { name: t('wx'), click: setSelected.bind(null, 5) },
        { name: t('lx'), click: setSelected.bind(null, 6) },
    ]
    const width = window.innerWidth < 600 ? {
        margin: '10px 5px 0 5px'
    } : {
        width: '100px', margin: '10px 15px 0 0'
    }
    const autoWidth = window.innerWidth < 600 ? '15px' : '20px'
    return (
        <div>
            {
                useMemo(() => <Tbtn lists={lists} justify="start" btnStyle={width} childStyle={{ flexWrap: 'wrap' }}></Tbtn>, [lists])
            }
            <Row justify="space-between" className="flex-justify-center mobile-row">
                {
                    cards.map((item: any, key: number) => (
                        <Col key={key} className="col-width-30 mobile-col-lp" xs={12}>
                            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                                <img src={item.png.default} style={{ height: '100%', width: "100%" }} alt="" />
                                <div style={{
                                    position: 'absolute',
                                    bottom: '7%',
                                    left: '10px',
                                    right: '10px',
                                }}>
                                    <>
                                        <Tooltip title={"PVE" + t('jc')}>
                                            <div style={{ display: 'flex', justifyContent: "space-between", width: '80%', marginLeft: '10%' }}>
                                                <img src={require('../../utils/img/icon/fight.png').default}width={autoWidth} alt="" />
                                                <span>{item.fightPercent}</span>
                                            </div>
                                        </Tooltip>
                                        <Tooltip title={t('sytl')}>
                                            <div style={{ display: 'flex', justifyContent: "space-between", width: '80%', marginLeft: '10%' }}>
                                                <img src={require('../../utils/img/icon/heart.png').default}width={autoWidth} alt="" />
                                                <div style={{ position: 'relative' }}>
                                                    <span>{item.energy}/120</span>
                                                    {/* <img src={require('../utils/img/icon/add.png').default} width="15px" alt="" style={{position:'relative',right:'-10%'}}/> */}
                                                </div>
                                            </div>
                                        </Tooltip>
                                        <Tooltip title={t('csjgs')}>
                                            <div style={{ display: 'flex', justifyContent: "space-between", width: '80%', marginLeft: '10%' }}>
                                                <span>{t('csjgs')}</span>
                                                <span>{item.price} gToken</span>
                                            </div>
                                        </Tooltip>
                                        <div className="card-but" style={{ marginTop: '0' }} onClick={() => !item.loading && onBuy(item)} >
                                            <Spin spinning={item.loading}>
                                                {t('gm')}
                                            </Spin></div>
                                    </>
                                </div>
                            </div>
                        </Col>
                    ))
                }
            </Row >
        </div>
    )
}
export default Tm