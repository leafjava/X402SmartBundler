'use client';
import { useEffect,useState } from 'react';
import Link from 'next/link';
import ConnectWallet from '../../components/ConnectWallet';
import Poster from '../../components/ui/poster/poster';
import Spline from '@splinetool/react-spline/next';
// import PartnersSection from '../components/PartnersSection';
import LogoMarquee from '../../components/logoMarquee';
import React from 'react'
import {
  Store, Bot, User, ChevronLeft, ChevronRight, CreditCard, Wallet, CheckCircle, Clock, XCircle, Copy, Download,
  Key, ShoppingCart, AlertCircle, Shield, Lock, Zap, RotateCcw, MessageCircle, MessageSquare, Send,
  User as UserIcon, Bot as BotIcon, Sparkles, Crown, Gift, TrendingUp, ArrowRight, Eye, EyeOff, Download as DownloadIcon
} from 'lucide-react';
import { PopupAssistant } from '@/components/popup-assistant'
import { FloatingButton } from '@/components/floating-button'

// 禁用静态优化，因为此页面包含动态内容和 3D 场景
export const dynamic = 'force-dynamic';

export default function main() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const openWindow = () => {
    setIsPopupOpen(true)
  }

  const closePopup = () => {
    setIsPopupOpen(false)
  }

  // 检查是否从交易页面回退
  useEffect(() => {
    const leftTrading = sessionStorage.getItem('tradingPageLeft');

    if (leftTrading === 'true') {
      console.log('Detected back from trading page, refreshing...');
      sessionStorage.removeItem('tradingPageLeft');
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  }, []);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* 背景动画效果 */}
      {/* <Poster /> */}
      <Spline
        style={{position:'absolute',transform:'scale(2)'}}
        scene="/scene.splinecode" 
      />

      {/* 10月20日上午添加的酷炫特效 */}
      {/* <Spline
        style={{position:'absolute',transform:''}}
        scene="/scene2.splinecode" 
      /> */}
      
      {/* 动态背景粒子 */}
      {/* <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-purple-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
        <div className="absolute top-60 right-40 w-1 h-1 bg-pink-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-60 right-10 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
      </div> */}

      <div className="relative z-10 mx-auto px-4 py-8">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-3">
            {/* <img 
              src="/support/cina-logo-white.svg" 
              alt="PayMind Logo" 
              className="w-10 h-10 object-contain"
            /> */}
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">PM</div>
            <div className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              PayMind
            </div>
          </div>
          <ConnectWallet />
        </div>
        
        {/* 主要内容区域 */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-400 via-white-500 to-pink-500 bg-clip-text text-transparent leading-tight drop-shadow-lg">
            PayMind
          </h1>
          <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
            通过交互式演示深入了解商户、AI Agent和用户在支付流程中的完整体验
          </p>
        </div>

        {/* 主要功能区域 - 左右布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20" style={{display:"flex",justifyContent:"space-around"}}>
          {/* 合约交易卡片 - 左侧 */}
          <Link href="/trading" className="group">
            <div  className="bg-gradient-to-br from-slate-800/40 to-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8 hover:from-slate-700/50 hover:to-slate-800/70 hover:border-slate-600/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-slate-500/20 relative overflow-hidden h-full">
              {/* 微妙的发光效果 */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-amber-500/80 to-orange-500/80 rounded-2xl flex items-center justify-center mr-6 shadow-lg shadow-amber-500/20">
                    {/* <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg> */}
                    <Store size={48} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">商户视角</h3>
                    <p className="text-amber-400 text-sm font-medium">集成与订单管理流程</p>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-gray-300 mb-6 text-base leading-relaxed">
                    快速集成支付功能与订单管理，实时处理交易，优化您的支付体验。
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-400 text-sm">
                      <div className="w-2 h-2 bg-amber-400 rounded-full mr-3"></div>
                      多支付通道支持，覆盖法币和加密货币
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <div className="w-2 h-2 bg-amber-400 rounded-full mr-3"></div>
                      即时交易确认，确保交易透明高效
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <div className="w-2 h-2 bg-amber-400 rounded-full mr-3"></div>
                      低手续费，提升商户盈利空间
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-amber-400 group-hover:text-amber-300 transition-colors">
                    <span className="text-base font-medium">开始体验</span>
                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-amber-400">0.1%</div>
                    <div className="text-xs text-gray-400">手续费</div>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* 交易仓位卡片 - 右侧 */}
          <Link href="/positions" className="group">
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8 hover:from-slate-700/50 hover:to-slate-800/70 hover:border-slate-600/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-slate-500/20 relative overflow-hidden h-full">
              {/* 微妙的发光效果 */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-500/80 to-blue-500/80 rounded-2xl flex items-center justify-center mr-6 shadow-lg shadow-cyan-500/20">
                    {/* <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg> */}
                    <Bot size={48} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Agent视角</h3>
                    <p className="text-cyan-400 text-sm font-medium">对话式销售流程</p>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-gray-300 mb-6 text-base leading-relaxed">
                    通过对话直接触发支付和产品销售，实时监控您的销售表现与收入情况。
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-400 text-sm">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                      实时监控交易盈亏，调整策略优化销售
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                      快速查看和管理历史销售数据与订单状态
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                      内建风险控制工具，确保资金安全与收益最大化
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-cyan-400 group-hover:text-cyan-300 transition-colors">
                    <span className="text-base font-medium">开始体验</span>
                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-cyan-400">24/7</div>
                    <div className="text-xs text-gray-400">监控</div>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* 交易仓位卡片 - 右侧 */}
          <Link href="/positions" className="group">
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8 hover:from-slate-700/50 hover:to-slate-800/70 hover:border-slate-600/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-slate-500/20 relative overflow-hidden h-full">
              {/* 微妙的发光效果 */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-500/80 to-blue-500/80 rounded-2xl flex items-center justify-center mr-6 shadow-lg shadow-cyan-500/20">
                    {/* <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg> */}
                    <User size={48} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">用户视角</h3>
                    <p className="text-cyan-400 text-sm font-medium">支付体验流程</p>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-gray-300 mb-6 text-base leading-relaxed">
                    通过简化的支付流程，用户可以轻松完成支付，无需跳转，确保顺畅、高效的支付体验。
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-400 text-sm">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                      无缝支付体验，支持法币、加密货币等多种支付方式
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                      快速响应，支付完成后即刻收到确认与状态更新
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                      高安全性支付，采用加密技术保障用户资金安全
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-cyan-400 group-hover:text-cyan-300 transition-colors">
                    <span className="text-base font-medium">开始体验</span>
                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-cyan-400">24/7</div>
                    <div className="text-xs text-gray-400">监控</div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* 底部统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{position:"relative",top:"100px",width: "80%",left: "50%",transform: "translate(-50%)"}}>
          <div className="bg-gradient-to-r from-slate-800/30 to-slate-900/50 backdrop-blur-md border border-slate-700/40 rounded-xl p-6 text-center shadow-lg hover:shadow-slate-500/10 transition-all duration-300">
            <div className="text-3xl font-bold text-emerald-400 mb-2">100%</div>
            <div className="text-gray-300">交易成功率</div>
          </div>
          <div className="bg-gradient-to-r from-slate-800/30 to-slate-900/50 backdrop-blur-md border border-slate-700/40 rounded-xl p-6 text-center shadow-lg hover:shadow-slate-500/10 transition-all duration-300">
            <div className="text-3xl font-bold text-cyan-400 mb-2">24/7</div>
            <div className="text-gray-300">全天候服务</div>
          </div>
          <div className="bg-gradient-to-r from-slate-800/30 to-slate-900/50 backdrop-blur-md border border-slate-700/40 rounded-xl p-6 text-center shadow-lg hover:shadow-slate-500/10 transition-all duration-300">
            <div className="text-3xl font-bold text-violet-400 mb-2">0.1%</div>
            <div className="text-gray-300">交易手续费</div>
          </div>
        </div>
        

      </div>

      <div className='logoMarquee' style={{position: 'absolute',bottom: '60px',left: '53%',transform: 'translate(-50%)'}}>
        <LogoMarquee />
      </div>
      
      <FloatingButton onClick={openWindow} />
      <PopupAssistant isOpen={isPopupOpen} onClose={closePopup} />
    </div>
  );
}
