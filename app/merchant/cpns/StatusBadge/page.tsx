import {
  CheckCircle, Clock, XCircle, AlertCircle
} from 'lucide-react';
import React from 'react';

// 状态类型定义
type StatusType = 'success' | 'warning' | 'error' | 'info';

interface StatusBadgeProps {
  status: StatusType;
  children: React.ReactNode;
}

export const StatusBadge = ({ status, children }: StatusBadgeProps) => {
  const styles: Record<StatusType, string> = {
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200'
  };
  
  const icons: Record<StatusType, React.ReactElement> = {
    success: <CheckCircle className="w-4 h-4" />,
    warning: <AlertCircle className="w-4 h-4" />,
    error: <XCircle className="w-4 h-4" />,
    info: <Clock className="w-4 h-4" />
  };
  
  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full border text-sm ${styles[status]}`}>
      {icons[status]}
      <span className="ml-2">{children}</span>
    </div>
  );
};