import { useState, useRef, useCallback, useEffect } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Upload, Download, QrCode, X, Sparkles, 
  Globe, Mail, Phone, Wifi, MessageSquare, 
  User, MapPin, Calendar, CreditCard, 
  FileText, Instagram, Facebook, Twitter,
  Linkedin, Youtube, Send, Music,
  Palette, Settings, Image as ImageIcon,
  Copy, Check, RefreshCw, Eye,
  Smartphone, LayoutGrid, Sliders,
  AtSign, Shield, Ghost, Bookmark,
  MessageCircle, Disc, Shield as ShieldIcon,
  ChevronDown, ChevronUp, Maximize2,
  Hash, Key, Zap, Bell, Map,
  Video, Share2, Hash as HashIcon,
  MessageCircle as MessageCircleIcon,
  Camera, Music as MusicIcon,
  Bookmark as BookmarkIcon,
  Disc as DiscordIcon,
  ShieldCheck,
  Navigation,
  Clock,
  MessageSquare as MessageSquareIcon,
  Coins
} from "lucide-react";

import { FaWhatsapp, FaXTwitter ,FaSnapchat, FaTiktok
  , FaPinterest, FaReddit, FaDiscord, FaSignalMessenger
 } from "react-icons/fa6";

import { motion, AnimatePresence } from "framer-motion";

// Template Config with Form Fields
interface TemplateField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'select' | 'textarea';
  placeholder?: string;
  required?: boolean;
  pattern?: string;
  options?: Array<{ value: string; label: string }>;
}

interface TemplateConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  defaultContent: string;
  placeholder: string;
  validation?: (value: string) => boolean;
  errorMessage?: string;
  customForm?: {
    fields: TemplateField[];
    generateContent: (data: Record<string, string>) => string;
  };
}

// Color Schemes
interface ColorScheme {
  id: string;
  name: string;
  dark: string;
  light: string;
  gradient?: string;
}

// QR Settings
interface QRSettings {
  size: number;
  margin: number;
  errorCorrection: "L" | "M" | "Q" | "H";
  colorScheme: string;
  includeLogo: boolean;
  logoSize: number;
  roundedCorners: boolean;
}

type ModalSection = 'templates' | 'colors' | 'qr-settings' | 'logo';

