
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, MessageCircle, MapPin, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

const HelpSentPage: React.FC = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [emergencyContact, setEmergencyContact] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    // Load emergency contact from localStorage
    const savedContact = localStorage.getItem('surkshit-emergency-contact');
    const savedName = localStorage.getItem('surkshit-user-name');
    
    if (savedContact) setEmergencyContact(savedContact);
    if (savedName) setUserName(savedName);

    // Get user's current location
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Location obtained:', position.coords);
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        console.error('Location error:', error);
        let errorMessage = 'Unable to retrieve your location.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        
        setLocationError(errorMessage);
        toast({
          title: "Location Access",
          description: errorMessage,
          variant: "destructive"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const generateEmergencyMessage = (): string => {
    const name = userName || 'Someone';
    let message = `🚨 EMERGENCY ALERT 🚨\n\n`;
    message += `${name} needs immediate help!\n\n`;
    message += `This message was automatically sent by Surkshit Emergency Alert System.\n\n`;
    
    if (location) {
      message += `📍 Location: https://maps.google.com/maps?q=${location.latitude},${location.longitude}\n`;
      message += `Coordinates: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}\n`;
      if (location.accuracy) {
        message += `Accuracy: ±${Math.round(location.accuracy)}m\n`;
      }
    } else {
      message += `📍 Location: Unable to determine exact location\n`;
    }
    
    message += `\n⏰ Time: ${new Date().toLocaleString()}\n`;
    message += `\nPlease contact emergency services if needed: 911 (US), 112 (EU), 100 (India)`;
    
    return message;
  };

  const handleSendWhatsApp = () => {
    if (!emergencyContact) {
      toast({
        title: "No Emergency Contact",
        description: "Please set up an emergency contact in settings first.",
        variant: "destructive"
      });
      return;
    }

    const message = generateEmergencyMessage();
    const encodedMessage = encodeURIComponent(message);
    const cleanPhoneNumber = emergencyContact.replace(/\D/g, ''); // Remove non-digit characters
    
    const whatsappUrl = `https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`;
    
    console.log('Opening WhatsApp with URL:', whatsappUrl);
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "WhatsApp Opened",
      description: "Emergency message prepared. Please send it to your contact.",
    });
  };

  const formatLocation = (): string => {
    if (!location) return 'Location unavailable';
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Success Message */}
        <Card className="bg-green-900 border-green-700">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-400 animate-pulse" />
            </div>
            <CardTitle className="text-white text-2xl">Help Alert Activated!</CardTitle>
            <CardDescription className="text-green-200">
              Emergency detection system has been triggered
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Emergency Information */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Emergency Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <p className="text-white font-medium">Your Location</p>
                <p className="text-sm text-gray-400">
                  {location ? formatLocation() : locationError || 'Getting location...'}
                </p>
                {location && (
                  <a
                    href={`https://maps.google.com/maps?q=${location.latitude},${location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm underline"
                  >
                    View on Google Maps
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MessageCircle className="h-5 w-5 text-green-400 mt-0.5" />
              <div>
                <p className="text-white font-medium">Emergency Contact</p>
                <p className="text-sm text-gray-400">
                  {emergencyContact || 'No contact set up'}
                </p>
              </div>
            </div>

            <div className="text-xs text-gray-400 mt-4 p-3 bg-gray-900 rounded">
              <strong>Time:</strong> {new Date().toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button 
            onClick={handleSendWhatsApp}
            disabled={!emergencyContact}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Send WhatsApp Message
          </Button>
          
          {!emergencyContact && (
            <p className="text-sm text-gray-400 text-center">
              Set up an emergency contact in settings to send WhatsApp messages
            </p>
          )}

          <Link to="/settings" className="block">
            <Button variant="outline" className="w-full bg-gray-700 border-gray-600 hover:bg-gray-600 text-white">
              Update Emergency Contact
            </Button>
          </Link>

          <Link to="/" className="block">
            <Button variant="outline" className="w-full bg-gray-700 border-gray-600 hover:bg-gray-600 text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
          </Link>
        </div>

        {/* Additional Information */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <h3 className="text-white font-semibold mb-2">What happens next?</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Your emergency contact will receive the alert message</li>
              <li>• Your location has been included in the message</li>
              <li>• Contact emergency services if immediate help is needed</li>
              <li>• Stay safe and wait for help to arrive</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HelpSentPage;
