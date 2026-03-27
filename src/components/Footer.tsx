import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-muted mt-auto border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="font-serif text-2xl font-bold text-primary">Melake Mihiret</h3>
            <p className="text-sm text-muted-foreground">
              Premium cosmetics crafted with care for the modern individual.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4 text-foreground">Contact Info</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin size={20} className="text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">ደብረማርቆስ ምንጣፍ ተራ ሱቅ ቁጥር 27</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={20} className="text-primary shrink-0" />
                <span className="text-sm text-muted-foreground">0900924448</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={20} className="text-primary shrink-0" />
                <span className="text-sm text-muted-foreground">mihiretmelake990@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Quick Contact */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4 text-foreground">Get in Touch</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Have questions? Reach out to us anytime.
            </p>
            <Link 
              to="/messages" 
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <Mail size={16} />
              Send us a message
            </Link>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Melake Mihiret Cosmetics. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
