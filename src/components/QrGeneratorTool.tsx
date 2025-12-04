import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  QrCode, Download, Upload, Copy, Check, X,
  Palette, Eye, EyeOff, RefreshCw, Sparkles, 
  Zap, Smartphone, Mail, Phone, Wifi, 
  Globe, MessageSquare, Users, Camera, 
  Share2, Link, FileText, Image, Settings,
  Shield, Lock, CloudOff, HelpCircle,
  ChevronRight, TrendingUp, Target, Brush,
  Scan, SmartphoneIcon, QrCodeIcon, Stamp,
  Smartphone as PhoneIcon, AtSign, Wifi as WifiIcon,
  Facebook, Instagram, Twitter,
  Linkedin, Youtube, MessageCircle as MessageCircleIcon,
  Disc as Discord, Send, Zap as ZapIcon,
  Maximize2, Expand, User, MapPin, Calendar,
  CreditCard, File, Key, Hash, Globe as GlobeIcon,
  Music, Bookmark, MessageCircle, Ghost,
  Youtube as YoutubeIcon, Music as MusicIcon,
  Bookmark as BookmarkIcon, MessageCircle as MessageCircleIcon2,
  Shield as ShieldIcon
} from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';

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
    fields: Array<{
      name: string;
      label: string;
      type: 'text' | 'number' | 'email' | 'password' | 'select' | 'textarea';
      placeholder?: string;
      required?: boolean;
      pattern?: string;
      options?: Array<{ value: string; label: string }>;
    }>;
    generateContent: (data: Record<string, string>) => string;
  };
}

interface ColorScheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  background: string;
  foreground: string;
  isDark: boolean;
  gradient?: string;
}

interface QRConfig {
  size: number;
  margin: number;
  errorCorrection: "L" | "M" | "Q" | "H";
  colorScheme: string;
  includeLogo: boolean;
  logoSize: number;
  roundedCorners: boolean;
  dotStyle: "square" | "dots" | "rounded";
}

interface FAQItem {
  question: string;
  answer: string;
  isOpen: boolean;
}

interface FormData {
  [key: string]: string;
}

