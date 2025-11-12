import React from 'react'

// 商户注册数据接口
interface MerchantData {
  name: string
  email: string
}

// 组件 Props 接口
interface MerchantRegistrationProps {
  data: MerchantData
  onChange: (data: MerchantData) => void
}

// 商户注册
export const MerchantRegistration = ({ data, onChange }: MerchantRegistrationProps) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">商户名称 *</label>
        <input type="text" value={data.name} onChange={(e) => onChange({ ...data, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="输入商户名称" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">联系邮箱 *</label>
        <input type="email" value={data.email} onChange={(e) => onChange({ ...data, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="contact@merchant.com" />
      </div>
    </div>
  </div>
);