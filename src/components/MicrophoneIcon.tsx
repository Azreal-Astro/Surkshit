
import React from 'react';
import { Mic, MicOff, Shield } from 'lucide-react';

interface MicrophoneIconProps {
  status: 'initializing' | 'listening' | 'scream-detected' | 'permission-denied' | 'not-supported';
  isCountdownActive: boolean;
}

const MicrophoneIcon: React.FC<MicrophoneIconProps> = ({ status, isCountdownActive }) => {
  const getIconColor = () => {
    if (status === 'scream-detected' || isCountdownActive) return 'text-red-400';
    if (status === 'listening') return 'text-green-400';
    if (status === 'permission-denied' || status === 'not-supported') return 'text-slate-500';
    return 'text-blue-400';
  };

  const getAnimationClass = () => {
    if (status === 'scream-detected' || isCountdownActive) return 'animate-pulse-strong';
    if (status === 'listening') return 'animate-pulse-soft';
    if (status === 'initializing') return 'animate-spin-slow';
    return '';
  };

  const getBorderColor = () => {
    if (status === 'scream-detected' || isCountdownActive) return 'border-red-500/50';
    if (status === 'listening') return 'border-green-500/50';
    if (status === 'initializing') return 'border-blue-500/50';
    return 'border-slate-600/50';
  };

  const getBackgroundColor = () => {
    if (status === 'scream-detected' || isCountdownActive) return 'bg-red-500/10';
    if (status === 'listening') return 'bg-green-500/10';
    if (status === 'initializing') return 'bg-blue-500/10';
    return 'bg-slate-700/20';
  };

  const IconComponent = (status === 'permission-denied' || status === 'not-supported') ? MicOff : Mic;

  return (
    <div className={`relative ${getAnimationClass()}`}>
      {/* Outer glow rings */}
      <div className={`absolute inset-0 rounded-full ${
        status === 'scream-detected' || isCountdownActive 
          ? 'bg-red-500/20 animate-ping scale-110' 
          : status === 'listening' 
          ? 'bg-green-400/20 animate-pulse scale-105' 
          : ''
      }`} />
      
      <div className={`absolute inset-0 rounded-full ${
        status === 'scream-detected' || isCountdownActive 
          ? 'bg-red-500/10 animate-ping scale-125' 
          : status === 'listening' 
          ? 'bg-green-400/10 animate-pulse scale-110' 
          : ''
      }`} style={{ animationDelay: '0.5s' }} />
      
      {/* Main container */}
      <div className={`relative z-10 p-8 rounded-full border-2 transition-all duration-500 backdrop-blur-sm ${getBorderColor()} ${getBackgroundColor()}`}>
        {/* Inner accent ring */}
        <div className={`absolute inset-4 rounded-full border transition-all duration-300 ${
          status === 'listening' ? 'border-green-400/30' :
          status === 'scream-detected' || isCountdownActive ? 'border-red-400/30' :
          'border-slate-600/30'
        }`} />
        
        {/* Icon */}
        <IconComponent className={`h-16 w-16 ${getIconColor()} transition-all duration-300 relative z-10`} />
        
        {/* Status indicator dot */}
        <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center ${
          status === 'listening' ? 'bg-green-500' :
          status === 'scream-detected' || isCountdownActive ? 'bg-red-500 animate-pulse' :
          status === 'initializing' ? 'bg-blue-500 animate-pulse' :
          'bg-slate-600'
        }`}>
          {status === 'listening' && (
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
};

export default MicrophoneIcon;
