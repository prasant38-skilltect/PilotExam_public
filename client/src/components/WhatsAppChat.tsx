import { useState } from 'react';
import { MessageCircle, X } from '@/components/Icons';
import { Button } from '@/components/ui/button';

export function WhatsAppChat() {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleWhatsAppChat = () => {
    // Replace with your actual WhatsApp business number
    const phoneNumber = "+1234567890"; // Update this with the actual business number
    const message = "Hi! I need help with ATPL exam preparation.";
    const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      {/* WhatsApp Chat Button - Fixed Position */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center"
          data-testid="button-whatsapp-chat"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* WhatsApp Chat Popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-80">
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Need Help?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Chat with us on WhatsApp
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Get instant support for:
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• ATPL exam questions</li>
                <li>• Study material guidance</li>
                <li>• Technical support</li>
                <li>• Account assistance</li>
              </ul>
              
              <Button
                onClick={handleWhatsAppChat}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
                data-testid="button-start-whatsapp-chat"
              >
                Start WhatsApp Chat
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}