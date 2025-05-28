
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Plus, Trash2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
}

const SettingsPage: React.FC = () => {
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [userName, setUserName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Load saved data from localStorage
    const savedContacts = localStorage.getItem('surkshit-emergency-contacts');
    const savedName = localStorage.getItem('surkshit-user-name');
    
    if (savedContacts) {
      try {
        setEmergencyContacts(JSON.parse(savedContacts));
      } catch (error) {
        console.error('Error parsing contacts:', error);
      }
    }
    if (savedName) setUserName(savedName);
  }, []);

  const addContact = () => {
    const newContact: EmergencyContact = {
      id: Date.now().toString(),
      name: '',
      phone: ''
    };
    setEmergencyContacts([...emergencyContacts, newContact]);
  };

  const updateContact = (id: string, field: 'name' | 'phone', value: string) => {
    setEmergencyContacts(contacts =>
      contacts.map(contact =>
        contact.id === id ? { ...contact, [field]: value } : contact
      )
    );
  };

  const removeContact = (id: string) => {
    setEmergencyContacts(contacts => contacts.filter(contact => contact.id !== id));
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  };

  const handleSave = () => {
    // Validate all phone numbers
    const invalidContacts = emergencyContacts.filter(contact => 
      contact.phone && !validatePhoneNumber(contact.phone)
    );
    
    if (invalidContacts.length > 0) {
      toast({
        title: "Invalid Phone Numbers",
        description: "Please check all phone numbers are valid.",
        variant: "destructive"
      });
      return;
    }

    // Filter out empty contacts
    const validContacts = emergencyContacts.filter(contact => 
      contact.name.trim() && contact.phone.trim()
    );

    // Save to localStorage
    localStorage.setItem('surkshit-emergency-contacts', JSON.stringify(validContacts));
    localStorage.setItem('surkshit-user-name', userName);

    toast({
      title: "Settings Saved",
      description: `${validContacts.length} emergency contact(s) saved successfully.`,
    });
  };

  const handleClear = () => {
    localStorage.removeItem('surkshit-emergency-contacts');
    localStorage.removeItem('surkshit-user-name');
    setEmergencyContacts([]);
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
      <div className="max-w-2xl mx-auto space-y-6">
        {/* User Information */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <User className="mr-2 h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription className="text-gray-400">
              This information will be included in emergency messages
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center">
                <Phone className="mr-2 h-5 w-5" />
                Emergency Contacts
              </div>
              <Button 
                onClick={addContact}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Add multiple emergency contacts. All will be notified simultaneously.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {emergencyContacts.length === 0 ? (
              <div className="text-center py-8">
                <Phone className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                <p className="text-gray-400 mb-4">No emergency contacts added yet</p>
                <Button 
                  onClick={addContact}
                  variant="outline"
                  className="bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Contact
                </Button>
              </div>
            ) : (
              emergencyContacts.map((contact, index) => (
                <div key={contact.id} className="p-4 bg-gray-700/50 rounded-lg border border-gray-600/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-medium">Contact {index + 1}</h4>
                    <Button
                      onClick={() => removeContact(contact.id)}
                      size="sm"
                      variant="outline"
                      className="bg-red-600/20 border-red-500/50 hover:bg-red-600/40 text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-white">Name</Label>
                      <Input
                        type="text"
                        placeholder="Contact name"
                        value={contact.name}
                        onChange={(e) => updateContact(contact.id, 'name', e.target.value)}
                        className="bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-white">Phone Number</Label>
                      <Input
                        type="tel"
                        placeholder="+1234567890"
                        value={contact.phone}
                        onChange={(e) => updateContact(contact.id, 'phone', e.target.value)}
                        className="bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}

            {emergencyContacts.length > 0 && (
              <p className="text-xs text-gray-400 mt-4">
                Include country code (e.g., +1 for US, +91 for India). All contacts will receive the emergency alert.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
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
            Clear All
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-white font-semibold mb-2">How it works:</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• All emergency contacts will be notified via WhatsApp simultaneously</li>
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
