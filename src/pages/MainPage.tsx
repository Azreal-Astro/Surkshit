import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mic, Settings, MicOff, Shield } from 'lucide-react';
import MicrophoneIcon from '../components/MicrophoneIcon';
import CountdownTimer from '../components/CountdownTimer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type Status = 'initializing' | 'listening' | 'scream-detected' | 'permission-denied' | 'not-supported';

const MainPage: React.FC = () => {
  const [status, setStatus] = useState<Status>('initializing');
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Distress keywords to detect
  const distressKeywords = ['help', 'help me', 'save', 'save me', 'emergency', 'danger'];

  useEffect(() => {
    initializeSpeechRecognition();
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const initializeSpeechRecognition = async () => {
    console.log('Initializing speech recognition...');
    
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported');
      setStatus('not-supported');
      toast({
        title: "Browser Not Supported",
        description: "Your browser doesn't support speech recognition. Please use Chrome or Edge.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone permission granted');
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        console.log('Speech recognition started');
        if (!isCountdownActive) {
          setStatus('listening');
        }
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ')
          .toLowerCase();

        console.log('Transcript:', transcript);

        // Check for distress keywords
        const detectedKeyword = distressKeywords.find(keyword => 
          transcript.includes(keyword)
        );

        if (detectedKeyword && !isCountdownActive) {
          console.log('Distress keyword detected:', detectedKeyword);
          setStatus('scream-detected');
          setIsCountdownActive(true);
          toast({
            title: "Emergency Detected!",
            description: `Detected: "${detectedKeyword}". Starting countdown...`,
            variant: "destructive"
          });
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setStatus('permission-denied');
          toast({
            title: "Microphone Access Denied",
            description: "Please allow microphone access to use Surkshit emergency detection.",
            variant: "destructive"
          });
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended, restarting...');
        // Always restart recognition, even during countdown
        if (status !== 'permission-denied') {
          setTimeout(() => {
            if (recognitionRef.current) {
              recognitionRef.current.start();
            }
          }, 1000);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();

    } catch (error) {
      console.error('Error accessing microphone:', error);
      setStatus('permission-denied');
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to enable emergency detection.",
        variant: "destructive"
      });
    }
  };

  const handleCountdownComplete = async () => {
    console.log('Countdown completed, sending WhatsApp messages...');
    
    // Get emergency contacts and user info
    const emergencyContactsStr = localStorage.getItem('surkshit-emergency-contacts');
    const userName = localStorage.getItem('surkshit-user-name') || 'Someone';
    
    let emergencyContacts = [];
    try {
      emergencyContacts = emergencyContactsStr ? JSON.parse(emergencyContactsStr) : [];
    } catch (error) {
      console.error('Error parsing emergency contacts:', error);
    }
    
    if (emergencyContacts.length === 0) {
      toast({
        title: "No Emergency Contacts",
        description: "Please set up emergency contacts in settings first.",
        variant: "destructive"
      });
      navigate('/settings');
      return;
    }

    // Get location and send WhatsApp messages automatically
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 300000
        });
      });

      const message = generateEmergencyMessage(userName, position.coords.latitude, position.coords.longitude, position.coords.accuracy);
      
      // Send message to all contacts
      emergencyContacts.forEach((contact: any, index: number) => {
        setTimeout(() => {
          sendWhatsAppMessage(contact.phone, message, contact.name);
        }, index * 1000); // Delay each message by 1 second to avoid overwhelming
      });
      
    } catch (error) {
      console.error('Location error:', error);
      const message = generateEmergencyMessage(userName, null, null, null);
      
      // Send message to all contacts even without location
      emergencyContacts.forEach((contact: any, index: number) => {
        setTimeout(() => {
          sendWhatsAppMessage(contact.phone, message, contact.name);
        }, index * 1000);
      });
    }
    
    navigate('/help-sent');
  };

  const generateEmergencyMessage = (name: string, lat: number | null, lng: number | null, accuracy: number | null): string => {
    let message = `🚨 EMERGENCY ALERT 🚨\n\n`;
    message += `${name} needs immediate help!\n\n`;
    message += `This message was automatically sent by Surkshit Emergency Alert System.\n\n`;
    
    if (lat && lng) {
      message += `📍 Location: https://maps.google.com/maps?q=${lat},${lng}\n`;
      message += `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}\n`;
      if (accuracy) {
        message += `Accuracy: ±${Math.round(accuracy)}m\n`;
      }
    } else {
      message += `📍 Location: Unable to determine exact location\n`;
    }
    
    message += `\n⏰ Time: ${new Date().toLocaleString()}\n`;
    message += `\nPlease contact emergency services if needed: 911 (US), 112 (EU), 100 (India)`;
    
    return message;
  };

  const sendWhatsAppMessage = (phoneNumber: string, message: string, contactName?: string) => {
    const encodedMessage = encodeURIComponent(message);
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`;
    
    console.log(`Auto-opening WhatsApp for ${contactName || 'contact'} with URL:`, whatsappUrl);
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Emergency Message Sent!",
      description: `WhatsApp message sent to ${contactName || 'emergency contact'}.`,
    });
  };

  const handleRetryPermission = () => {
    setStatus('initializing');
    initializeSpeechRecognition();
  };

  const handleCancelAlert = () => {
    console.log('Emergency alert cancelled by user');
    setIsCountdownActive(false);
    setStatus('listening');
    
    toast({
      title: "Emergency Alert Cancelled",
      description: "The emergency alert has been cancelled. System is now monitoring again.",
    });
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'initializing':
        return 'Initializing Security System...';
      case 'listening':
        return isCountdownActive ? 'Emergency Protocol Activated' : 'System Active - Monitoring Audio';
      case 'scream-detected':
        return 'Emergency Signal Detected';
      case 'permission-denied':
        return 'Microphone Access Required';
      case 'not-supported':
        return 'Browser Compatibility Issue';
      default:
        return 'System Status Unknown';
    }
  };

  const getStatusDescription = () => {
    switch (status) {
      case 'initializing':
        return 'Setting up security protocols and initializing audio monitoring systems';
      case 'listening':
        return isCountdownActive ? 'Emergency response sequence initiated' : 'Continuously monitoring for emergency keywords';
      case 'scream-detected':
        return 'Emergency alert triggered - initiating response protocol';
      case 'permission-denied':
        return 'Audio monitoring requires microphone access to function properly';
      case 'not-supported':
        return 'Please use Chrome, Edge, or Safari for optimal compatibility';
      default:
        return 'Please refresh the page to restart the system';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>
      
      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600/20 rounded-xl border border-blue-500/30">
            <Shield className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Surkshit</h1>
            <p className="text-xs text-slate-400">Voice for Safety.</p>
          </div>
        </div>
        
        <Link to="/settings">
          <Button variant="outline" size="icon" className="bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 hover:border-slate-500 transition-all duration-300">
            <Settings className="h-5 w-5 text-slate-300" />
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-6">
        <div className="text-center space-y-8 max-w-lg w-full">
          
          {/* Status Section */}
          <div className="space-y-4 animate-fade-in">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-slate-800/50 border border-slate-600/50 backdrop-blur-sm">
              <div className={`w-2 h-2 rounded-full mr-3 ${
                status === 'listening' && !isCountdownActive ? 'bg-green-400 animate-pulse' :
                status === 'scream-detected' || isCountdownActive ? 'bg-red-400 animate-pulse' :
                status === 'initializing' ? 'bg-blue-400 animate-pulse' :
                'bg-gray-400'
              }`}></div>
              <span className="text-sm font-medium text-slate-300">
                {status === 'listening' && !isCountdownActive ? 'ACTIVE' :
                 status === 'scream-detected' || isCountdownActive ? 'EMERGENCY' :
                 status === 'initializing' ? 'INITIALIZING' :
                 'OFFLINE'}
              </span>
            </div>

            <h2 className={`text-3xl font-bold transition-all duration-500 ${
              status === 'scream-detected' || isCountdownActive ? 'text-red-400' : 
              status === 'listening' ? 'text-white' : 
              'text-slate-300'
            }`}>
              {getStatusMessage()}
            </h2>

            <p className="text-slate-400 text-lg leading-relaxed">
              {getStatusDescription()}
            </p>
          </div>

          {/* Microphone Icon */}
          <div className="flex justify-center animate-scale-in">
            <MicrophoneIcon 
              status={status} 
              isCountdownActive={isCountdownActive}
            />
          </div>

          {/* Countdown Timer */}
          {isCountdownActive && (
            <div className="animate-emergency-zoom bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-red-500/30">
              <CountdownTimer 
                initialSeconds={30}
                onComplete={handleCountdownComplete}
                onCancel={handleCancelAlert}
              />
            </div>
          )}

          {/* Permission denied message */}
          {status === 'permission-denied' && (
            <div className="space-y-6 bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/50">
              <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center">
                  <MicOff className="h-8 w-8 text-amber-400" />
                </div>
                <p className="text-slate-300 leading-relaxed">
                  To protect you, Surkshit needs access to your microphone to monitor for emergency situations in the background.
                </p>
              </div>
              <Button 
                onClick={handleRetryPermission}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105"
              >
                <Mic className="mr-2 h-5 w-5" />
                Enable Microphone Access
              </Button>
            </div>
          )}

          {/* Not supported message */}
          {status === 'not-supported' && (
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/50">
              <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                  <MicOff className="h-8 w-8 text-red-400" />
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Your browser doesn't support speech recognition. For the best experience, please use Chrome, Edge, or Safari.
                </p>
              </div>
            </div>
          )}

          {/* Listening instructions */}
          {status === 'listening' && !isCountdownActive && (
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30 space-y-4">
              <h3 className="text-lg font-semibold text-white">Emergency Keywords</h3>
              <p className="text-sm text-slate-400 mb-4">
                The system is actively listening for these emergency phrases:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {distressKeywords.map((keyword, index) => (
                  <div 
                    key={keyword}
                    className="px-3 py-2 bg-slate-700/50 rounded-lg border border-slate-600/50 text-center transition-all duration-300 hover:bg-slate-600/50"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <span className="text-sm font-medium text-slate-200">"{keyword}"</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center p-6">
        <p className="text-xs text-slate-500">
          Your safety is our priority. System operates 24/7 to ensure rapid emergency response.
        </p>
      </footer>
    </div>
  );
};

export default MainPage;
