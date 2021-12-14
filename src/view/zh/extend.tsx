import { useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import '../css/home.css'
import '../components/model/model.css'
import { Mycontext } from '../../utils/useApp'
import { relative } from 'path'
import { useTranslation } from 'react-i18next'
import { Button, Col, Row, Modal, Input, Form, notification, Spin, Tabs, Radio, Skeleton, Divider, Pagination, Slider, InputNumber } from 'antd'
import reportWebVitals from '../../reportWebVitals';
import React from 'react'
import InfiniteScroll from 'react-infinite-scroll-component';
import { nextTick } from 'process'
/**
 * 
 * @returns 购买彩票的数量弹窗
 */
type modelProps = {
    setIsModalVisible: Function,
    isModalVisible: boolean,
}

const Ms = () => {
    const { t, i18n } = useTranslation()
    const l = i18n.language
    const contract = useContext(Mycontext)
    const [url, setUrl] = useState<any>(null)
    const [dgeReward, setDr] = useState('0.0000')
    const [mans, setMens] = useState<number[]>([0, 0])
    /**购买盲盒数量 */
    const [buyNum,setNum]=useState(1)
    const [boxInfo, setBoxInfo] = useState({
        fee: 0,
        num: '100'
    })
    const ref = useRef(null)
    const getNext = (address: string, index: number) => {
        contract.getAccountInfo && contract.getAccountInfo(address).then((res: any) => {
            if (res.invitees.length && index < 2) {
                (res.invitees as any).forEach((i: string) => {
                    getNext(i, 1)
                })
            }
            setMens((state) => {
                if (index === 1) {
                    state[index] += res.invitees.length
                } else {
                    state[index] = res.invitees.length
                }
                return [...state]
            })
        })
    }
    useEffect(() => {
        if (contract.accountInfo) {
            getNext(contract.defaultAccount, 0)
            contract.accountInfo().then((res: any) => {
                console.log('accountInfo', res)
                setDr(Number(res.dgeReward / 1e18).toFixed(4))
                let url = window.location.origin + '/id=' + contract.defaultAccount
                setUrl(url)
            }).catch((err: any) => {
            })
            /**获取盲盒价格 */
            contract.getSupplyInfo(1).then((res: any) => {
                console.log('盲盒信息',res)
                setBoxInfo((state: any) => {
                    state.fee = Number(res.fee / 1e18).toFixed(4)
                    state.num = res.left
                    return { ...state }
                })
            })
        }
        
    }, [contract])
    const copy = () => {
        if (url !== '') {
            contract.copyAddress && contract.copyAddress(url)
        }
    }
    const { TabPane } = Tabs;

    function callback() {
        // console.log(key);
    }

    // 购买
    const buyClick = async (value?) => {
        /**授权 */
        let bool = await contract.allowance()
        try {
            if (!Number(bool)) {
                await contract.approve()
            }
            contract.multMint(value).then((res: any) => {
                console.log(res)
            })
        } catch (err) {
            console.log(err)
        }
    }
    
    class IntegerStep extends React.Component {
        state = {
            inputValue: 1,
        };

        onChange = value => {
            if (Number(value.nativeEvent.path[0].value) <= 100) {
                this.setState({
                    inputValue: Number(value.nativeEvent.path[0].value),
                });
            } else if (Number(value.nativeEvent.path[0].value) < 0) {
                this.setState({
                    inputValue: 0,
                });
            } else {
                this.setState({
                    inputValue: 100,
                });
            }
        };
        componentDidUpdate(prevProps: Readonly<{}>, prevState: Readonly<{}>, snapshot?: any): void {
            console.log(this.state)
            setNum(this.state.inputValue)
        }

        onChange2 = value => {
            this.setState({
                inputValue: value,
            });
        };

        toBuy = () => {
            buyClick(this.state.inputValue)
        }

        render() {
            const { inputValue } = this.state;
            return (
                <div>
                    <div>
                        <Slider
                            min={1}
                            max={100}
                            onChange={this.onChange2}
                            value={typeof inputValue === 'number' ? inputValue : 0}
                        />
                    </div>
                    <div className="sub-theme" style={{ marginTop: "40px" }}>Amount<span style={{ marginLeft: "200px", fontSize: "15px", color: "#caccce" }} className="available">Available: {inputValue * boxInfo.fee} MILIT</span></div>
                    <div style={{ textAlign: 'left' }}>
                        <img src={require("../../utils/img/add.png").default} alt="" style={{ width: "45px", marginTop: "-5px" }} />
                        <Input
                            bordered
                            style={{ margin: "20px 16px", width: "140px", height: "45px", borderRadius: "40px", border: "4px", borderColor: "#ffc56c", backgroundColor: "#8a5127", textAlign: "center", fontSize: "15px", fontWeight: "700", color: "#ffe386" }}
                            value={inputValue}
                            onChange={this.onChange}
                        />
                        <img src={require("../../utils/img/subtract.png").default} alt="" style={{ width: "45px", marginTop: "-5px" }} />
                        <img src={require("../../utils/img/buy-btn.png").default} style={{ height: "48px", width: "150px", marginTop: "-5px", marginLeft: "100px", cursor: "pointer" }} onClick={this.toBuy} className="buy-btn"></img>
                    </div>
                </div>
            );
        }
    }


    return (
        <div>
            <div className="tabs-trading">
                <Tabs defaultActiveKey="1" onChange={callback} style={{ marginTop: '80px' }}>
                    <TabPane tab="Milit box" key="1">
                        <InfiniteScroll
                            height={document.getElementsByTagName("body")[0].offsetHeight - 250}
                            next={callback}
                            hasMore={false}
                            loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
                            endMessage={<Divider plain></Divider>}
                            dataLength={10}
                        >
                            <Row justify="space-between" style={{ margin: "40px 20px", justifyContent: "flex-start" }}>
                                <img src={require("../../utils/img/milit.png").default} alt="" className="milit-img" />
                                <div style={{ marginLeft: "150px" }} className="right-box">
                                    <Row>
                                        <div className="theme">Mlind Box</div>
                                        <img src={require("../../utils/img/on-sale.png").default} alt="" className="on-sale-img" />
                                    </Row>
                                    <div className="sub-theme mobile">Countdown</div>
                                    <Row style={{ fontSize: "18px", color: "#ffe386", fontWeight: "700", marginTop: "15px" }} className="mobile">
                                        <div className="count-item">0</div>
                                        <div className="count-item">0</div>
                                        <div style={{ marginRight: "6px", color: "#fff", marginTop: "8px" }}>D</div>
                                        <div className="count-item">0</div>
                                        <div className="count-item">0</div>
                                        <div style={{ marginRight: "6px", color: "#fff", marginTop: "8px" }}> : </div>
                                        <div className="count-item">0</div>
                                        <div className="count-item">0</div>
                                        <div style={{ marginRight: "6px", color: "#fff", marginTop: "8px" }}> : </div>
                                        <div className="count-item">0</div>
                                        <div className="count-item">0</div>
                                    </Row>
                                    <div className="describe">
                                        <h2>Each mysterious treasure chest contains a random NFT</h2>
                                        <h2>character. You can use these NFTs to play Heroes Milit RPG.</h2>
                                    </div>
                                    <div>
                                        <table className="table-content">
                                            <thead></thead>
                                            <tbody>
                                                <tr>
                                                    <td>Common</td>
                                                    <td>63.75%</td>
                                                </tr>
                                                <tr>
                                                    <td>Rare</td>
                                                    <td>30.625%</td>
                                                </tr>
                                                <tr>
                                                    <td>Epic</td>
                                                    <td>3.75%</td>
                                                </tr>
                                                <tr>
                                                    <td>Legendary</td>
                                                    <td>1.25%</td>
                                                </tr>
                                                <tr>
                                                    <td>Myth</td>
                                                    <td>0.625%</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="sub-theme">Boxes sold</div>
                                    <div>
                                        {
                                            useMemo(()=><IntegerStep ref={ref} />,[boxInfo])
                                        }
                                    </div>
                                    <div className="sub-theme PC">Countdown</div>
                                    <Row style={{ fontSize: "18px", color: "#ffe386", fontWeight: "700", marginTop: "15px" }} className="PC">
                                        <div className="count-item">0</div>
                                        <div className="count-item">0</div>
                                        <div style={{ marginRight: "6px", color: "#fff", marginTop: "8px" }}>D</div>
                                        <div className="count-item">0</div>
                                        <div className="count-item">0</div>
                                        <div style={{ marginRight: "6px", color: "#fff", marginTop: "8px" }}> : </div>
                                        <div className="count-item">0</div>
                                        <div className="count-item">0</div>
                                        <div style={{ marginRight: "6px", color: "#fff", marginTop: "8px" }}> : </div>
                                        <div className="count-item">0</div>
                                        <div className="count-item">0</div>
                                    </Row>
                                </div>
                            </Row>
                        </InfiniteScroll>
                        <div className="footed">
                            <Row>
                                <div>
                                    <img src={require("../../utils/img/ka.png").default} alt="" style={{ width: "100px", marginTop: "-40px", zIndex: "9999" }} />
                                    <span>x {buyNum}</span>
                                </div>
                                <img src={require("../../utils/img/buy-btn.png").default} style={{ height: "35px", width: "100px", cursor: "pointer", marginTop: "10px" }} onClick={ref.current?.toBuy} className="buy-btn-mobile"></img>
                            </Row>
                        </div>
                    </TabPane>
                </Tabs>
            </div>
        </div >
    )
}
export default Ms