
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CountdownTimerProps {
  initialSeconds: number;
  onComplete: () => void;
  onCancel: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ initialSeconds, onComplete, onCancel }) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setSeconds(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds, onComplete]);

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const remainingSeconds = time % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getColorClass = (): string => {
    if (seconds <= 10) return 'text-red-400';
    if (seconds <= 30) return 'text-orange-400';
    return 'text-yellow-400';
  };

  const getProgressPercentage = (): number => {
    return ((initialSeconds - seconds) / initialSeconds) * 100;
  };

  const getProgressColorClass = (): string => {
    if (seconds <= 10) return 'bg-gradient-to-r from-red-500 to-red-600';
    if (seconds <= 30) return 'bg-gradient-to-r from-orange-500 to-orange-600';
    return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
  };

  const getUrgencyLevel = (): string => {
    if (seconds <= 10) return 'CRITICAL';
    if (seconds <= 30) return 'HIGH';
    return 'MEDIUM';
  };

  return (
    <div className="space-y-6">
      {/* Emergency Header */}
      <div className="flex items-center justify-center space-x-3">
        <div className={`p-2 rounded-full ${seconds <= 10 ? 'bg-red-500/20 animate-pulse' : 'bg-orange-500/20'}`}>
          <AlertTriangle className={`h-6 w-6 ${seconds <= 10 ? 'text-red-400' : 'text-orange-400'}`} />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-white">Emergency Response Active</h3>
          <p className={`text-xs font-medium ${getColorClass()}`}>
            PRIORITY: {getUrgencyLevel()}
          </p>
        </div>
      </div>

      {/* Countdown Display */}
      <div className="text-center space-y-4">
        <div className={`text-7xl font-bold font-mono ${getColorClass()} countdown-number transition-all duration-300 ${
          seconds <= 10 ? 'animate-heartbeat' : 'animate-pulse-soft'
        }`}>
          {formatTime(seconds)}
        </div>
        
        <div className="flex items-center justify-center space-x-2 text-slate-300">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">Auto-dispatch in progress</span>
        </div>
      </div>
      
      {/* Enhanced Progress bar */}
      <div className="space-y-3">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Emergency Alert</span>
          <span>{Math.round(getProgressPercentage())}% Complete</span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-4 overflow-hidden border border-slate-600/50">
          <div 
            className={`h-4 rounded-full transition-all duration-1000 ${getProgressColorClass()} ${
              seconds <= 10 ? 'animate-neon-pulse' : ''
            }`}
            style={{ 
              width: `${getProgressPercentage()}%`,
              boxShadow: seconds <= 10 ? '0 0 20px currentColor' : '0 0 10px currentColor'
            }}
          />
        </div>
      </div>

      {/* Cancel Button */}
      <div className="flex justify-center">
        <Button
          onClick={onCancel}
          variant="outline"
          className="bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 hover:border-red-500/50 text-white hover:text-red-400 transition-all duration-300 px-8 py-3"
        >
          <X className="mr-2 h-5 w-5" />
          Cancel Emergency Alert
        </Button>
      </div>
      
      {/* Status messages */}
      <div className="space-y-3 text-center">
        <div className={`inline-flex items-center px-4 py-2 rounded-full border transition-all duration-300 ${
          seconds <= 10 ? 'bg-red-500/20 border-red-500/50 animate-shake' : 
          'bg-slate-700/50 border-slate-600/50'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            seconds <= 10 ? 'bg-red-400 animate-pulse' : 'bg-orange-400'
          }`}></div>
          <span className={`text-sm font-medium ${
            seconds <= 10 ? 'text-red-300' : 'text-slate-300'
          }`}>
            {seconds <= 10 ? '🚨 DISPATCHING EMERGENCY ALERT' : 'Preparing emergency notification'}
          </span>
        </div>
        
        <p className="text-slate-400 text-sm">
          Emergency services will be notified automatically in <span className="font-bold text-white">{seconds}</span> second{seconds !== 1 ? 's' : ''}
        </p>
        
        <p className="text-xs text-slate-500">
          Location services and emergency contacts will be included in the alert
        </p>
      </div>
    </div>
  );
};

export default CountdownTimer;
