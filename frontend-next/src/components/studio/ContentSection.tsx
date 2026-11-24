"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  Contact,
  Wifi,
  MessageSquare,
  Mail,
  Smartphone,
  MapPin,
  ExternalLink,
  AlignLeft,
  ChevronDown,
  ChevronUp,
  Zap,
  Shield,
} from "lucide-react";
import { useStudioStore } from "@/lib/store";
import { ContentType } from "@/lib/types";
import { Input, Textarea, Select, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const PRIMARY_TYPES: { id: ContentType; label: string; icon: React.ElementType }[] = [
  { id: "url", label: "Website", icon: Globe },
  { id: "wifi", label: "Wi-Fi", icon: Wifi },
  { id: "vcard", label: "Contact Card", icon: Contact },
  { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
  { id: "text", label: "Plain Text", icon: AlignLeft },
];

const MORE_TYPES: { id: ContentType; label: string; icon: React.ElementType }[] = [
  { id: "email", label: "Email", icon: Mail },
  { id: "sms", label: "SMS", icon: Smartphone },
  { id: "maps", label: "Location", icon: MapPin },
  { id: "applink", label: "App Link", icon: ExternalLink },
];

export function ContentSection() {
  const { title, content_type, qr_type, target_url, setField } = useStudioStore();
  const [showMoreTypes, setShowMoreTypes] = useState(
    MORE_TYPES.some((t) => t.id === content_type)
  );

  const [vcard, setVcard] = useState({
    firstName: "Sarah",
    lastName: "Connor",
    org: "Acme Studio",
    title: "Product Designer",
    phone: "+1 555 019 2834",
    email: "sarah@acme.io",
    website: "https://acme.io",
    note: "",
  });

  const [wifi, setWifi] = useState({
    ssid: "Office_Guest_5G",
    encryption: "WPA",
    password: "GuestPassword123",
    hidden: false,
  });

  const [whatsapp, setWhatsapp] = useState({
    phone: "8801700000000",
    message: "Hello! I scanned your QR code.",
  });

  const [emailState, setEmailState] = useState({
    to: "hello@example.com",
    subject: "Quick inquiry",
    body: "Hi team, I would like to learn more.",
  });

  const [smsState, setSmsState] = useState({
    phone: "+15559876543",
    message: "Hi there!",
  });

  const [mapsState, setMapsState] = useState({
    query: "Gulshan 2, Dhaka, Bangladesh",
  });

  const [appLinkState, setAppLinkState] = useState({
    scheme: "instagram://user?username=smartqr",
    fallback: "https://instagram.com/smartqr",
  });

  const [rawText, setRawText] = useState("Hello from SmartQR!");

  useEffect(() => {
    let payload = target_url;
    if (content_type === "vcard") {
      payload = `BEGIN:VCARD\nVERSION:3.0\nN:${vcard.lastName};${vcard.firstName};;;\nFN:${vcard.firstName} ${vcard.lastName}\nORG:${vcard.org}\nTITLE:${vcard.title}\nTEL:${vcard.phone}\nEMAIL:${vcard.email}\nURL:${vcard.website}\nNOTE:${vcard.note}\nEND:VCARD`;
    } else if (content_type === "wifi") {
      payload = `WIFI:T:${wifi.encryption};S:${wifi.ssid};P:${wifi.password};H:${wifi.hidden ? "true" : "false"};;`;
    } else if (content_type === "whatsapp") {
      const cleanPhone = whatsapp.phone.replace(/[^0-9]/g, "");
      payload = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsapp.message)}`;
    } else if (content_type === "email") {
      payload = `mailto:${emailState.to}?subject=${encodeURIComponent(emailState.subject)}&body=${encodeURIComponent(emailState.body)}`;
    } else if (content_type === "sms") {
      payload = `sms:${smsState.phone}?body=${encodeURIComponent(smsState.message)}`;
    } else if (content_type === "maps") {
      payload = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsState.query)}`;
    } else if (content_type === "applink") {
      payload = appLinkState.fallback || appLinkState.scheme;
    } else if (content_type === "text") {
      payload = rawText;
    }

    if (payload !== target_url && content_type !== "url") {
      setField("target_url", payload);
    }
  }, [content_type, vcard, wifi, whatsapp, emailState, smsState, mapsState, appLinkState, rawText]);

  const visibleTypes = showMoreTypes ? [...PRIMARY_TYPES, ...MORE_TYPES] : PRIMARY_TYPES;

  return (
    <div className="space-y-6">
      {/* QR Type Selection */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="mb-0">What should this QR code open?</Label>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setShowMoreTypes(!showMoreTypes)}
            rightIcon={showMoreTypes ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          >
            {showMoreTypes ? "Less types" : "More types"}
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {visibleTypes.map((tab) => {
            const Icon = tab.icon;
            const isActive = content_type === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setField("content_type", tab.id)}
                className={cn(
                  "flex items-center justify-center sm:flex-col gap-2 sm:gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all",
                  isActive
                    ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Campaign Name */}
      <div>
        <Label htmlFor="qr-title">QR Code Name</Label>
        <Input
          id="qr-title"
          value={title}
          onChange={(e) => setField("title", e.target.value)}
          placeholder="e.g. Restaurant Menu, Office Wi-Fi, Business Card"
        />
      </div>

      {/* Dynamic Payload Fields */}
      <div className="pt-1">
        {content_type === "url" && (
          <div>
            <Label htmlFor="target-url">Destination Website URL</Label>
            <Input
              id="target-url"
              type="url"
              value={target_url}
              onChange={(e) => setField("target_url", e.target.value)}
              placeholder="https://yourwebsite.com"
              className="font-mono text-xs"
            />
          </div>
        )}

        {content_type === "vcard" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <Label>First Name</Label>
              <Input
                value={vcard.firstName}
                onChange={(e) => setVcard({ ...vcard, firstName: e.target.value })}
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={vcard.lastName}
                onChange={(e) => setVcard({ ...vcard, lastName: e.target.value })}
              />
            </div>
            <div>
              <Label>Company</Label>
              <Input
                value={vcard.org}
                onChange={(e) => setVcard({ ...vcard, org: e.target.value })}
              />
            </div>
            <div>
              <Label>Job Title</Label>
              <Input
                value={vcard.title}
                onChange={(e) => setVcard({ ...vcard, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={vcard.phone}
                onChange={(e) => setVcard({ ...vcard, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={vcard.email}
                onChange={(e) => setVcard({ ...vcard, email: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Website</Label>
              <Input
                type="url"
                value={vcard.website}
                onChange={(e) => setVcard({ ...vcard, website: e.target.value })}
              />
            </div>
          </div>
        )}

        {content_type === "wifi" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <Label>Network Name (SSID)</Label>
              <Input
                value={wifi.ssid}
                onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
                placeholder="Office_WiFi"
              />
            </div>
            <div>
              <Label>Security Type</Label>
              <Select
                value={wifi.encryption}
                onChange={(e) => setWifi({ ...wifi, encryption: e.target.value })}
              >
                <option value="WPA">WPA / WPA2 / WPA3</option>
                <option value="WEP">WEP</option>
                <option value="nopass">Open (No Password)</option>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Wi-Fi Password</Label>
              <Input
                value={wifi.password}
                onChange={(e) => setWifi({ ...wifi, password: e.target.value })}
                disabled={wifi.encryption === "nopass"}
                placeholder="Enter network password"
              />
            </div>
            <label className="sm:col-span-2 flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={wifi.hidden}
                onChange={(e) => setWifi({ ...wifi, hidden: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
              />
              <span>Hidden network (SSID is not broadcast)</span>
            </label>
          </div>
        )}

        {content_type === "whatsapp" && (
          <div className="space-y-3.5">
            <div>
              <Label>WhatsApp Number (with country code)</Label>
              <Input
                value={whatsapp.phone}
                onChange={(e) => setWhatsapp({ ...whatsapp, phone: e.target.value })}
                placeholder="8801700000000"
              />
            </div>
            <div>
              <Label>Pre-filled Message</Label>
              <Textarea
                rows={3}
                value={whatsapp.message}
                onChange={(e) => setWhatsapp({ ...whatsapp, message: e.target.value })}
              />
            </div>
          </div>
        )}

        {content_type === "email" && (
          <div className="space-y-3.5">
            <div>
              <Label>Recipient Email</Label>
              <Input
                type="email"
                value={emailState.to}
                onChange={(e) => setEmailState({ ...emailState, to: e.target.value })}
              />
            </div>
            <div>
              <Label>Subject</Label>
              <Input
                value={emailState.subject}
                onChange={(e) => setEmailState({ ...emailState, subject: e.target.value })}
              />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                rows={3}
                value={emailState.body}
                onChange={(e) => setEmailState({ ...emailState, body: e.target.value })}
              />
            </div>
          </div>
        )}

        {content_type === "sms" && (
          <div className="space-y-3.5">
            <div>
              <Label>Phone Number</Label>
              <Input
                value={smsState.phone}
                onChange={(e) => setSmsState({ ...smsState, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>SMS Message</Label>
              <Textarea
                rows={2}
                value={smsState.message}
                onChange={(e) => setSmsState({ ...smsState, message: e.target.value })}
              />
            </div>
          </div>
        )}

        {content_type === "maps" && (
          <div>
            <Label>Address or Place Name</Label>
            <Input
              value={mapsState.query}
              onChange={(e) => setMapsState({ ...mapsState, query: e.target.value })}
              placeholder="e.g. Gulshan 2, Dhaka"
            />
          </div>
        )}

        {content_type === "applink" && (
          <div className="space-y-3.5">
            <div>
              <Label>App Deep Link URI</Label>
              <Input
                value={appLinkState.scheme}
                onChange={(e) => setAppLinkState({ ...appLinkState, scheme: e.target.value })}
                placeholder="instagram://user?username=yourhandle"
                className="font-mono text-xs"
              />
            </div>
            <div>
              <Label>Web Fallback URL</Label>
              <Input
                type="url"
                value={appLinkState.fallback}
                onChange={(e) => setAppLinkState({ ...appLinkState, fallback: e.target.value })}
                placeholder="https://instagram.com/yourhandle"
                className="font-mono text-xs"
              />
            </div>
          </div>
        )}

        {content_type === "text" && (
          <div>
            <Label>Text Content</Label>
            <Textarea
              rows={4}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Write any text or code..."
            />
          </div>
        )}
      </div>

      {/* Simple Dynamic vs Static Mode Cards */}
      <div className="pt-2 border-t border-gray-100">
        <Label>QR Mode</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setField("qr_type", "dynamic")}
            className={cn(
              "flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all",
              qr_type === "dynamic"
                ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/10"
                : "border-gray-200 bg-white hover:border-gray-300"
            )}
          >
            <div
              className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                qr_type === "dynamic" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
              )}
            >
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-900">Dynamic (Recommended)</div>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                Edit destination anytime & track live scan analytics.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setField("qr_type", "static")}
            className={cn(
              "flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all",
              qr_type === "static"
                ? "border-gray-900 bg-gray-50 ring-2 ring-gray-900/10"
                : "border-gray-200 bg-white hover:border-gray-300"
            )}
          >
            <div
              className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                qr_type === "static" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"
              )}
            >
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-900">Static (Direct)</div>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                Encodes data directly. Works offline, cannot be edited later.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
