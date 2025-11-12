import {
  Store, Bot, User, ChevronLeft, ChevronRight, CreditCard, Wallet, CheckCircle, Clock, XCircle, Copy, Download,
  Key, ShoppingCart, AlertCircle, Shield, Lock, Zap, RotateCcw, MessageCircle, MessageSquare, Send,
  User as UserIcon, Bot as BotIcon, Sparkles, Crown, Gift, TrendingUp, ArrowRight, Eye, EyeOff, Download as DownloadIcon
} from 'lucide-react';

const StepNavigator = ({ step, total, onNext, onPrev, onRestart }) => (
  <div className="flex items-center justify-between mt-6">
    <div className="flex space-x-3">
      <button
        onClick={onPrev}
        disabled={step <= 0}
        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
      >
        <ChevronLeft className="w-4 h-4 mr-2" /> 上一步
      </button>
      {onRestart && (
        <button
          onClick={onRestart}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
        >
          <RotateCcw className="w-4 h-4 mr-2" /> 重新开始
        </button>
      )}
    </div>
    <div className="flex items-center space-x-2">
      <div className="text-sm text-gray-600">
        步骤 <span className="font-semibold">{step + 1}</span> / {total}
      </div>
      <div className="flex space-x-1">
        {Array.from({ length: total }).map((_, index) => (
          <div key={index} className={`w-2 h-2 rounded-full ${index === step ? 'bg-blue-600' : index < step ? 'bg-green-500' : 'bg-gray-300'}`} />
        ))}
      </div>
    </div>
    <button
      onClick={onNext}
      disabled={step >= total - 1}
      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50 hover:bg-blue-700"
    >
      {step === total - 1 ? '完成流程' : '下一步'} <ChevronRight className="w-4 h-4 ml-2" />
    </button>
  </div>
);