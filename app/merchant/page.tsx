'use client';
import React, { useState } from 'react'
import { MerchantRegistration } from './cpns/MerchantRegistration/page';
import {
  Store, Bot, User, ChevronLeft, ChevronRight, CreditCard, Wallet, CheckCircle, Clock, XCircle, Copy, Download,
  Key, ShoppingCart, AlertCircle, Shield, Lock, Zap, RotateCcw, MessageCircle, MessageSquare, Send,
  User as UserIcon, Bot as BotIcon, Sparkles, Crown, Gift, TrendingUp, ArrowRight, Eye, EyeOff, Download as DownloadIcon
} from 'lucide-react';
import { StatusBadge } from './cpns/StatusBadge/page';
import { StepNavigator } from '@/components/StepNavigator';

export default function page(){
  const [step, setStep] = useState(0);
  const [merchantInfo, setMerchantInfo] = useState({ name: '', email: '' });
  const [apiKey, setApiKey] = useState('');
  const [orders, setOrders] = useState([]);
  const [webhookUrl, setWebhookUrl] = useState('');

  const merchantSteps = [
    { title: '商户注册', component: <MerchantRegistration data={merchantInfo} onChange={setMerchantInfo} /> },
    // { title: '获取API密钥', component: <ApiKeyIntegration apiKey={apiKey} onGenerate={() => setApiKey('sk_live_' + Math.random().toString(36).substr(2, 24))} /> },
    // { title: '创建订单', component: <CreateOrder onOrderCreate={(o) => setOrders(prev => [...prev, o])} /> },
    // { title: 'Webhook配置', component: <WebhookConfiguration webhookUrl={webhookUrl} onChange={setWebhookUrl} onTest={() => alert('测试发送！')} /> },
    // { title: '订单管理', component: <OrderManagement orders={orders} /> }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center space-x-3">
          <Store className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">商户视角：集成与订单流程</h2>
        </div>
        <StatusBadge status={step === 4 ? 'success' : 'info'}>{step === 4 ? '完成' : `步骤 ${step + 1}/5`}</StatusBadge>
      </div>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{merchantSteps[step].title}</h3>
        {merchantSteps[step].component}
        <StepNavigator step={step} total={5} onNext={() => setStep(s => Math.min(4, s + 1))} onPrev={() => setStep(s => Math.max(0, s - 1))} onRestart={() => { setStep(0); setMerchantInfo({ name: '', email: '' }); setApiKey(''); setOrders([]); }} />
      </div>
    </div>
  );
};