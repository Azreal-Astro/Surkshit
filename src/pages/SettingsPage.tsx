
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const SettingsPage: React.FC = () => {
  const [emergencyContact, setEmergencyContact] = useState('+91 9572855213');
  const [userName, setUserName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Load saved data from localStorage
    const savedContact = localStorage.getItem('surkshit-emergency-contact');
    const savedName = localStorage.getItem('surkshit-user-name');
    
    if (savedContact) setEmergencyContact(savedContact);
    if (savedName) setUserName(savedName);
  }, []);

  const handleSave = () => {
    // Validate phone number format
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    
    if (emergencyContact && !phoneRegex.test(emergencyContact)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number.",
        variant: "destructive"
      });
      return;
    }

    // Save to localStorage
    localStorage.setItem('surkshit-emergency-contact', emergencyContact);
    localStorage.setItem('surkshit-user-name', userName);

    toast({
      title: "Settings Saved",
      description: "Your emergency contact information has been saved successfully.",
    });
  };

  const handleClear = () => {
    localStorage.removeItem('surkshit-emergency-contact');
    localStorage.removeItem('surkshit-user-name');
    setEmergencyContact('');
    setUserName('');
    
    toast({
      title: "Settings Cleared",
      description: "All emergency contact information has been removed.",
    });
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <Link to="/">
          <Button variant="outline" size="sm" className="mb-4 bg-gray-800 border-gray-600 hover:bg-gray-700">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-2">Configure your emergency contact information</p>
      </div>

      {/* Settings Form */}
      <div className="max-w-md mx-auto">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <User className="mr-2 h-5 w-5" />
              Emergency Information
            </CardTitle>
            <CardDescription className="text-gray-400">
              This information will be used in emergency messages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="userName" className="text-white">Your Name</Label>
              <Input
                id="userName"
                type="text"
                placeholder="Enter your full name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact" className="text-white">Emergency Contact Phone</Label>
              <Input
                id="emergencyContact"
                type="tel"
                placeholder="+1234567890"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
              />
              <p className="text-xs text-gray-400">
                Include country code (e.g., +1 for US, +91 for India)
              </p>
            </div>

            <div className="flex space-x-3">
              <Button 
                onClick={handleSave}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Save Settings
              </Button>
              <Button 
                onClick={handleClear}
                variant="outline"
                className="bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-white font-semibold mb-2">How it works:</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Your emergency contact will be notified via WhatsApp</li>
            <li>• Your location will be included in the message</li>
            <li>• All data is stored locally on your device</li>
            <li>• No information is sent to external servers</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
