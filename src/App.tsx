import { HashRouter, Route, Switch } from 'react-router-dom'
import './view/css/App.css'
// import i18n from './utils/locale/i18n'
import Head from './view/components/head'
import CtoLeft from './view/components/left'
import { useEffect, useRef, useState } from 'react'
import { Mycontext } from './utils/useApp'
import api from './utils/app'
import { useTranslation } from 'react-i18next'
import React from 'react'
const App = () => {
  const ref = useRef({})
  const { t, i18n } = useTranslation()
  const l = i18n.language
  const app = api()
  const png = window.innerWidth < 600 ? require('./utils/img/bg.png').default : require('./utils/img/bgver.png').default
  return (
    <div className="main-index">
      <Mycontext.Provider value={app}>
        <div className="main-bg"></div>
        <img src={png} alt="" className="main-bg-2"></img>
        <div className="home">
          <Head cref={ref} ></Head>
          <div className="flex-1">
            <HashRouter>
              <CtoLeft cref={ref} style={{ width: '30%' }} />
              <div className="tab-right">
                {
                  l === 'en' ? (
                    <Switch>
                      <Route exact path="/" component={require('./view/magicSchool').default} />
                      <Route exact path="/cp" component={require('./view/cpBoild').default} />
                      <Route exact path="/mt" component={require('./view/mgTag').default} />
                      <Route exact path="/tm" component={require('./view/zh/tradingMarket').default} />
                      <Route exact path='/fh' component={require('./view/zh/landPool').default} />
                      <Route exact path='/tg' component={require('./view/zh/extend').default} />
                      <Route exact path='/vw' component={require('./view/zh/viewer').default} />
                    </Switch>
                  ) : (
                    <Switch>
                      <Route exact path="/" component={require('./view/zh/magicSchool').default} />
                      <Route exact path="/cp" component={require('./view/zh/cpBoild').default} />
                      <Route exact path="/mt" component={require('./view/zh/mgTag').default} />
                      <Route exact path="/tm" component={require('./view/zh/tradingMarket').default} />
                      <Route exact path='/fh' component={require('./view/zh/landPool').default} />
                      <Route exact path='/tg' component={require('./view/zh/extend').default} />
                      <Route exact path='/vw' component={require('./view/zh/viewer').default} />
                    </Switch>
                  )
                }

              </div>
            </HashRouter>
          </div>
        </div>
      </Mycontext.Provider>
    </div>
  )
}
export default App