export default function QrGeneratorTool() {
  const [content, setContent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("website");
  const [qrCodeData, setQrCodeData] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [copied, setCopied] = useState(false);
  const [qrConfig, setQrConfig] = useState<QRConfig>({
    size: 300,
    margin: 4,
    errorCorrection: "H",
    colorScheme: "default",
    includeLogo: false,
    logoSize: 40,
    roundedCorners: true,
    dotStyle: "rounded"
  });
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [customColors, setCustomColors] = useState({
    dark: "#000000",
    light: "#ffffff",
  });
  
  const [formData, setFormData] = useState<FormData>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Quick Templates with custom forms
  const templates: TemplateConfig[] = [
    {
      id: "website",
      name: "Website",
      icon: <Globe className="w-4 h-4" />,
      description: "Link to any website",
      defaultContent: "https://example.com",
      placeholder: "https://your-website.com",
      validation: (value) => /^https?:\/\/[^\s$.?#].[^\s]*$/.test(value),
      errorMessage: "Please enter a valid URL starting with http:// or https://"
    },
    {
      id: "email",
      name: "Email",
      icon: <Mail className="w-4 h-4" />,
      description: "Send an email",
      defaultContent: "mailto:email@example.com?subject=Hello&body=Hi there!",
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
      icon: <Phone className="w-4 h-4" />,
      description: "Make a phone call",
      defaultContent: "tel:+1234567890",
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
      icon: <Wifi className="w-4 h-4" />,
      description: "Connect to WiFi",
      defaultContent: "WIFI:S:MyNetwork;T:WPA;P:mypassword;;",
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
      icon: <MessageSquare className="w-4 h-4" />,
      description: "Send WhatsApp message",
      defaultContent: "https://wa.me/1234567890?text=Hello",
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
      id: "facebook",
      name: "Facebook",
      icon: <Facebook className="w-4 h-4" />,
      description: "Link to Facebook profile",
      defaultContent: "https://facebook.com/username",
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
      id: "instagram",
      name: "Instagram",
      icon: <Instagram className="w-4 h-4" />,
      description: "Link to Instagram profile",
      defaultContent: "https://instagram.com/username",
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
      id: "twitter",
      name: "Twitter",
      icon: <Twitter className="w-4 h-4" />,
      description: "Link to Twitter profile",
      defaultContent: "https://twitter.com/username",
      placeholder: "https://twitter.com/username",
      validation: (value) => value.includes("twitter.com"),
      errorMessage: "Must include 'twitter.com'",
      customForm: {
        fields: [
          {
            name: "username",
            label: "Twitter Username",
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
      icon: <Linkedin className="w-4 h-4" />,
      description: "Link to LinkedIn profile",
      defaultContent: "https://linkedin.com/in/username",
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
      icon: <Send className="w-4 h-4" />,
      description: "Send Telegram message",
      defaultContent: "https://t.me/username",
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
      icon: <Ghost className="w-4 h-4" />,
      description: "Link to Snapchat profile",
      defaultContent: "https://snapchat.com/add/username",
      placeholder: "https://snapchat.com/add/username",
      validation: (value) => value.includes("snapchat.com"),
      errorMessage: "Must include 'snapchat.com'"
    },
    {
      id: "youtube",
      name: "YouTube",
      icon: <YoutubeIcon className="w-4 h-4" />,
      description: "Link to YouTube channel/video",
      defaultContent: "https://youtube.com/c/channelname",
      placeholder: "https://youtube.com/c/channelname",
      validation: (value) => value.includes("youtube.com"),
      errorMessage: "Must include 'youtube.com'"
    },
    {
      id: "tiktok",
      name: "TikTok",
      icon: <MusicIcon className="w-4 h-4" />,
      description: "Link to TikTok profile",
      defaultContent: "https://tiktok.com/@username",
      placeholder: "https://tiktok.com/@username",
      validation: (value) => value.includes("tiktok.com"),
      errorMessage: "Must include 'tiktok.com'"
    },
    {
      id: "pinterest",
      name: "Pinterest",
      icon: <BookmarkIcon className="w-4 h-4" />,
      description: "Link to Pinterest profile/board",
      defaultContent: "https://pinterest.com/username",
      placeholder: "https://pinterest.com/username",
      validation: (value) => value.includes("pinterest.com"),
      errorMessage: "Must include 'pinterest.com'"
    },
    {
      id: "reddit",
      name: "Reddit",
      icon: <MessageCircleIcon2 className="w-4 h-4" />,
      description: "Link to Reddit profile/subreddit",
      defaultContent: "https://reddit.com/user/username",
      placeholder: "https://reddit.com/user/username",
      validation: (value) => value.includes("reddit.com"),
      errorMessage: "Must include 'reddit.com'"
    },
    {
      id: "messenger",
      name: "Messenger",
      icon: <MessageCircleIcon className="w-4 h-4" />,
      description: "Send Facebook Messenger message",
      defaultContent: "https://m.me/username",
      placeholder: "https://m.me/username",
      validation: (value) => value.includes("m.me"),
      errorMessage: "Must include 'm.me'"
    },
    {
      id: "discord",
      name: "Discord",
      icon: <Discord className="w-4 h-4" />,
      description: "Join Discord server",
      defaultContent: "https://discord.gg/invitecode",
      placeholder: "https://discord.gg/invitecode",
      validation: (value) => value.includes("discord.gg"),
      errorMessage: "Must include 'discord.gg'"
    },
    {
      id: "signal",
      name: "Signal",
      icon: <ShieldIcon className="w-4 h-4" />,
      description: "Send Signal message",
      defaultContent: "https://signal.me/#p/+1234567890",
      placeholder: "https://signal.me/#p/+1234567890",
      validation: (value) => value.includes("signal.me"),
      errorMessage: "Must include 'signal.me'"
    },
    {
      id: "vcard",
      name: "Contact",
      icon: <User className="w-4 h-4" />,
      description: "Save contact to phone",
      defaultContent: "BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nEND:VCARD",
      placeholder: "BEGIN:VCARD...",
      validation: (value) => value.startsWith("BEGIN:VCARD"),
      errorMessage: "Must be a valid vCard format",
      customForm: {
        fields: [
          {
            name: "firstName",
            label: "First Name",
            type: "text",
            placeholder: "John",
            required: true
          },
          {
            name: "lastName",
            label: "Last Name",
            type: "text",
            placeholder: "Doe",
            required: true
          },
          {
            name: "phone",
            label: "Phone",
            type: "text",
            placeholder: "+1234567890"
          },
          {
            name: "email",
            label: "Email",
            type: "email",
            placeholder: "john@example.com"
          },
          {
            name: "company",
            label: "Company",
            type: "text",
            placeholder: "Acme Inc."
          },
          {
            name: "title",
            label: "Job Title",
            type: "text",
            placeholder: "Software Engineer"
          }
        ],
        generateContent: (data) => {
          let vcard = "BEGIN:VCARD\nVERSION:3.0\n";
          vcard += `FN:${data.firstName} ${data.lastName}\n`;
          vcard += `N:${data.lastName};${data.firstName};;;\n`;
          if (data.phone) vcard += `TEL:${data.phone}\n`;
          if (data.email) vcard += `EMAIL:${data.email}\n`;
          if (data.company) vcard += `ORG:${data.company}\n`;
          if (data.title) vcard += `TITLE:${data.title}\n`;
          vcard += "END:VCARD";
          return vcard;
        }
      }
    },
    {
      id: "location",
      name: "Location",
      icon: <MapPin className="w-4 h-4" />,
      description: "Open location in maps",
      defaultContent: "geo:40.7128,-74.0060",
      placeholder: "geo:latitude,longitude",
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
      icon: <Calendar className="w-4 h-4" />,
      description: "Add event to calendar",
      defaultContent: "BEGIN:VEVENT\nSUMMARY:Meeting\nEND:VEVENT",
      placeholder: "BEGIN:VEVENT...",
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
      id: "text",
      name: "Plain Text",
      icon: <FileText className="w-4 h-4" />,
      description: "Display plain text",
      defaultContent: "Hello World!",
      placeholder: "Enter any text",
      validation: (value) => value.length > 0,
      errorMessage: "Text cannot be empty"
    },
    {
      id: "sms",
      name: "SMS",
      icon: <MessageSquare className="w-4 h-4" />,
      description: "Send SMS message",
      defaultContent: "sms:+1234567890?body=Hello",
      placeholder: "sms:+1234567890",
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
      id: "crypto",
      name: "Cryptocurrency",
      icon: <CreditCard className="w-4 h-4" />,
      description: "Send cryptocurrency",
      defaultContent: "bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      placeholder: "bitcoin:address",
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
              { value: "bitcoincash", label: "Bitcoin Cash (BCH)" }
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

    const [showAll, setShowAll] = useState(false);
const visibleTemplates = showAll ? templates : templates.slice(0, 5);

  // Color Schemes
  const colorSchemes: ColorScheme[] = [
    {
      id: "default",
      name: "Classic Black",
      primary: "#000000",
      secondary: "#000000",
      background: "#ffffff",
      foreground: "#000000",
      isDark: false
    },
    {
      id: "blue",
      name: "Ocean Blue",
      primary: "#3b82f6",
      secondary: "#1d4ed8",
      background: "#ffffff",
      foreground: "#1e293b",
      isDark: false,
      gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)"
    },
    {
      id: "green",
      name: "Emerald Green",
      primary: "#10b981",
      secondary: "#059669",
      background: "#ffffff",
      foreground: "#064e3b",
      isDark: false,
      gradient: "linear-gradient(135deg, #10b981, #059669)"
    },
    {
      id: "purple",
      name: "Royal Purple",
      primary: "#8b5cf6",
      secondary: "#7c3aed",
      background: "#ffffff",
      foreground: "#4c1d95",
      isDark: false,
      gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)"
    },
    {
      id: "red",
      name: "Ruby Red",
      primary: "#ef4444",
      secondary: "#dc2626",
      background: "#ffffff",
      foreground: "#7f1d1d",
      isDark: false,
      gradient: "linear-gradient(135deg, #ef4444, #dc2626)"
    },
    {
      id: "orange",
      name: "Sunset Orange",
      primary: "#f97316",
      secondary: "#ea580c",
      background: "#ffffff",
      foreground: "#7c2d12",
      isDark: false,
      gradient: "linear-gradient(135deg, #f97316, #ea580c)"
    },
    {
      id: "dark",
      name: "Dark Mode",
      primary: "#ffffff",
      secondary: "#d4d4d8",
      background: "#18181b",
      foreground: "#ffffff",
      isDark: true
    },
    {
      id: "gradient",
      name: "Gradient",
      primary: "#8b5cf6",
      secondary: "#3b82f6",
      background: "#ffffff",
      foreground: "#000000",
      isDark: false,
      gradient: "linear-gradient(135deg, #8b5cf6, #3b82f6)"
    },
    {
      id: "custom",
      name: "Custom",
      primary: "#000000",
      secondary: "#000000",
      background: "#ffffff",
      foreground: "#000000",
      isDark: false
    }
  ];

  const faqs: FAQItem[] = [
    {
      question: "What types of QR codes can I generate?",
      answer: "You can generate QR codes for websites, email, phone, WiFi, social media profiles (Facebook, Instagram, Twitter, etc.), messaging apps (WhatsApp, Telegram, Signal), and many more. Each template has pre-formatted content for easy generation.",
      isOpen: true
    },
    {
      question: "Can I customize the colors of my QR code?",
      answer: "Yes! Choose from various color schemes including Classic Black, Ocean Blue, Emerald Green, Royal Purple, Ruby Red, Sunset Orange, Dark Mode, Gradient, or create your own custom colors. You can also add a logo and adjust styling options.",
      isOpen: false
    },
    {
      question: "Are my QR codes secure and private?",
      answer: "Absolutely! All QR code generation happens 100% locally in your browser. No data is uploaded to any server, ensuring complete privacy and security for your content.",
      isOpen: false
    },
    {
      question: "What's the difference between error correction levels?",
      answer: "Error correction helps QR codes remain scannable even if damaged. L: 7% (smallest), M: 15%, Q: 25%, H: 30% (most resilient). Higher levels produce denser codes but are more scannable when damaged.",
      isOpen: false
    },
    {
      question: "Can I add my logo to the QR code?",
      answer: "Yes! You can upload a logo image (PNG recommended) and adjust its size. The QR code will automatically adjust error correction to ensure it remains scannable with the logo.",
      isOpen: false
    }
  ];

  // Toggle FAQ item
  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // Get selected template
  const getSelectedTemplate = () => {
    return templates.find(t => t.id === selectedTemplate) || templates[0];
  };

  // Get selected color scheme
  const getSelectedColorScheme = () => {
    return colorSchemes.find(c => c.id === qrConfig.colorScheme) || colorSchemes[0];
  };

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setContent(template.defaultContent);
      // Reset form data for new template
      setFormData({});
      
      // Initialize form data with empty values
      if (template.customForm) {
        const initialData: FormData = {};
        template.customForm.fields.forEach(field => {
          initialData[field.name] = '';
        });
        setFormData(initialData);
      }
    }
  };

  // Handle form field change
  const handleFormFieldChange = (fieldName: string, value: string) => {
    const newFormData = { ...formData, [fieldName]: value };
    setFormData(newFormData);
    
    const template = getSelectedTemplate();
    if (template.customForm) {
      try {
        const generatedContent = template.customForm.generateContent(newFormData);
        setContent(generatedContent);
      } catch (error) {
        console.error("Error generating content:", error);
      }
    }
  };

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo file size should be less than 2MB");
      return;
    }

    setLogoFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Auto-enable logo inclusion
    setQrConfig(prev => ({ ...prev, includeLogo: true }));
  };

  // Remove logo
  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview("");
    setQrConfig(prev => ({ ...prev, includeLogo: false }));
  };

  // Generate QR code
  const generateQRCode = async () => {
    if (!content.trim()) {
      toast.error("Please enter content for the QR code");
      return;
    }

    // Validate content based on template
    const template = getSelectedTemplate();
    if (template.validation && !template.validation(content)) {
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
      setQrCodeData(content);
      toast.success("QR code generated successfully!");
    } catch (error) {
      console.error("QR generation failed:", error);
      toast.error("Failed to generate QR code. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Download QR code as PNG - WORKING VERSION
  const downloadQRCode = useCallback(async () => {
    if (!qrCodeData) {
      toast.error("Please generate a QR code first");
      return;
    }

    try {
      // Create canvas
      const canvas = document.createElement('canvas');
      const padding = 20;
      const totalSize = qrConfig.size + padding * 2;
      
      canvas.width = totalSize;
      canvas.height = totalSize;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        toast.error("Failed to create canvas context");
        return;
      }

      // Get colors
      const colorScheme = getSelectedColorScheme();
      const bgColor = qrConfig.colorScheme === "custom" ? customColors.light : colorScheme.background;

      // Fill background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, totalSize, totalSize);

      // Create a data URL from the SVG preview
      const qrContainer = qrContainerRef.current;
      if (qrContainer) {
        const svgElement = qrContainer.querySelector('svg');
        if (svgElement) {
          // Serialize SVG
          const svgString = new XMLSerializer().serializeToString(svgElement);
          const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
          const svgUrl = URL.createObjectURL(svgBlob);
          
          const img = new Image();
          
          await new Promise((resolve, reject) => {
            img.onload = () => {
              // Draw QR code with padding
              ctx.drawImage(img, padding, padding, qrConfig.size, qrConfig.size);
              URL.revokeObjectURL(svgUrl);
              resolve(true);
            };
            
            img.onerror = () => {
              URL.revokeObjectURL(svgUrl);
              reject(new Error('Failed to load SVG'));
            };
            
            img.src = svgUrl;
          });
        }
      }

      // Add logo if enabled
      if (qrConfig.includeLogo && logoPreview) {
        const logoImg = new Image();
        logoImg.crossOrigin = "anonymous";
        
        await new Promise((resolve, reject) => {
          logoImg.onload = () => {
            const logoSize = qrConfig.logoSize;
            const centerX = totalSize / 2;
            const centerY = totalSize / 2;
            
            // Draw logo background
            ctx.fillStyle = colorScheme.isDark ? '#1e293b' : '#f8fafc';
            ctx.fillRect(
              centerX - logoSize/2 - 4,
              centerY - logoSize/2 - 4,
              logoSize + 8,
              logoSize + 8
            );
            
            // Draw logo
            ctx.drawImage(
              logoImg,
              centerX - logoSize/2,
              centerY - logoSize/2,
              logoSize,
              logoSize
            );
            
            resolve(true);
          };
          
          logoImg.onerror = () => {
            // If logo fails to load, continue without it
            resolve(false);
          };
          
          logoImg.src = logoPreview;
        });
      }

      // Download the image
      const pngUrl = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `qr-code-${getSelectedTemplate().name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("QR code downloaded successfully!");
      
    } catch (error) {
      console.error("Download failed:", error);
      
      // Fallback: Use the QRCodeSVG to create a data URL
      try {
        // Create a temporary div to render the QR code
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        document.body.appendChild(tempDiv);
        
        // Render QR code to temp div
        const { QRCodeSVG } = await import('qrcode.react');
        import('react-dom').then((ReactDOM) => {
          ReactDOM.render(
            <QRCodeSVG
              value={qrCodeData}
              size={qrConfig.size}
              bgColor={qrConfig.colorScheme === "custom" ? customColors.light : getSelectedColorScheme().background}
              fgColor={qrConfig.colorScheme === "custom" ? customColors.dark : getSelectedColorScheme().primary}
              level={qrConfig.errorCorrection}
              marginSize={qrConfig.margin}
            />,
            tempDiv
          );
          
          // Give React time to render
          setTimeout(() => {
            const svgElement = tempDiv.querySelector('svg');
            if (svgElement) {
              const svgString = new XMLSerializer().serializeToString(svgElement);
              const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
              const url = URL.createObjectURL(svgBlob);
              
              const link = document.createElement("a");
              link.href = url;
              link.download = `qr-code-${getSelectedTemplate().name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.svg`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              
              toast.success("QR code downloaded as SVG!");
            }
            
            document.body.removeChild(tempDiv);
          }, 100);
        });
      } catch (fallbackError) {
        console.error("Fallback download failed:", fallbackError);
        toast.error("Failed to download QR code. Please try generating it again.");
      }
    }
  }, [qrCodeData, qrConfig, customColors, logoPreview]);

  // Copy QR code to clipboard
  const copyQRCode = async () => {
    if (!qrCodeData) {
      toast.error("Please generate a QR code first");
      return;
    }

    try {
      // Create a canvas to copy as image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        toast.error("Failed to create canvas context");
        return;
      }

      canvas.width = qrConfig.size;
      canvas.height = qrConfig.size;

      // Get colors
      const colorScheme = getSelectedColorScheme();
      const bgColor = qrConfig.colorScheme === "custom" ? customColors.light : colorScheme.background;

      // Fill background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, qrConfig.size, qrConfig.size);

      // Try to get the SVG from the preview
      const qrContainer = qrContainerRef.current;
      if (qrContainer) {
        const svgElement = qrContainer.querySelector('svg');
        if (svgElement) {
          const svgString = new XMLSerializer().serializeToString(svgElement);
          const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(svgBlob);
          
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = () => {
              ctx.drawImage(img, 0, 0, qrConfig.size, qrConfig.size);
              URL.revokeObjectURL(url);
              resolve(true);
            };
            img.onerror = () => {
              URL.revokeObjectURL(url);
              reject(new Error('Failed to load image'));
            };
            img.src = url;
          });
        }
      }

      // Convert canvas to blob and copy
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                'image/png': blob
              })
            ]);
            setCopied(true);
            toast.success("QR code copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
          } catch (error) {
            console.error("Copy to clipboard failed:", error);
            toast.error("Failed to copy QR code");
          }
        }
      }, 'image/png');
    } catch (error) {
      console.error("Copy failed:", error);
      toast.error("Failed to copy QR code");
    }
  };

  // Quick actions
  const quickActions = [
    { label: "Generate QR", icon: <QrCode className="w-4 h-4" />, action: generateQRCode },
    { label: "Download", icon: <Download className="w-4 h-4" />, action: downloadQRCode },
    { label: copied ? "Copied!" : "Copy", icon: copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />, action: copyQRCode },
    { label: "Reset", icon: <RefreshCw className="w-4 h-4" />, action: () => {
      setContent("");
      setQrCodeData("");
      setLogoFile(null);
      setLogoPreview("");
      setFormData({});
      setQrConfig({
        size: 300,
        margin: 4,
        errorCorrection: "H",
        colorScheme: "default",
        includeLogo: false,
        logoSize: 40,
        roundedCorners: true,
        dotStyle: "rounded"
      });
      toast.info("All settings reset");
    }},
  ];

  // Initialize with default template
  useEffect(() => {
    const defaultTemplate = templates[0];
    setContent(defaultTemplate.defaultContent);
    if (defaultTemplate.customForm) {
      const initialData: FormData = {};
      defaultTemplate.customForm.fields.forEach(field => {
        initialData[field.name] = '';
      });
      setFormData(initialData);
    }
  }, []);

  // Render form fields for selected template
  const renderTemplateForm = () => {
    const template = getSelectedTemplate();
    
    if (!template.customForm) {
      return (
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={template.placeholder}
          className="min-h-[120px] bg-slate-800/50 border-slate-700 text-slate-100 hover:border-blue-500/50 transition-all duration-300"
          rows={4}
        />
      );
    }

    return (
      <div className="space-y-4">
        {template.customForm.fields.map((field) => {
          if (field.type === 'select') {
            return (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name} className="text-slate-300 hover:text-white transition-colors">
                  {field.label}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                </Label>
                <Select
                  value={formData[field.name] || ''}
                  onValueChange={(value) => handleFormFieldChange(field.name, value)}
                  required={field.required}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-100 hover:border-blue-500/50 hover:bg-slate-800/70 transition-all duration-300">
                    <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="hover:bg-slate-700/50 transition-colors">
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
                <Label htmlFor={field.name} className="text-slate-300 hover:text-white transition-colors">
                  {field.label}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                </Label>
                <Textarea
                  id={field.name}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleFormFieldChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className="min-h-[100px] bg-slate-800/50 border-slate-700 text-slate-100 hover:border-blue-500/50 transition-all duration-300"
                  required={field.required}
                />
              </div>
            );
          }

          return (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name} className="text-slate-300 hover:text-white transition-colors">
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </Label>
              <Input
                id={field.name}
                type={field.type}
                value={formData[field.name] || ''}
                onChange={(e) => handleFormFieldChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className="bg-slate-800/50 border-slate-700 text-slate-100 hover:border-blue-500/50 hover:bg-slate-800/70 transition-all duration-300"
                required={field.required}
                pattern={field.pattern}
              />
              {field.pattern && (
                <p className="text-xs text-slate-400 hover:text-slate-300 transition-colors">
                  Format: {field.name === 'phone' ? '+1234567890' : 
                          field.name === 'latitude' ? '40.7128' : 
                          field.name === 'longitude' ? '-74.0060' : ''}
                </p>
              )}
            </div>
          );
        })}
        
        {/* Preview of generated content */}
        {content && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700 hover:border-blue-500/30 transition-all duration-300"
          >
            <p className="text-sm text-slate-400 mb-1 hover:text-slate-300 transition-colors">Generated QR Code Content:</p>
            <p className="text-sm text-slate-300 font-mono break-all">{content}</p>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-100">
      <div className="max-w-7xl mx-auto p-4 md:p-0 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 pt-4 md:pt-8"
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

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Panel - Content & Templates */}
          <div className="lg:col-span-2 space-y-6">
            {/* Content Input */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="glass backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-500"
            >
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
                <FileText className="w-5 h-5 text-blue-400" />
                QR Code Content
              </h3>
              
              <div className="space-y-6">
                {/* Template Selection */}
               <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2 text-slate-300">
                    <Zap className="w-4 h-4 text-blue-400" />
                    Quick Templates
                  </h4>

                  {/* Grid */}
                  <motion.div 
                    layout
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
                  >
                    {visibleTemplates.map((template) => (
                      <motion.button
                        key={template.id}
                        layout
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleTemplateSelect(template.id)}
                        className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all duration-300 shadow-lg ${
                          selectedTemplate === template.id
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-2 border-blue-400 shadow-blue-500/30'
                            : 'bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/70 shadow-slate-900/30'
                        }`}
                      >
                        <motion.div 
                          className={`p-2 rounded-lg transition-all duration-300 ${
                            selectedTemplate === template.id
                              ? 'bg-white/20'
                              : 'bg-slate-700/50 hover:bg-slate-600/50'
                          }`}
                          whileHover={{ rotate: 5 }}
                        >
                          {template.icon}
                        </motion.div>
                        <span className="text-sm font-medium text-white">{template.name}</span>
                        <span className="text-xs text-slate-300 text-center">{template.description}</span>
                      </motion.button>
                    ))}
                  </motion.div>

                  {/* Toggle button */}
                  {templates.length > 4 && (
                    <div className="flex justify-center">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowAll(!showAll)}
                        className="text-sm font-medium text-blue-400 hover:text-blue-300 mt-2"
                      >
                        {showAll ? "Show Less" : "Show More"}
                      </motion.button>
                    </div>
                  )}
                </div>


                {/* Content Input Area */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="content" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                      <MessageSquare className="w-4 h-4 text-blue-400" />
                      <span className="font-medium">
                        {getSelectedTemplate().name} Content
                      </span>
                    </Label>
                    <div className="text-sm text-slate-400 hover:text-slate-300 transition-colors">
                      {getSelectedTemplate().description}
                    </div>
                  </div>
                  
                  {renderTemplateForm()}
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-slate-400 hover:text-slate-300 transition-colors">
                      Template: <span className="text-blue-300">{getSelectedTemplate().name}</span>
                    </div>
                    <div className="text-slate-400 hover:text-slate-300 transition-colors">
                      {content.length} characters
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3">
                  {quickActions.map((action, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex-1 min-w-[120px]"
                    >
                      <Button
                        onClick={action.action}
                        disabled={isGenerating && index === 0}
                        className={`w-full transition-all duration-300 ${
                          index === 0 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-blue-500/30'
                            : index === 1
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-emerald-500/30'
                            : index === 2
                            ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg hover:shadow-amber-500/30'
                            : 'bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 shadow-lg hover:shadow-slate-500/30'
                        }`}
                      >
                        {isGenerating && index === 0 ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        ) : (
                          <motion.div
                            whileHover={{ rotate: 15 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            {action.icon}
                          </motion.div>
                        )}
                        <span className="ml-2">{action.label}</span>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* QR Code Preview */}
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="glass backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-500"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2 text-white">
                    <Eye className="w-5 h-5 text-blue-400" />
                    QR Code Preview
                  </h3>
                </div>
                
                <div className="flex flex-col items-center justify-center space-y-6">
                  {/* QR Code Display */}
                  <motion.div 
                    className={`p-8 rounded-2xl transition-all duration-500 ${
                      getSelectedColorScheme().isDark 
                        ? 'bg-gradient-to-br from-slate-900 to-slate-800' 
                        : 'bg-gradient-to-br from-white to-slate-100'
                    } shadow-2xl hover:shadow-3xl hover:shadow-blue-500/10`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="relative" ref={qrContainerRef}>
                      {qrCodeData && (
                        <motion.div 
                          className="relative"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <QRCodeSVG
                            value={qrCodeData}
                            size={qrConfig.size}
                            bgColor={qrConfig.colorScheme === "custom" ? customColors.light : getSelectedColorScheme().background}
                            fgColor={qrConfig.colorScheme === "custom" ? customColors.dark : getSelectedColorScheme().primary}
                            level={qrConfig.errorCorrection}
                            marginSize={qrConfig.margin}
                            className="rounded-lg shadow-2xl"
                          />
                          
                          {/* Logo Overlay */}
                          {qrConfig.includeLogo && logoPreview && (
                            <motion.div 
                              className="absolute inset-0 flex items-center justify-center pointer-events-none"
                              style={{
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                              }}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 200 }}
                            >
                              <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                                <img
                                  src={logoPreview}
                                  alt="Logo"
                                  className="rounded-lg relative z-10 transform group-hover:scale-105 transition-transform duration-300"
                                  style={{
                                    width: qrConfig.logoSize,
                                    height: qrConfig.logoSize,
                                    backgroundColor: getSelectedColorScheme().isDark ? '#1e293b' : '#f8fafc',
                                    padding: '8px',
                                  }}
                                />
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                  
                  {/* Preview Info */}
                  <div className="text-center space-y-2">
                    <p className="text-slate-300">
                      Scan this QR code with your phone camera
                    </p>
                    <div className="flex items-center justify-center gap-4 text-sm text-slate-400">
                      <span className="px-3 py-1 bg-slate-800/50 rounded-full hover:bg-slate-700/50 transition-colors">Size: {qrConfig.size}px</span>
                      <span className="text-blue-400">•</span>
                      <span className="px-3 py-1 bg-slate-800/50 rounded-full hover:bg-slate-700/50 transition-colors">Error Correction: {qrConfig.errorCorrection}</span>
                      <span className="text-blue-400">•</span>
                      <span className="px-3 py-1 bg-slate-800/50 rounded-full hover:bg-slate-700/50 transition-colors">Template: {getSelectedTemplate().name}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Panel - Customization */}
          <div className="space-y-6">
            {/* Color Schemes */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="glass backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-purple-500/30 transition-all duration-500"
            >
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
                <Palette className="w-5 h-5 text-purple-400" />
                Color Schemes
              </h3>
              
              <div className="space-y-6">
                {/* Color Scheme Selection */}
                <div className="space-y-4">
                  <Label className="font-medium text-slate-300 hover:text-white transition-colors">Choose a Color Scheme</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {colorSchemes.map((scheme) => (
                      <motion.button
                        key={scheme.id}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setQrConfig(prev => ({ ...prev, colorScheme: scheme.id }))}
                        className={`p-3 rounded-xl flex flex-col items-center gap-2 border-2 transition-all duration-300 shadow-lg ${
                          qrConfig.colorScheme === scheme.id
                            ? 'border-purple-500 bg-purple-500/10 shadow-purple-500/20'
                            : 'border-slate-700 bg-slate-800/50 hover:border-purple-500/50 hover:bg-slate-800/70 shadow-slate-900/30'
                        }`}
                      >
                        <motion.div 
                          className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center group"
                          whileHover={{ rotate: 5 }}
                        >
                          {scheme.gradient ? (
                            <div 
                              className="w-full h-full"
                              style={{ background: scheme.gradient }}
                            />
                          ) : (
                            <>
                              <div 
                                className="w-full h-full"
                                style={{ backgroundColor: scheme.primary }}
                              />
                              <div 
                                className="w-1/2 h-full"
                                style={{ backgroundColor: scheme.secondary }}
                              />
                            </>
                          )}
                        </motion.div>
                        <span className="text-sm font-medium text-white">{scheme.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Custom Color Picker */}
                {qrConfig.colorScheme === "custom" && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 pt-4 border-t border-slate-700/50"
                  >
                    <Label className="font-medium text-slate-300 hover:text-white transition-colors">Custom Colors</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="darkColor" className="text-sm text-slate-300 hover:text-white transition-colors">QR Color</Label>
                        <div className="flex items-center gap-3">
                          <motion.div whileHover={{ scale: 1.1 }} className="relative group">
                            <input
                              id="darkColor"
                              type="color"
                              value={customColors.dark}
                              onChange={(e) => setCustomColors(prev => ({ ...prev, dark: e.target.value }))}
                              className="w-10 h-10 cursor-pointer rounded-lg overflow-hidden border-2 border-slate-700 hover:border-purple-500 transition-colors"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity" />
                          </motion.div>
                          <Input
                            value={customColors.dark}
                            onChange={(e) => setCustomColors(prev => ({ ...prev, dark: e.target.value }))}
                            className="flex-1 bg-slate-800/50 border-slate-700 text-slate-100 hover:border-purple-500/50 hover:bg-slate-800/70 transition-all"
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lightColor" className="text-sm text-slate-300 hover:text-white transition-colors">Background</Label>
                        <div className="flex items-center gap-3">
                          <motion.div whileHover={{ scale: 1.1 }} className="relative group">
                            <input
                              id="lightColor"
                              type="color"
                              value={customColors.light}
                              onChange={(e) => setCustomColors(prev => ({ ...prev, light: e.target.value }))}
                              className="w-10 h-10 cursor-pointer rounded-lg overflow-hidden border-2 border-slate-700 hover:border-purple-500 transition-colors"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity" />
                          </motion.div>
                          <Input
                            value={customColors.light}
                            onChange={(e) => setCustomColors(prev => ({ ...prev, light: e.target.value }))}
                            className="flex-1 bg-slate-800/50 border-slate-700 text-slate-100 hover:border-purple-500/50 hover:bg-slate-800/70 transition-all"
                            placeholder="#FFFFFF"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* QR Code Settings */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="glass backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/30 transition-all duration-500"
            >
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
                <Settings className="w-5 h-5 text-emerald-400" />
                QR Code Settings
              </h3>
              
              <div className="space-y-6">
                {/* Size Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="size" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                      <Maximize2 className="w-4 h-4 text-emerald-400" />
                      <span>Size: {qrConfig.size}px</span>
                    </Label>
                    <span className={`text-sm px-2 py-1 rounded-full transition-colors ${
                      qrConfig.size < 200 
                        ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30' 
                        : qrConfig.size < 400 
                        ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                        : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                    }`}>
                      {qrConfig.size < 200 ? 'Small' : qrConfig.size < 400 ? 'Medium' : 'Large'}
                    </span>
                  </div>
                  <input
                    id="size"
                    type="range"
                    min="100"
                    max="500"
                    step="10"
                    value={qrConfig.size}
                    onChange={(e) => setQrConfig(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer hover:accent-emerald-500 transition-colors"
                  />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span className="hover:text-slate-300 transition-colors">100px</span>
                    <span className="hover:text-slate-300 transition-colors">300px</span>
                    <span className="hover:text-slate-300 transition-colors">500px</span>
                  </div>
                </div>

                {/* Error Correction */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    Error Correction Level
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["L", "M", "Q", "H"] as const).map((level) => (
                      <motion.div key={level} whileHover={{ scale: 1.05 }}>
                        <Button
                          variant={qrConfig.errorCorrection === level ? "default" : "outline"}
                          size="sm"
                          onClick={() => setQrConfig(prev => ({ ...prev, errorCorrection: level }))}
                          className={`w-full transition-all duration-300 ${
                            qrConfig.errorCorrection === level 
                              ? 'bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-emerald-500/30' 
                              : 'border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/70'
                          }`}
                        >
                          {level}
                          <span className="text-xs ml-1 opacity-80">
                            {level === "L" ? "7%" : level === "M" ? "15%" : level === "Q" ? "25%" : "30%"}
                          </span>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 hover:text-slate-300 transition-colors">
                    Higher levels are more scannable when damaged but create denser codes
                  </p>
                </div>

                {/* Margin */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="margin" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                      <Expand className="w-4 h-4 text-emerald-400" />
                      <span>Margin: {qrConfig.margin}px</span>
                    </Label>
                  </div>
                  <input
                    id="margin"
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={qrConfig.margin}
                    onChange={(e) => setQrConfig(prev => ({ ...prev, margin: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer hover:accent-emerald-500 transition-colors"
                  />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span className="hover:text-slate-300 transition-colors">None</span>
                    <span className="hover:text-slate-300 transition-colors">Normal</span>
                    <span className="hover:text-slate-300 transition-colors">Wide</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Logo Settings */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="hidden glass backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-pink-500/30 transition-all duration-500"
            >
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
                <Image className="w-5 h-5 text-pink-400" />
                Logo Settings
              </h3>
              
              <div className="space-y-6">
                {/* Logo Upload */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="logo" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                      <Upload className="w-4 h-4 text-pink-400" />
                      <span>Add Logo</span>
                    </Label>
                    <Switch
                      id="includeLogo"
                      checked={qrConfig.includeLogo}
                      onCheckedChange={(checked) => setQrConfig(prev => ({ ...prev, includeLogo: checked }))}
                      disabled={!logoFile}
                      className="data-[state=checked]:bg-pink-500 data-[state=checked]:hover:bg-pink-600"
                    />
                  </div>
                  
                  {logoPreview ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-center">
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg blur opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="w-32 h-32 object-contain rounded-lg border-2 border-slate-700 group-hover:border-pink-500 relative z-10 transform group-hover:scale-105 transition-all duration-300"
                          />
                          <motion.div whileHover={{ scale: 1.1 }}>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={removeLogo}
                              className="absolute -top-2 -right-2 w-6 h-6 rounded-full shadow-lg hover:shadow-red-500/30"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                      <p className="text-xs text-center text-slate-400 hover:text-slate-300 transition-colors">
                        PNG recommended • Max 2MB
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:border-pink-500 hover:bg-slate-800/30 transition-all duration-300 group"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <motion.div 
                        className="relative mx-auto mb-3 w-16 h-16"
                        whileHover={{ rotate: 10 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                        <Upload className="w-8 h-8 mx-auto text-slate-400 group-hover:text-pink-400 relative z-10 transition-colors" />
                      </motion.div>
                      <p className="text-sm text-slate-300 group-hover:text-white transition-colors">Click to upload logo</p>
                      <p className="text-xs text-slate-400 mt-1 group-hover:text-slate-300 transition-colors">PNG recommended • Max 2MB</p>
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

                {/* Logo Size */}
                {qrConfig.includeLogo && logoPreview && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 pt-4 border-t border-slate-700/50"
                  >
                    <div className="flex items-center justify-between">
                      <Label htmlFor="logoSize" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                        <Maximize2 className="w-4 h-4 text-pink-400" />
                        <span>Logo Size: {qrConfig.logoSize}px</span>
                      </Label>
                    </div>
                    <input
                      id="logoSize"
                      type="range"
                      min="20"
                      max="80"
                      step="5"
                      value={qrConfig.logoSize}
                      onChange={(e) => setQrConfig(prev => ({ ...prev, logoSize: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer hover:accent-pink-500 transition-colors"
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span className="hover:text-slate-300 transition-colors">Small</span>
                      <span className="hover:text-slate-300 transition-colors">Medium</span>
                      <span className="hover:text-slate-300 transition-colors">Large</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Security Features */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 backdrop-blur-sm rounded-2xl p-6 border border-emerald-700/30 hover:border-emerald-500/50 transition-all duration-500"
            >
              <h4 className="font-semibold mb-4 flex items-center gap-2 text-white">
                <Shield className="w-4 h-4 text-emerald-400" />
                Security & Privacy
              </h4>
              <ul className="space-y-3 text-sm">
                <motion.li 
                  className="flex items-start gap-2 text-slate-300 hover:text-white transition-colors"
                  whileHover={{ x: 5 }}
                >
                  <Lock className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>All generation happens locally in your browser</span>
                </motion.li>
                <motion.li 
                  className="flex items-start gap-2 text-slate-300 hover:text-white transition-colors"
                  whileHover={{ x: 5 }}
                >
                  <CloudOff className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>No data uploaded to external servers</span>
                </motion.li>
                <motion.li 
                  className="flex items-start gap-2 text-slate-300 hover:text-white transition-colors"
                  whileHover={{ x: 5 }}
                >
                  <Check className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Your content never leaves your device</span>
                </motion.li>
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Information Sections */}
        <div className="space-y-8 mt-8">
          {/* QR Code Guide */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-500"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-white">
              <QrCodeIcon className="w-6 h-6 text-blue-400" />
              QR Code Best Practices
            </h2>
            <div className="space-y-4 text-slate-300">
              <p>
                QR codes are powerful tools for bridging physical and digital worlds. Follow these best practices 
                for optimal results:
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <motion.div 
                  className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Optimal Size
                  </h4>
                  <p className="text-sm text-slate-400 hover:text-slate-300 transition-colors">
                    Minimum 2x2 cm (0.8x0.8 in) for print, 200+ pixels for digital
                  </p>
                </motion.div>
                <motion.div 
                  className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-emerald-500/50 hover:bg-slate-800/50 transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  <h4 className="font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                    <Scan className="w-4 h-4" />
                    Scan Testing
                  </h4>
                  <p className="text-sm text-slate-400 hover:text-slate-300 transition-colors">
                    Always test QR codes with multiple devices and scanning apps
                  </p>
                </motion.div>
                <motion.div 
                  className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-purple-500/50 hover:bg-slate-800/50 transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  <h4 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
                    <Stamp className="w-4 h-4" />
                    Color Contrast
                  </h4>
                  <p className="text-sm text-slate-400 hover:text-slate-300 transition-colors">
                    Ensure high contrast between QR code and background colors
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.section>

          {/* FAQ Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="glass rounded-2xl p-6 border border-slate-700/50 hover:border-purple-500/30 transition-all duration-500"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
              <HelpCircle className="w-6 h-6 text-purple-400" />
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div 
                  key={index} 
                  className="border-b border-slate-700/50 last:border-b-0 hover:border-purple-500/30 transition-colors"
                  whileHover={{ x: 5 }}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between py-4 text-left hover:text-white transition-colors group"
                  >
                    <h4 className="font-semibold text-lg pr-4 text-slate-300 group-hover:text-white">
                      {faq.question}
                    </h4>
                    <motion.div
                      animate={{ rotate: openFaqIndex === index ? 90 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronRight 
                        className="w-6 h-6 text-purple-400 group-hover:text-purple-300 transition-colors"
                      />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {openFaqIndex === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="text-slate-400 text-base pb-4 hover:text-slate-300 transition-colors">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}