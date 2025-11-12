import {AlertCircle,Key} from 'lucide-react';

interface ApiKeyIntegrationProps{
  apiKey: string;
  onGenerate: () => void;
}

// API密钥集成
export const ApiKeyIntegration = ({ apiKey, onGenerate }:ApiKeyIntegrationProps) => (
  <div className="space-y-6">
    {!apiKey ? (
      <div className="text-center py-8">
        <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <button onClick={onGenerate} className="px-6 py-3 bg-blue-600 text-white rounded-lg">生成API密钥</button>
      </div>
    ) : (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center"><AlertCircle className="w-5 h-5 text-yellow-600 mr-3" /><span className="text-yellow-800">API密钥已生成</span></div>
        <input type="text" value={apiKey} readOnly className="w-full mt-4 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm" />
      </div>
    )}
  </div>
);