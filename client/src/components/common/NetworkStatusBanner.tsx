import React, { useState, useEffect } from 'react';
import { WifiOff, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from './Toast';

export const NetworkStatusBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast('Network connection restored. You may now continue!');
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  if (!isOffline) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with Blur */}
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md transition-opacity" />

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all border border-slate-200">
          {/* Offline Illustration Icon */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mb-4 shadow-sm">
            <WifiOff className="h-7 w-7 animate-pulse" />
          </div>

          {/* Modal Header */}
          <h3 className="text-xl font-extrabold text-[#1E293B] tracking-tight">
            You Are Currently Offline
          </h3>

          {/* Modal Description */}
          <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
            Network connection lost. You may continue working when your network connection is back.
          </p>

          {/* Connection Reconnecting Status Indicator */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50/80 py-2.5 px-4 rounded-xl border border-amber-200/80">
            <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
            <span>Waiting for network connection to restore...</span>
          </div>

          <div className="mt-4">
            <button
              onClick={() => {
                if (navigator.onLine) {
                  setIsOffline(false);
                  toast('Network connection verified!');
                }
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Check Connection</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