const QRGenerator = () => {
  const [content, setContent] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [activeModal, setActiveModal] = useState<ModalSection | null>('templates');
  const [isMobile, setIsMobile] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  
  // Settings State
  const [selectedTemplate, setSelectedTemplate] = useState<string>("website");
  const [qrSettings, setQrSettings] = useState<QRSettings>({
    size: 400,
    margin: 2,
    errorCorrection: "H",
    colorScheme: "default",
    includeLogo: false,
    logoSize: 15,
    roundedCorners: true,
  });

  // Custom Colors
  const [customColors, setCustomColors] = useState({
    dark: "#000000",
    light: "#ffffff",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Check mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Auto-hide notification after 5 seconds on mobile
    if (isMobile) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [isMobile]);

  // Quick Templates with custom forms
  const templates: TemplateConfig[] = [
    {
      id: "website",
      name: "Website",
      icon: <Globe className="w-5 h-5" />,
      description: "Link to any website",
      defaultContent: "",
      placeholder: "https://example.com",
      validation: (value) => /^https?:\/\/[^\s$.?#].[^\s]*$/.test(value),
      errorMessage: "Please enter a valid URL starting with http:// or https://"
    },
    {
      id: "email",
      name: "Email",
      icon: <Mail className="w-5 h-5" />,
      description: "Send an email",
      defaultContent: "",
      placeholder: "mailto:email@example.com",
      validation: (value) => value.startsWith("mailto:"),
      errorMessage: "Must start with 'mailto:'",
      customForm: {
        fields: [
          {
            name: "email",
            label: "Email Address",
            type: "email",
            placeholder: "recipient@example.com",
            required: true
          },
          {
            name: "subject",
            label: "Subject",
            type: "text",
            placeholder: "Email subject"
          },
          {
            name: "body",
            label: "Message Body",
            type: "textarea",
            placeholder: "Email content"
          }
        ],
        generateContent: (data) => {
          let url = `mailto:${data.email}`;
          const params = [];
          if (data.subject) params.push(`subject=${encodeURIComponent(data.subject)}`);
          if (data.body) params.push(`body=${encodeURIComponent(data.body)}`);
          if (params.length > 0) url += `?${params.join('&')}`;
          return url;
        }
      }
    },
    {
      id: "phone",
      name: "Phone",
      icon: <Phone className="w-5 h-5" />,
      description: "Make a phone call",
      defaultContent: "",
      placeholder: "tel:+1234567890",
      validation: (value) => value.startsWith("tel:"),
      errorMessage: "Must start with 'tel:'",
      customForm: {
        fields: [
          {
            name: "phone",
            label: "Phone Number",
            type: "text",
            placeholder: "+1234567890",
            required: true,
            pattern: "^[+0-9\\s\\-()]{10,}$"
          }
        ],
        generateContent: (data) => `tel:${data.phone.replace(/\s+/g, '')}`
      }
    },
    {
      id: "wifi",
      name: "WiFi",
      icon: <Wifi className="w-5 h-5" />,
      description: "Connect to WiFi",
      defaultContent: "",
      placeholder: "WIFI:S:NetworkName;T:WPA;P:Password;;",
      validation: (value) => value.startsWith("WIFI:"),
      errorMessage: "Must be in WIFI: format",
      customForm: {
        fields: [
          {
            name: "ssid",
            label: "Network Name (SSID)",
            type: "text",
            placeholder: "MyWiFiNetwork",
            required: true
          },
          {
            name: "password",
            label: "Password",
            type: "password",
            placeholder: "••••••••",
            required: true
          },
          {
            name: "security",
            label: "Security Type",
            type: "select",
            required: true,
            options: [
              { value: "WPA", label: "WPA/WPA2" },
              { value: "WEP", label: "WEP" },
              { value: "nopass", label: "No Password" }
            ]
          },
          {
            name: "hidden",
            label: "Hidden Network",
            type: "select",
            options: [
              { value: "false", label: "No" },
              { value: "true", label: "Yes" }
            ]
          }
        ],
        generateContent: (data) => {
          let wifiString = `WIFI:S:${data.ssid};T:${data.security};`;
          if (data.security !== "nopass") {
            wifiString += `P:${data.password};`;
          }
          if (data.hidden === "true") {
            wifiString += `H:true;`;
          }
          wifiString += `;`;
          return wifiString;
        }
      }
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      icon: <FaWhatsapp className="w-5 h-5" />,
      description: "Send WhatsApp message",
      defaultContent: "",
      placeholder: "https://wa.me/1234567890",
      validation: (value) => value.includes("wa.me"),
      errorMessage: "Must include 'wa.me'",
      customForm: {
        fields: [
          {
            name: "phone",
            label: "Phone Number",
            type: "text",
            placeholder: "1234567890",
            required: true,
            pattern: "^[0-9]{10,}$"
          },
          {
            name: "message",
            label: "Pre-filled Message",
            type: "textarea",
            placeholder: "Hello!"
          }
        ],
        generateContent: (data) => {
          let url = `https://wa.me/${data.phone.replace(/\D/g, '')}`;
          if (data.message) {
            url += `?text=${encodeURIComponent(data.message)}`;
          }
          return url;
        }
      }
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: <Instagram className="w-5 h-5" />,
      description: "Link to Instagram profile",
      defaultContent: "",
      placeholder: "https://instagram.com/username",
      validation: (value) => value.includes("instagram.com"),
      errorMessage: "Must include 'instagram.com'",
      customForm: {
        fields: [
          {
            name: "username",
            label: "Instagram Username",
            type: "text",
            placeholder: "@username",
            required: true
          }
        ],
        generateContent: (data) => `https://instagram.com/${data.username.replace('@', '')}`
      }
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: <Facebook className="w-5 h-5" />,
      description: "Link to Facebook profile",
      defaultContent: "",
      placeholder: "https://facebook.com/username",
      validation: (value) => value.includes("facebook.com"),
      errorMessage: "Must include 'facebook.com'",
      customForm: {
        fields: [
          {
            name: "username",
            label: "Facebook Username",
            type: "text",
            placeholder: "username",
            required: true
          }
        ],
        generateContent: (data) => `https://facebook.com/${data.username}`
      }
    },
    {
      id: "twitter",
      name: "Twitter/X",
      icon: <FaXTwitter className="w-5 h-5" />,
      description: "Link to Twitter/X profile",
      defaultContent: "",
      placeholder: "https://twitter.com/username",
      validation: (value) => value.includes("twitter.com") || value.includes("x.com"),
      errorMessage: "Must include 'twitter.com' or 'x.com'",
      customForm: {
        fields: [
          {
            name: "username",
            label: "Twitter/X Username",
            type: "text",
            placeholder: "@username",
            required: true
          }
        ],
        generateContent: (data) => `https://twitter.com/${data.username.replace('@', '')}`
      }
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: <Linkedin className="w-5 h-5" />,
      description: "Link to LinkedIn profile",
      defaultContent: "",
      placeholder: "https://linkedin.com/in/username",
      validation: (value) => value.includes("linkedin.com"),
      errorMessage: "Must include 'linkedin.com'",
      customForm: {
        fields: [
          {
            name: "username",
            label: "LinkedIn Username",
            type: "text",
            placeholder: "username",
            required: true
          }
        ],
        generateContent: (data) => `https://linkedin.com/in/${data.username}`
      }
    },
    {
      id: "telegram",
      name: "Telegram",
      icon: <Send className="w-5 h-5" />,
      description: "Send Telegram message",
      defaultContent: "",
      placeholder: "https://t.me/username",
      validation: (value) => value.includes("t.me"),
      errorMessage: "Must include 't.me'",
      customForm: {
        fields: [
          {
            name: "username",
            label: "Telegram Username",
            type: "text",
            placeholder: "username",
            required: true
          },
          {
            name: "message",
            label: "Pre-filled Message",
            type: "textarea",
            placeholder: "Hello!"
          }
        ],
        generateContent: (data) => {
          let url = `https://t.me/${data.username.replace('@', '')}`;
          if (data.message) {
            url += `?text=${encodeURIComponent(data.message)}`;
          }
          return url;
        }
      }
    },
    {
      id: "snapchat",
      name: "Snapchat",
      icon: <FaSnapchat className="w-5 h-5" />,
      description: "Link to Snapchat profile",
      defaultContent: "",
      placeholder: "https://snapchat.com/add/username",
      validation: (value) => value.includes("snapchat.com"),
      errorMessage: "Must include 'snapchat.com'",
      customForm: {
        fields: [
          {
            name: "username",
            label: "Snapchat Username",
            type: "text",
            placeholder: "username",
            required: true
          }
        ],
        generateContent: (data) => `https://snapchat.com/add/${data.username}`
      }
    },
    {
      id: "tiktok",
      name: "TikTok",
      icon: <FaTiktok className="w-5 h-5" />,
      description: "Link to TikTok profile",
      defaultContent: "",
      placeholder: "https://tiktok.com/@username",
      validation: (value) => value.includes("tiktok.com"),
      errorMessage: "Must include 'tiktok.com'",
      customForm: {
        fields: [
          {
            name: "username",
            label: "TikTok Username",
            type: "text",
            placeholder: "@username",
            required: true
          }
        ],
        generateContent: (data) => `https://tiktok.com/@${data.username.replace('@', '')}`
      }
    },
    {
      id: "youtube",
      name: "YouTube",
      icon: <Youtube className="w-5 h-5" />,
      description: "Link to YouTube channel/video",
      defaultContent: "",
      placeholder: "https://youtube.com/c/channelname",
      validation: (value) => value.includes("youtube.com"),
      errorMessage: "Must include 'youtube.com'",
      customForm: {
        fields: [
          {
            name: "channel",
            label: "YouTube Channel/Video ID",
            type: "text",
            placeholder: "channelname or videoID",
            required: true
          },
          {
            name: "type",
            label: "Content Type",
            type: "select",
            required: true,
            options: [
              { value: "channel", label: "Channel" },
              { value: "video", label: "Video" }
            ]
          }
        ],
        generateContent: (data) => {
          if (data.type === "channel") {
            return `https://youtube.com/c/${data.channel}`;
          } else {
            return `https://youtube.com/watch?v=${data.channel}`;
          }
        }
      }
    },
    {
      id: "pinterest",
      name: "Pinterest",
      icon: <FaPinterest className="w-5 h-5" />,
      description: "Link to Pinterest profile/board",
      defaultContent: "",
      placeholder: "https://pinterest.com/username",
      validation: (value) => value.includes("pinterest.com"),
      errorMessage: "Must include 'pinterest.com'",
      customForm: {
        fields: [
          {
            name: "username",
            label: "Pinterest Username",
            type: "text",
            placeholder: "username",
            required: true
          }
        ],
        generateContent: (data) => `https://pinterest.com/${data.username}`
      }
    },
    {
      id: "reddit",
      name: "Reddit",
      icon: <FaReddit className="w-5 h-5" />,
      description: "Link to Reddit profile/subreddit",
      defaultContent: "",
      placeholder: "https://reddit.com/user/username",
      validation: (value) => value.includes("reddit.com"),
      errorMessage: "Must include 'reddit.com'",
      customForm: {
        fields: [
          {
            name: "username",
            label: "Reddit Username",
            type: "text",
            placeholder: "username",
            required: true
          },
          {
            name: "type",
            label: "Content Type",
            type: "select",
            required: true,
            options: [
              { value: "user", label: "User Profile" },
              { value: "subreddit", label: "Subreddit" }
            ]
          }
        ],
        generateContent: (data) => {
          if (data.type === "user") {
            return `https://reddit.com/user/${data.username}`;
          } else {
            return `https://reddit.com/r/${data.username}`;
          }
        }
      }
    },
    {
      id: "discord",
      name: "Discord",
      icon: <FaDiscord className="w-5 h-5" />,
      description: "Join Discord server",
      defaultContent: "",
      placeholder: "https://discord.gg/invitecode",
      validation: (value) => value.includes("discord.gg"),
      errorMessage: "Must include 'discord.gg'",
      customForm: {
        fields: [
          {
            name: "inviteCode",
            label: "Discord Invite Code",
            type: "text",
            placeholder: "invitecode",
            required: true
          }
        ],
        generateContent: (data) => `https://discord.gg/${data.inviteCode}`
      }
    },
    {
      id: "signal",
      name: "Signal",
      icon: <FaSignalMessenger className="w-5 h-5" />,
      description: "Send Signal message",
      defaultContent: "",
      placeholder: "https://signal.me/#p/+1234567890",
      validation: (value) => value.includes("signal.me"),
      errorMessage: "Must include 'signal.me'",
      customForm: {
        fields: [
          {
            name: "phone",
            label: "Phone Number",
            type: "text",
            placeholder: "+1234567890",
            required: true
          },
          {
            name: "message",
            label: "Pre-filled Message",
            type: "textarea",
            placeholder: "Hello!"
          }
        ],
        generateContent: (data) => {
          let url = `https://signal.me/#p/${data.phone.replace(/\s+/g, '')}`;
          if (data.message) {
            url += `?text=${encodeURIComponent(data.message)}`;
          }
          return url;
        }
      }
    },
    {
      id: "location",
      name: "Location",
      icon: <Navigation className="w-5 h-5" />,
      description: "Open location in maps",
      defaultContent: "",
      placeholder: "geo:40.7128,-74.0060",
      validation: (value) => value.startsWith("geo:"),
      errorMessage: "Must start with 'geo:'",
      customForm: {
        fields: [
          {
            name: "latitude",
            label: "Latitude",
            type: "text",
            placeholder: "40.7128",
            required: true,
            pattern: "^-?[0-9]+(?:\\.[0-9]+)?$"
          },
          {
            name: "longitude",
            label: "Longitude",
            type: "text",
            placeholder: "-74.0060",
            required: true,
            pattern: "^-?[0-9]+(?:\\.[0-9]+)?$"
          },
          {
            name: "label",
            label: "Location Name (Optional)",
            type: "text",
            placeholder: "New York City"
          }
        ],
        generateContent: (data) => {
          let geo = `geo:${data.latitude},${data.longitude}`;
          if (data.label) {
            geo += `?q=${encodeURIComponent(data.label)}`;
          }
          return geo;
        }
      }
    },
    {
      id: "event",
      name: "Event",
      icon: <Calendar className="w-5 h-5" />,
      description: "Add event to calendar",
      defaultContent: "",
      placeholder: "BEGIN:VEVENT\nSUMMARY:Meeting\nEND:VEVENT",
      validation: (value) => value.startsWith("BEGIN:VEVENT"),
      errorMessage: "Must be a valid iCalendar format",
      customForm: {
        fields: [
          {
            name: "title",
            label: "Event Title",
            type: "text",
            placeholder: "Team Meeting",
            required: true
          },
          {
            name: "date",
            label: "Date",
            type: "text",
            placeholder: "2024-12-25",
            pattern: "^[0-9]{4}-[0-9]{2}-[0-9]{2}$"
          },
          {
            name: "time",
            label: "Time (24h format)",
            type: "text",
            placeholder: "14:00",
            pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
          },
          {
            name: "location",
            label: "Location",
            type: "text",
            placeholder: "Conference Room A"
          }
        ],
        generateContent: (data) => {
          let ics = "BEGIN:VEVENT\n";
          ics += `SUMMARY:${data.title}\n`;
          if (data.date && data.time) {
            ics += `DTSTART:${data.date.replace(/-/g, '')}T${data.time.replace(/:/g, '')}00\n`;
            ics += `DTEND:${data.date.replace(/-/g, '')}T${parseInt(data.time.split(':')[0]) + 1}${data.time.split(':')[1]}00\n`;
          }
          if (data.location) ics += `LOCATION:${data.location}\n`;
          ics += "END:VEVENT";
          return ics;
        }
      }
    },
    {
      id: "sms",
      name: "SMS",
      icon: <MessageSquareIcon className="w-5 h-5" />,
      description: "Send SMS message",
      defaultContent: "",
      placeholder: "sms:+1234567890?body=Hello",
      validation: (value) => value.startsWith("sms:"),
      errorMessage: "Must start with 'sms:'",
      customForm: {
        fields: [
          {
            name: "phone",
            label: "Phone Number",
            type: "text",
            placeholder: "+1234567890",
            required: true,
            pattern: "^[+0-9\\s\\-()]{10,}$"
          },
          {
            name: "message",
            label: "Message",
            type: "textarea",
            placeholder: "Hello!",
            required: true
          }
        ],
        generateContent: (data) => {
          return `sms:${data.phone.replace(/\s+/g, '')}?body=${encodeURIComponent(data.message)}`;
        }
      }
    },
    {
      id: "cryptocurrency",
      name: "Cryptocurrency",
      icon: <Coins className="w-5 h-5" />,
      description: "Send cryptocurrency",
      defaultContent: "",
      placeholder: "bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      validation: (value) => /^[a-zA-Z]+:[a-zA-Z0-9]+/.test(value),
      errorMessage: "Must be in format: crypto:address",
      customForm: {
        fields: [
          {
            name: "currency",
            label: "Cryptocurrency",
            type: "select",
            required: true,
            options: [
              { value: "bitcoin", label: "Bitcoin (BTC)" },
              { value: "ethereum", label: "Ethereum (ETH)" },
              { value: "litecoin", label: "Litecoin (LTC)" },
              { value: "bitcoincash", label: "Bitcoin Cash (BCH)" },
              { value: "solana", label: "Solana (SOL)" },
              { value: "dogecoin", label: "Dogecoin (DOGE)" }
            ]
          },
          {
            name: "address",
            label: "Wallet Address",
            type: "text",
            placeholder: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
            required: true
          },
          {
            name: "amount",
            label: "Amount (Optional)",
            type: "text",
            placeholder: "0.01"
          },
          {
            name: "label",
            label: "Payment Label (Optional)",
            type: "text",
            placeholder: "Invoice #123"
          }
        ],
        generateContent: (data) => {
          let url = `${data.currency}:${data.address}`;
          const params = [];
          if (data.amount) params.push(`amount=${data.amount}`);
          if (data.label) params.push(`label=${encodeURIComponent(data.label)}`);
          if (params.length > 0) url += `?${params.join('&')}`;
          return url;
        }
      }
    }
  ];

  // Color Schemes - Added custom color option
  const colorSchemes: ColorScheme[] = [
    { id: "default", name: "Classic", dark: "#000000", light: "#ffffff" },
    { id: "blue", name: "Ocean Blue", dark: "#3b82f6", light: "#ffffff", gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)" },
    { id: "green", name: "Emerald", dark: "#10b981", light: "#ffffff", gradient: "linear-gradient(135deg, #10b981, #059669)" },
    { id: "purple", name: "Royal Purple", dark: "#8b5cf6", light: "#ffffff", gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)" },
    { id: "red", name: "Ruby Red", dark: "#ef4444", light: "#ffffff", gradient: "linear-gradient(135deg, #ef4444, #dc2626)" },
    { id: "orange", name: "Sunset Orange", dark: "#f97316", light: "#ffffff", gradient: "linear-gradient(135deg, #f97316, #ea580c)" },
    { id: "dark", name: "Dark Mode", dark: "#ffffff", light: "#18181b" },
    { id: "gradient", name: "Gradient", dark: "#8b5cf6", light: "#ffffff", gradient: "linear-gradient(135deg, #8b5cf6, #3b82f6)" },
    { id: "custom", name: "Custom", dark: "#000000", light: "#ffffff" }
  ];

  // Get selected template
  const getSelectedTemplate = () => {
    return templates.find(t => t.id === selectedTemplate) || templates[0];
  };

  // Get colors based on selected scheme
  const getColors = () => {
    if (qrSettings.colorScheme === "custom") {
      return customColors;
    }
    const scheme = colorSchemes.find(s => s.id === qrSettings.colorScheme);
    return scheme || { dark: "#000000", light: "#ffffff" };
  };

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    
    if (template) {
      // Reset form data for new template
      if (template.customForm) {
        const initialData: Record<string, string> = {};
        template.customForm.fields.forEach(field => {
          initialData[field.name] = '';
        });
        setFormData(initialData);
        setContent(""); // Clear content initially
      } else {
        setContent(""); // Clear content initially
      }
      
      // Close modal on mobile
      if (isMobile) {
        setActiveModal(null);
      }
      
      toast.success(`Selected ${template.name} template`);
    }
  };

  // Handle form field change
  const handleFormFieldChange = (fieldName: string, value: string) => {
    const newFormData = { ...formData, [fieldName]: value };
    setFormData(newFormData);
    
    const template = getSelectedTemplate();
    if (template.customForm) {
      try {
        // Check if all required fields are filled
        const requiredFields = template.customForm.fields.filter(f => f.required);
        const allRequiredFilled = requiredFields.every(field => 
          newFormData[field.name] && newFormData[field.name].trim()
        );
        
        if (allRequiredFilled) {
          const generatedContent = template.customForm.generateContent(newFormData);
          setContent(generatedContent);
        } else {
          setContent(""); // Clear content if not all required fields are filled
        }
      } catch (error) {
        console.error("Error generating content:", error);
        setContent("");
      }
    }
  };

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setLogo(reader.result as string);
        setQrSettings(prev => ({ ...prev, includeLogo: true }));
        toast.success("Logo uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogo(null);
    setQrSettings(prev => ({ ...prev, includeLogo: false }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.info("Logo removed");
  };

  // Live preview update when settings change
  useEffect(() => {
    if (qrCodeDataUrl && content) {
      const timer = setTimeout(() => {
        generateQRCode();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [qrSettings, content, logo]);

  const generateQRCode = useCallback(async () => {
    const currentContent = content.trim();
    if (!currentContent) {
      toast.error("Please enter content");
      return;
    }

    // Validate based on selected template
    const template = getSelectedTemplate();
    if (template.validation && !template.validation(currentContent)) {
      toast.error(template.errorMessage || "Invalid content format");
      return;
    }

    // Validate form data if template has custom form
    if (template.customForm) {
      const requiredFields = template.customForm.fields.filter(f => f.required);
      for (const field of requiredFields) {
        if (!formData[field.name]?.trim()) {
          toast.error(`Please fill in ${field.label}`);
          return;
        }
        if (field.pattern && formData[field.name]) {
          const regex = new RegExp(field.pattern);
          if (!regex.test(formData[field.name])) {
            toast.error(`Invalid format for ${field.label}`);
            return;
          }
        }
      }
    }

    setIsGenerating(true);

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const size = qrSettings.size;
      canvas.width = size;
      canvas.height = size;

      const colors = getColors();

      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(currentContent, {
        width: size,
        margin: qrSettings.margin,
        color: {
          dark: colors.dark,
          light: colors.light,
        },
        errorCorrectionLevel: qrSettings.errorCorrection,
      });

      // Draw QR code on canvas
      const qrImage = new Image();
      qrImage.onload = () => {
        ctx.drawImage(qrImage, 0, 0, size, size);

        // If logo exists, draw it in the center
        if (qrSettings.includeLogo && logo) {
          const logoImage = new Image();
          logoImage.onload = () => {
            const logoSize = size * (qrSettings.logoSize / 100);
            const logoX = (size - logoSize) / 2;
            const logoY = (size - logoSize) / 2;

            // Draw thin white border for logo (2px border instead of full background)
            ctx.save();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 0;
            if (qrSettings.roundedCorners) {
              ctx.beginPath();
              ctx.roundRect(logoX - 1, logoY - 1, logoSize + 2, logoSize + 2, 8);
              ctx.stroke();
            } else {
              ctx.strokeRect(logoX - 1, logoY - 1, logoSize + 2, logoSize + 2);
            }
            ctx.restore();

            // Draw logo with clipping
            ctx.save();
            if (qrSettings.roundedCorners) {
              ctx.beginPath();
              ctx.roundRect(logoX, logoY, logoSize, logoSize, 6);
              ctx.clip();
            } else {
              ctx.beginPath();
              ctx.rect(logoX, logoY, logoSize, logoSize);
              ctx.clip();
            }
            ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
            ctx.restore();

            setQrCodeDataUrl(canvas.toDataURL("image/png"));
            setIsGenerating(false);
            toast.success("QR Code updated!");
          };
          logoImage.src = logo;
        } else {
          setQrCodeDataUrl(canvas.toDataURL("image/png"));
          setIsGenerating(false);
          toast.success("QR Code updated!");
        }
      };
      qrImage.src = qrDataUrl;
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Failed to generate QR code");
      setIsGenerating(false);
    }
  }, [content, logo, qrSettings, formData]);

  const downloadQRCode = async () => {
    if (!qrCodeDataUrl) {
      toast.error("Please generate a QR code first");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Create a canvas element for download
      const canvas = document.createElement('canvas');
      const size = qrSettings.size;
      const padding = 20;
      const totalSize = size + padding * 2;
      
      canvas.width = totalSize;
      canvas.height = totalSize;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        toast.error("Failed to create canvas context");
        return;
      }

      // Get colors
      const colors = getColors();
      const bgColor = colors.light;

      // Fill background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, totalSize, totalSize);

      // Generate QR code on canvas
      try {
        const qrCanvas = document.createElement('canvas');
        qrCanvas.width = size;
        qrCanvas.height = size;
        
        await QRCode.toCanvas(qrCanvas, content, {
          width: size,
          margin: qrSettings.margin,
          color: {
            dark: colors.dark,
            light: colors.light
          },
          errorCorrectionLevel: qrSettings.errorCorrection
        });
        
        // Draw QR code centered with padding
        ctx.drawImage(qrCanvas, padding, padding, size, size);
        
      } catch (error) {
        console.error('QR code generation failed:', error);
        toast.error("Failed to generate QR code");
        return;
      }

      // Add logo if enabled
      if (qrSettings.includeLogo && logo) {
        try {
          const logoImg = new Image();
          
          // Wait for logo to load
          await new Promise<void>((resolve, reject) => {
            logoImg.onload = () => resolve();
            logoImg.onerror = () => reject(new Error("Failed to load logo"));
            logoImg.src = logo;
            
            setTimeout(() => reject(new Error("Logo loading timeout")), 5000);
          });

          // Calculate logo position (center of QR code)
          const centerX = totalSize / 2;
          const centerY = totalSize / 2;
          const logoSize = qrSettings.size * (qrSettings.logoSize / 100);
          
          // Draw thin white border for logo
          ctx.save();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          if (qrSettings.roundedCorners) {
            ctx.beginPath();
            ctx.roundRect(
              centerX - logoSize/2 - 1, 
              centerY - logoSize/2 - 1, 
              logoSize + 2, 
              logoSize + 2, 
              8
            );
            ctx.stroke();
          } else {
            ctx.strokeRect(
              centerX - logoSize/2 - 1, 
              centerY - logoSize/2 - 1, 
              logoSize + 2, 
              logoSize + 2
            );
          }
          ctx.restore();
          
          // Draw the logo with clipping
          ctx.save();
          if (qrSettings.roundedCorners) {
            ctx.beginPath();
            ctx.roundRect(
              centerX - logoSize/2, 
              centerY - logoSize/2, 
              logoSize, 
              logoSize, 
              6
            );
            ctx.clip();
          } else {
            ctx.beginPath();
            ctx.rect(
              centerX - logoSize/2, 
              centerY - logoSize/2, 
              logoSize, 
              logoSize
            );
            ctx.clip();
          }
          
          ctx.drawImage(
            logoImg, 
            centerX - logoSize/2, 
            centerY - logoSize/2, 
            logoSize, 
            logoSize
          );
          ctx.restore();
          
        } catch (error) {
          console.warn('Failed to add logo to download:', error);
          toast.warning("Logo could not be added to download, proceeding without it");
        }
      }

      // Convert canvas to data URL and trigger download
      const dataUrl = canvas.toDataURL("image/png", 1.0);
      
      // Create a temporary link and trigger download
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `qr-code-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
      
      toast.success("QR code downloaded successfully!");
      
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download QR code");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyQRCode = async () => {
    if (!qrCodeDataUrl) {
      toast.error("Please generate a QR code first");
      return;
    }

    try {
      const response = await fetch(qrCodeDataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopied(true);
      toast.success("QR Code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
      toast.error("Failed to copy QR code");
    }
  };

  const resetGenerator = () => {
    setContent("");
    setLogo(null);
    setQrCodeDataUrl(null);
    setSelectedTemplate("website");
    setFormData({});
    setQrSettings({
      size: 400,
      margin: 2,
      errorCorrection: "H",
      colorScheme: "default",
      includeLogo: false,
      logoSize: 5,
      roundedCorners: true,
    });
    setCustomColors({
      dark: "#000000",
      light: "#ffffff",
    });
    toast.info("Generator reset");
  };

  // Render form fields for selected template
  const renderTemplateForm = () => {
    const template = getSelectedTemplate();
    
    if (!template.customForm) {
      return (
        <div className="space-y-4">
          <Label htmlFor="content" className="text-sm font-medium text-foreground">
            {template.name} Content
          </Label>
          <Input
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={template.placeholder}
            className="bg-slate-800/50 border-slate-700 text-slate-100 hover:border-blue-500/50 transition-all duration-300"
          />
          {content && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-slate-800/30 rounded-lg border border-slate-700"
            >
              <p className="text-sm text-slate-400 mb-1">Generated QR Code Content:</p>
              <p className="text-sm text-slate-300 font-mono break-all text-xs">{content}</p>
            </motion.div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {template.customForm.fields.map((field) => {
          if (field.type === 'select') {
            return (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name} className="text-sm text-foreground">
                  {field.label}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                </Label>
                <Select
                  value={formData[field.name] || ''}
                  onValueChange={(value) => handleFormFieldChange(field.name, value)}
                  required={field.required}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-100 hover:border-blue-500/50 transition-all">
                    <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          }

          if (field.type === 'textarea') {
            return (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name} className="text-sm text-foreground">
                  {field.label}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                </Label>
                <Textarea
                  id={field.name}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleFormFieldChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className="min-h-[100px] bg-slate-800/50 border-slate-700 text-slate-100 hover:border-blue-500/50 transition-all"
                  required={field.required}
                />
              </div>
            );
          }

          return (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name} className="text-sm text-foreground">
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </Label>
              <Input
                id={field.name}
                type={field.type}
                value={formData[field.name] || ''}
                onChange={(e) => handleFormFieldChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className="bg-slate-800/50 border-slate-700 text-slate-100 hover:border-blue-500/50 transition-all"
                required={field.required}
                pattern={field.pattern}
              />
            </div>
          );
        })}
        
        {content && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700"
          >
            <p className="text-sm text-slate-400 mb-1">Generated QR Code Content:</p>
            <p className="text-sm text-slate-300 font-mono break-all text-xs">{content}</p>
          </motion.div>
        )}
      </div>
    );
  };

  // Render mobile modal content
  const renderMobileModalContent = () => {
    switch (activeModal) {
      case 'templates':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">Quick Templates</h3>
              <p className="text-slate-300 text-sm">Select a template</p>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              {templates.slice(0, 12).map((template) => (
                <motion.button
                  key={template.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTemplateSelect(template.id)}
                  className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${
                    selectedTemplate === template.id
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 border-2 border-blue-400"
                      : "bg-slate-800/50 border border-slate-700 hover:border-blue-500/50"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    selectedTemplate === template.id ? "bg-white/20" : "bg-slate-700/50"
                  }`}>
                    {template.icon}
                  </div>
                  <span className="text-xs font-medium text-white text-center">{template.name}</span>
                </motion.button>
              ))}
            </div>
            
            {templates.length > 12 && (
              <div className="grid grid-cols-4 gap-3">
                {templates.slice(12, 24).map((template) => (
                  <motion.button
                    key={template.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTemplateSelect(template.id)}
                    className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${
                      selectedTemplate === template.id
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 border-2 border-blue-400"
                        : "bg-slate-800/50 border border-slate-700 hover:border-blue-500/50"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      selectedTemplate === template.id ? "bg-white/20" : "bg-slate-700/50"
                    }`}>
                      {template.icon}
                    </div>
                    <span className="text-xs font-medium text-white text-center">{template.name}</span>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        );
        
      case 'colors':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">Color Schemes</h3>
              <p className="text-slate-300 text-sm">Choose colors for your QR code</p>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {colorSchemes.map((scheme) => (
                <motion.button
                  key={scheme.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setQrSettings(prev => ({ ...prev, colorScheme: scheme.id }))}
                  className={`p-3 rounded-xl flex flex-col items-center gap-2 border-2 transition-all ${
                    qrSettings.colorScheme === scheme.id
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-purple-500/50'
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center">
                    {scheme.gradient ? (
                      <div 
                        className="w-full h-full"
                        style={{ background: scheme.gradient }}
                      />
                    ) : (
                      <>
                        <div 
                          className="w-full h-full"
                          style={{ backgroundColor: scheme.dark }}
                        />
                        <div 
                          className="w-1/2 h-full"
                          style={{ backgroundColor: scheme.light }}
                        />
                      </>
                    )}
                  </div>
                  <span className="text-xs font-medium text-white text-center">{scheme.name}</span>
                </motion.button>
              ))}
            </div>
            
            {qrSettings.colorScheme === "custom" && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pt-4 border-t border-slate-700/50"
              >
                <h4 className="font-medium text-slate-300 text-center">Custom Colors</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-300">QR Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customColors.dark}
                        onChange={(e) => setCustomColors(prev => ({ ...prev, dark: e.target.value }))}
                        className="w-8 h-8 cursor-pointer rounded-lg overflow-hidden border-2 border-slate-700"
                      />
                      <Input
                        value={customColors.dark}
                        onChange={(e) => setCustomColors(prev => ({ ...prev, dark: e.target.value }))}
                        className="text-sm h-8"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-300">Background</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customColors.light}
                        onChange={(e) => setCustomColors(prev => ({ ...prev, light: e.target.value }))}
                        className="w-8 h-8 cursor-pointer rounded-lg overflow-hidden border-2 border-slate-700"
                      />
                      <Input
                        value={customColors.light}
                        onChange={(e) => setCustomColors(prev => ({ ...prev, light: e.target.value }))}
                        className="text-sm h-8"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        );
        
      case 'qr-settings':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">QR Settings</h3>
              <p className="text-slate-300 text-sm">Adjust QR code parameters</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-slate-300">Size: {qrSettings.size}px</Label>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300">
                    {qrSettings.size < 300 ? 'Small' : qrSettings.size < 500 ? 'Medium' : 'Large'}
                  </span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="600"
                  step="50"
                  value={qrSettings.size}
                  onChange={(e) => setQrSettings(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm text-slate-300">Error Correction</Label>
                <div className="grid grid-cols-4 gap-2">
                  {(["L", "M", "Q", "H"] as const).map((level) => (
                    <Button
                      key={level}
                      size="sm"
                      variant={qrSettings.errorCorrection === level ? "default" : "outline"}
                      onClick={() => setQrSettings(prev => ({ ...prev, errorCorrection: level }))}
                      className={`text-xs ${
                        qrSettings.errorCorrection === level 
                          ? 'bg-emerald-600 hover:bg-emerald-700' 
                          : 'border-slate-700'
                      }`}
                    >
                      {level}
                      <span className="ml-1 text-xs opacity-80">
                        {level === "L" ? "7%" : level === "M" ? "15%" : level === "Q" ? "25%" : "30%"}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-slate-300">Margin: {qrSettings.margin}px</Label>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={qrSettings.margin}
                  onChange={(e) => setQrSettings(prev => ({ ...prev, margin: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        );
        
      case 'logo':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">Logo Settings</h3>
              <p className="text-slate-300 text-sm">Add or customize your logo</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-slate-300">Include Logo</Label>
                <Switch
                  checked={qrSettings.includeLogo}
                  onCheckedChange={(checked) => setQrSettings(prev => ({ ...prev, includeLogo: checked }))}
                  disabled={!logo}
                  className="data-[state=checked]:bg-pink-500"
                />
              </div>
              
              {logo ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-700 flex items-center justify-center bg-white p-3">
                        <img
                          src={logo}
                          alt="Logo preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs"
                      >
                        Change
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={removeLogo}
                        className="text-xs"
                      >
                        Remove
                      </Button>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                  
                  {qrSettings.includeLogo && (
                    <div className="space-y-2 pt-4 border-t border-slate-700/50">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm text-slate-300">Logo Size: {qrSettings.logoSize}%</Label>
                        <span className="text-xs text-slate-400">Max 25%</span>
                      </div>
                      <input
                        type="range"
                        min="15"
                        max="25"
                        step="1"
                        value={qrSettings.logoSize}
                        onChange={(e) => setQrSettings(prev => ({ ...prev, logoSize: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>15%</span>
                        <span>20%</span>
                        <span>25%</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:border-pink-500 hover:bg-slate-800/30 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 mx-auto text-slate-400 mb-3" />
                  <p className="text-sm text-slate-300">Tap to upload logo</p>
                  <p className="text-xs text-slate-400 mt-1">PNG recommended</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </motion.div>
              )}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Initialize with default template
  useEffect(() => {
    const defaultTemplate = templates[0];
    setSelectedTemplate("website");
    setContent("");
    setFormData({});
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-slate-100 relative">
      {/* Mobile Notification at Top */}
      {isMobile && showNotification && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-4 right-4 z-50 lg:hidden"
        >
          <div className="glass backdrop-blur-lg rounded-xl p-4 border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-white">Live Preview Active</p>
                  <p className="text-xs text-slate-300">Changes update QR code instantly</p>
                </div>
              </div>
              <button
                onClick={() => setShowNotification(false)}
                className="p-1 hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Mobile Header */}
      {isMobile && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden sticky top-0 z-40 bg-slate-900/90 backdrop-blur-lg border-b border-slate-700/50 px-4 py-3 md:mt-20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-blue-400" />
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                QR Generator
              </h1>
            </div>
            <div className="text-sm text-slate-400">
              {getSelectedTemplate().name}
            </div>
          </div>
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto p-4 md:p-0 space-y-6 pt-6">
        {/* Desktop Header */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden lg:block text-center space-y-4 pt-8"
          >
            <div className="flex flex-col items-center gap-3">
              <h1 className="text-2xl md:text-3xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                QR Code Generator
              </h1>
            </div>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
              Create custom QR codes for websites, social media, contacts, WiFi, and more. 100% local & secure.
            </p>
          </motion.div>
        )}

        {/* Mobile Quick Navigation */}
        {isMobile && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden glass backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50 mb-6 mt-4"
          >
            <div className="grid grid-cols-4 gap-2">
              {['templates', 'colors', 'qr-settings', 'logo'].map((section) => (
                <motion.button
                  key={section}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveModal(section as ModalSection)}
                  className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${
                    activeModal === section
                      ? section === 'templates'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                        : section === 'colors'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                        : section === 'qr-settings'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
                        : 'bg-gradient-to-r from-pink-600 to-rose-600'
                      : 'bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700/50'
                  }`}
                >
                  {section === 'templates' && <LayoutGrid className="w-4 h-4" />}
                  {section === 'colors' && <Palette className="w-4 h-4" />}
                  {section === 'qr-settings' && <Sliders className="w-4 h-4" />}
                  {section === 'logo' && <ImageIcon className="w-4 h-4" />}
                  <span className="text-xs font-medium text-white">
                    {section === 'templates' ? 'Templates' : 
                     section === 'colors' ? 'Colors' : 
                     section === 'qr-settings' ? 'Settings' : 'Logo'}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Panel - Content & Preview */}
          <div className="lg:col-span-2 space-y-8">
            {/* Content Input - REMOVED Quick Templates from top */}
            <motion.div 
              initial={{ opacity: 0, x: isMobile ? 0 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="glass backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/30 transition-all"
            >
              <div className="space-y-6">
                {/* Content Input Area */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium text-slate-300">
                      <span className="flex items-center gap-2">
                        {getSelectedTemplate().icon}
                        {getSelectedTemplate().name} Content
                      </span>
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveModal('templates')}
                      className="gap-2"
                    >
                      <LayoutGrid className="w-3 h-3" />
                      {isMobile ? "Templates" : "Change Template"}
                    </Button>
                  </div>
                  
                  {renderTemplateForm()}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-700/50">
                  <Button
                    onClick={generateQRCode}
                    disabled={isGenerating || !content}
                    className="flex-1 gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <QrCode className="w-4 h-4" />
                        {qrCodeDataUrl ? 'Update QR Code' : 'Generate QR Code'}
                      </>
                    )}
                  </Button>
                  
                  {qrCodeDataUrl && (
                    <>
                      <Button
                        onClick={downloadQRCode}
                        className="flex-1 gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                      <Button
                        onClick={copyQRCode}
                        className="flex-1 gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* QR Code Preview */}
            {qrCodeDataUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="glass backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/30 transition-all"
              >
                <div className="flex flex-col items-center justify-center space-y-6">
                  {/* QR Code Display */}
                  <motion.div 
                    className={`p-6 rounded-2xl transition-all ${
                      getColors().light === "#18181b" 
                        ? 'bg-gradient-to-br from-slate-900 to-slate-800' 
                        : 'bg-gradient-to-br from-white to-slate-100'
                    } shadow-2xl`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <img
                      src={qrCodeDataUrl}
                      alt="Generated QR Code"
                      className="w-64 h-64"
                    />
                  </motion.div>
                  
                  {/* Preview Info */}
                  <div className="text-center space-y-3">
                    <p className="text-sm text-slate-300">
                      Scan this QR code with your phone camera
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full hover:bg-blue-500/30 transition-colors">
                        Size: {qrSettings.size}px
                      </span>
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full hover:bg-emerald-500/30 transition-colors">
                        Error: {qrSettings.errorCorrection}
                      </span>
                      {qrSettings.includeLogo && (
                        <span className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full hover:bg-pink-500/30 transition-colors">
                          With Logo ({qrSettings.logoSize}%)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Panel - Settings (Desktop Only) */}
          {!isMobile && (
            <div className="space-y-6">
              {/* Settings Navigation */}
            
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50"
              >
                <div className="grid grid-cols-4 gap-2">
                  {['templates', 'colors', 'qr-settings', 'logo'].map((section) => (
                    <motion.button
                      key={section}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveModal(section as ModalSection)}
                      className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${
                        activeModal === section
                          ? section === 'templates'
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                            : section === 'colors'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                            : section === 'qr-settings'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
                            : 'bg-gradient-to-r from-pink-600 to-rose-600'
                          : 'bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700/50'
                      }`}
                    >
                      {section === 'templates' && <LayoutGrid className="w-4 h-4" />}
                      {section === 'colors' && <Palette className="w-4 h-4" />}
                      {section === 'qr-settings' && <Sliders className="w-4 h-4" />}
                      {section === 'logo' && <ImageIcon className="w-4 h-4" />}
                      <span className="text-xs font-medium text-white">
                        {section === 'templates' ? 'Templates' : 
                         section === 'colors' ? 'Colors' : 
                         section === 'qr-settings' ? 'Settings' : 'Logo'}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Settings Content */}
              {activeModal && (
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeModal}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="glass backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 min-h-[400px]"
                  >
                    {activeModal === 'templates' && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Templates ({templates.length})</h3>
                        <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-blue-800 [&::-webkit-scrollbar-thumb]:rounded-full">
                          {templates.map((template) => (
                            <motion.button
                              key={template.id}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleTemplateSelect(template.id)}
                              className={`p-3 rounded-xl flex items-center gap-2 transition-all ${
                                selectedTemplate === template.id
                                  ? "bg-gradient-to-r from-blue-600 to-purple-600 border border-blue-400"
                                  : "bg-slate-800/50 border border-slate-700 hover:border-blue-500/50"
                              }`}
                            >
                              <div className={`p-1 rounded-md ${
                                selectedTemplate === template.id ? "bg-white/20" : "bg-slate-700/50"
                              }`}>
                                {template.icon}
                                
                              </div>
                              <span className="text-sm font-medium text-white flex-1 text-left">{template.name}</span>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeModal === 'colors' && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-white">Color Scheme</h3>
                        <div className="grid grid-cols-3 gap-3">
                          {colorSchemes.map((scheme) => (
                            <motion.button
                              key={scheme.id}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setQrSettings(prev => ({ ...prev, colorScheme: scheme.id }))}
                              className={`p-3 rounded-xl flex flex-col items-center gap-2 border-2 transition-all ${
                                qrSettings.colorScheme === scheme.id
                                  ? 'border-purple-500 bg-purple-500/10'
                                  : 'border-slate-700 bg-slate-800/50 hover:border-purple-500/50'
                              }`}
                            >
                              <div className="w-10 h-10 rounded-lg overflow-hidden">
                                {scheme.gradient ? (
                                  <div 
                                    className="w-full h-full"
                                    style={{ background: scheme.gradient }}
                                  />
                                ) : scheme.id === "custom" ? (
                                  <div className="w-full h-full flex">
                                    <div 
                                      className="w-1/2 h-full"
                                      style={{ backgroundColor: customColors.dark }}
                                    />
                                    <div 
                                      className="w-1/2 h-full"
                                      style={{ backgroundColor: customColors.light }}
                                    />
                                  </div>
                                ) : (
                                  <div 
                                    className="w-full h-full"
                                    style={{ backgroundColor: scheme.dark }}
                                  />
                                )}
                              </div>
                              <span className="text-xs font-medium text-white text-center">{scheme.name}</span>
                            </motion.button>
                          ))}
                        </div>
                        
                        {qrSettings.colorScheme === "custom" && (
                          <div className="space-y-4 pt-4 border-t border-slate-700/50">
                            <h4 className="font-medium text-slate-300">Custom Colors</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs text-slate-300">QR Color</Label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={customColors.dark}
                                    onChange={(e) => setCustomColors(prev => ({ ...prev, dark: e.target.value }))}
                                    className="w-8 h-8 cursor-pointer rounded-lg border border-slate-700"
                                  />
                                  <Input
                                    value={customColors.dark}
                                    onChange={(e) => setCustomColors(prev => ({ ...prev, dark: e.target.value }))}
                                    className="text-sm h-8"
                                    placeholder="#000000"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-slate-300">Background</Label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={customColors.light}
                                    onChange={(e) => setCustomColors(prev => ({ ...prev, light: e.target.value }))}
                                    className="w-8 h-8 cursor-pointer rounded-lg border border-slate-700"
                                  />
                                  <Input
                                    value={customColors.light}
                                    onChange={(e) => setCustomColors(prev => ({ ...prev, light: e.target.value }))}
                                    className="text-sm h-8"
                                    placeholder="#FFFFFF"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeModal === 'qr-settings' && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-white">QR Settings</h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm text-slate-300">Size: {qrSettings.size}px</Label>
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300">
                                {qrSettings.size < 300 ? 'Small' : qrSettings.size < 500 ? 'Medium' : 'Large'}
                              </span>
                            </div>
                            <input
                              type="range"
                              min="200"
                              max="600"
                              step="50"
                              value={qrSettings.size}
                              onChange={(e) => setQrSettings(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm text-slate-300">Error Correction</Label>
                            <div className="grid grid-cols-4 gap-2">
                              {(["L", "M", "Q", "H"] as const).map((level) => (
                                <Button
                                  key={level}
                                  size="sm"
                                  variant={qrSettings.errorCorrection === level ? "default" : "outline"}
                                  onClick={() => setQrSettings(prev => ({ ...prev, errorCorrection: level }))}
                                  className={`text-xs ${
                                    qrSettings.errorCorrection === level 
                                      ? 'bg-emerald-600 hover:bg-emerald-700' 
                                      : 'border-slate-700'
                                  }`}
                                >
                                  {level}
                                  <span className="ml-1 text-xs opacity-80">
                                    {level === "L" ? "7%" : level === "M" ? "15%" : level === "Q" ? "25%" : "30%"}
                                  </span>
                                </Button>
                              ))}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm text-slate-300">Margin: {qrSettings.margin}px</Label>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="10"
                              step="1"
                              value={qrSettings.margin}
                              onChange={(e) => setQrSettings(prev => ({ ...prev, margin: parseInt(e.target.value) }))}
                              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {activeModal === 'logo' && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-white">Logo Settings</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm text-slate-300">Include Logo</Label>
                            <Switch
                              checked={qrSettings.includeLogo}
                              onCheckedChange={(checked) => setQrSettings(prev => ({ ...prev, includeLogo: checked }))}
                              disabled={!logo}
                              className="data-[state=checked]:bg-pink-500"
                            />
                          </div>
                          
                          {logo ? (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="space-y-4"
                            >
                              <div className="flex flex-col items-center justify-center">
                                <div className="relative">
                                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-700 flex items-center justify-center bg-white p-3">
                                    <img
                                      src={logo}
                                      alt="Logo preview"
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                </div>
                                
                                <div className="flex gap-2 mt-4">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-xs"
                                  >
                                    Change
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={removeLogo}
                                    className="text-xs"
                                  >
                                    Remove
                                  </Button>
                                </div>
                                
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  accept="image/*"
                                  onChange={handleLogoUpload}
                                  className="hidden"
                                />
                              </div>
                              
                              {qrSettings.includeLogo && (
                                <div className="space-y-2 pt-4 border-t border-slate-700/50">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-sm text-slate-300">Logo Size: {qrSettings.logoSize}%</Label>
                                    <span className="text-xs text-slate-400">Max 25%</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="15"
                                    max="25"
                                    step="1"
                                    value={qrSettings.logoSize}
                                    onChange={(e) => setQrSettings(prev => ({ ...prev, logoSize: parseInt(e.target.value) }))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                  />
                                  <div className="flex justify-between text-xs text-slate-400">
                                    <span>15%</span>
                                    <span>20%</span>
                                    <span>25%</span>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          ) : (
                            <div
                              className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:border-pink-500 hover:bg-slate-800/30 transition-all"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Upload className="w-8 h-8 mx-auto text-slate-400 mb-3" />
                              <p className="text-sm text-slate-300">Click to upload logo</p>
                              <p className="text-xs text-slate-400 mt-1">PNG recommended</p>
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Reset Button */}
              <Button
                variant="ghost"
                size="lg"
                className="w-full gap-2"
                onClick={resetGenerator}
              >
                <RefreshCw className="w-4 h-4" />
                Reset All Settings
              </Button>

              {/* Security Note */}
              <div className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 backdrop-blur-sm rounded-2xl p-4 border border-emerald-700/30">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-white">Privacy First</p>
                    <p className="text-xs text-slate-400">
                      All generation happens locally in your browser
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Settings Modal */}
        <AnimatePresence>
          {isMobile && activeModal && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveModal(null)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
              />
              
              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
              >
                <div className="glass backdrop-blur-lg rounded-t-3xl border-t border-x border-slate-700/50 max-h-[80vh] overflow-hidden flex flex-col">
                  {/* Modal Header */}
                  <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {activeModal === 'templates' && <LayoutGrid className="w-5 h-5 text-blue-400" />}
                      {activeModal === 'colors' && <Palette className="w-5 h-5 text-purple-400" />}
                      {activeModal === 'qr-settings' && <Sliders className="w-5 h-5 text-emerald-400" />}
                      {activeModal === 'logo' && <ImageIcon className="w-5 h-5 text-pink-400" />}
                      <h3 className="text-lg font-bold text-white">
                        {activeModal === 'templates' ? 'Templates' : 
                         activeModal === 'colors' ? 'Colors' : 
                         activeModal === 'qr-settings' ? 'QR Settings' : 'Logo'}
                      </h3>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setActiveModal(null)}
                      className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-400" />
                    </motion.button>
                  </div>
                  
                  {/* Modal Content */}
                  <div className="flex-1 overflow-y-auto p-6">
                    {renderMobileModalContent()}
                  </div>
                  
                  {/* Modal Footer */}
                  <div className="p-4 border-t border-slate-700/50">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveModal(null)}
                      className="w-full py-3 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl border border-slate-700 text-white font-medium transition-all hover:from-slate-700 hover:to-slate-800"
                    >
                      Done
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Information Sections */}
        <div className="space-y-8 mt-8">
          {/* Security Features */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/30 transition-all"
          >
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <h4 className="font-semibold text-white">Secure & Private</h4>
                </div>
                <p className="text-sm text-slate-400">
                  All QR code generation happens 100% locally in your browser. No data is uploaded to any server.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-400" />
                  <h4 className="font-semibold text-white">Live Preview</h4>
                </div>
                <p className="text-sm text-slate-400">
                  See changes instantly as you customize colors, settings, and add logos to your QR code.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-purple-400" />
                  <h4 className="font-semibold text-white">{templates.length} Templates</h4>
                </div>
                <p className="text-sm text-slate-400">
                  Create QR codes for websites, email, WiFi, social media, contacts, and more with easy forms.
                </p>
              </div>
            </div>
          </motion.section>
        </div>
      </div>

      {/* Hidden canvas for QR generation */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default QRGenerator;