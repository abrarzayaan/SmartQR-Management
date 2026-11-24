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
  Info,
} from "lucide-react";
import { useStudioStore } from "@/lib/store";
import { ContentType, QRType } from "@/lib/types";

const CONTENT_TABS: { id: ContentType; label: string; icon: React.ElementType }[] = [
  { id: "url", label: "Website", icon: Globe },
  { id: "vcard", label: "vCard Plus", icon: Contact },
  { id: "wifi", label: "Wi-Fi Pass", icon: Wifi },
  { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
  { id: "email", label: "Email", icon: Mail },
  { id: "sms", label: "SMS", icon: Smartphone },
  { id: "maps", label: "Location", icon: MapPin },
  { id: "applink", label: "App Link", icon: ExternalLink },
  { id: "text", label: "Text", icon: AlignLeft },
];

export function ContentSection() {
  const {
    title,
    content_type,
    qr_type,
    target_url,
    setField,
  } = useStudioStore();

  // Local helper states for composite types
  const [vcard, setVcard] = useState({
    firstName: "Sarah",
    lastName: "Connor",
    org: "Cyberdyne Systems",
    title: "Chief Technology Officer",
    phone: "+1 555 019 2834",
    email: "sarah@cyberdyne.io",
    website: "https://cyberdyne.io",
    note: "Connect for enterprise inquiries",
  });

  const [wifi, setWifi] = useState({
    ssid: "Office_Guest_5G",
    encryption: "WPA",
    password: "SuperSecretPassword123",
    hidden: false,
  });

  const [whatsapp, setWhatsapp] = useState({
    phone: "15551234567",
    message: "Hi, I scanned your QR code and would like more details!",
  });

  const [emailState, setEmailState] = useState({
    to: "support@smartqr.io",
    subject: "Inquiry from Smart QR Code",
    body: "Hello team, I would like to learn more about your services.",
  });

  const [smsState, setSmsState] = useState({
    phone: "15559876543",
    message: "CONFIRM 1024",
  });

  const [mapsState, setMapsState] = useState({
    query: "Googleplex, Mountain View, CA",
  });

  const [appLinkState, setAppLinkState] = useState({
    scheme: "instagram://user?username=antigravity",
    fallback: "https://instagram.com/antigravity",
  });

  const [rawText, setRawText] = useState("Scan verified: SmartQR Engine 2.0");

  // Synchronize target_url when payload fields change
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

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm space-y-5">
      {/* Title & Type Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
            QR Campaign Name
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="e.g. Summer Promo 2026, VIP Wi-Fi Pass"
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/80 transition-all font-medium"
          />
        </div>

        {/* Dynamic vs Static Toggle */}
        <div className="flex flex-col">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
            Routing Mode
          </label>
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              type="button"
              onClick={() => setField("qr_type", "dynamic")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                qr_type === "dynamic"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Dynamic (Trackable)
            </button>
            <button
              type="button"
              onClick={() => setField("qr_type", "static")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                qr_type === "static"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Static (Direct)
            </button>
          </div>
        </div>
      </div>

      {/* Content Type Selector Tabs */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
          Payload Category
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5">
          {CONTENT_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = content_type === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setField("content_type", tab.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                  isActive
                    ? "bg-blue-600/15 border-blue-500/80 text-blue-400 shadow-sm shadow-blue-500/10"
                    : "bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <Icon className="h-4 w-4 mb-1" />
                <span className="text-[11px] font-medium leading-none">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Fields Based on Selected Content Type */}
      <div className="pt-2">
        {content_type === "url" && (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-300">Destination Web URL</label>
            <div className="relative">
              <input
                type="url"
                value={target_url}
                onChange={(e) => setField("target_url", e.target.value)}
                placeholder="https://yourwebsite.com/landing"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/80"
              />
            </div>
            {qr_type === "dynamic" && (
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                Dynamic routing is enabled: Scans are logged with telemetry, and destination can be edited anytime without re-printing.
              </p>
            )}
          </div>
        )}

        {content_type === "vcard" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 mb-1 block">First Name</label>
              <input
                type="text"
                value={vcard.firstName}
                onChange={(e) => setVcard({ ...vcard, firstName: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 mb-1 block">Last Name</label>
              <input
                type="text"
                value={vcard.lastName}
                onChange={(e) => setVcard({ ...vcard, lastName: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 mb-1 block">Organization / Company</label>
              <input
                type="text"
                value={vcard.org}
                onChange={(e) => setVcard({ ...vcard, org: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 mb-1 block">Job Title</label>
              <input
                type="text"
                value={vcard.title}
                onChange={(e) => setVcard({ ...vcard, title: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 mb-1 block">Phone Number</label>
              <input
                type="text"
                value={vcard.phone}
                onChange={(e) => setVcard({ ...vcard, phone: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 mb-1 block">Email Address</label>
              <input
                type="email"
                value={vcard.email}
                onChange={(e) => setVcard({ ...vcard, email: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-slate-400 mb-1 block">Website</label>
              <input
                type="url"
                value={vcard.website}
                onChange={(e) => setVcard({ ...vcard, website: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>
        )}

        {content_type === "wifi" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 mb-1 block">Network Name (SSID)</label>
              <input
                type="text"
                value={wifi.ssid}
                onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
                placeholder="Office_Wi-Fi_5G"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 mb-1 block">Encryption Type</label>
              <select
                value={wifi.encryption}
                onChange={(e) => setWifi({ ...wifi, encryption: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white"
              >
                <option value="WPA">WPA / WPA2 / WPA3 (Standard)</option>
                <option value="WEP">WEP (Legacy)</option>
                <option value="nopass">None (Open Network)</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-slate-400 mb-1 block">Password</label>
              <input
                type="text"
                value={wifi.password}
                onChange={(e) => setWifi({ ...wifi, password: e.target.value })}
                placeholder="Password"
                disabled={wifi.encryption === "nopass"}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono disabled:opacity-50"
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="hidden-wifi"
                checked={wifi.hidden}
                onChange={(e) => setWifi({ ...wifi, hidden: e.target.checked })}
                className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
              />
              <label htmlFor="hidden-wifi" className="text-slate-300">
                Hidden Network (Do not broadcast SSID)
              </label>
            </div>
          </div>
        )}

        {content_type === "whatsapp" && (
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 mb-1 block">Phone Number (with Country Code, no + or spaces)</label>
              <input
                type="text"
                value={whatsapp.phone}
                onChange={(e) => setWhatsapp({ ...whatsapp, phone: e.target.value })}
                placeholder="15551234567"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 mb-1 block">Pre-filled Chat Message</label>
              <textarea
                value={whatsapp.message}
                onChange={(e) => setWhatsapp({ ...whatsapp, message: e.target.value })}
                rows={3}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white resize-none"
              />
            </div>
          </div>
        )}

        {content_type === "email" && (
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 mb-1 block">Recipient Email</label>
              <input
                type="email"
                value={emailState.to}
                onChange={(e) => setEmailState({ ...emailState, to: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 mb-1 block">Subject</label>
              <input
                type="text"
                value={emailState.subject}
                onChange={(e) => setEmailState({ ...emailState, subject: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 mb-1 block">Message Body</label>
              <textarea
                value={emailState.body}
                onChange={(e) => setEmailState({ ...emailState, body: e.target.value })}
                rows={3}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white resize-none"
              />
            </div>
          </div>
        )}

        {content_type === "sms" && (
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 mb-1 block">Phone Number</label>
              <input
                type="text"
                value={smsState.phone}
                onChange={(e) => setSmsState({ ...smsState, phone: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 mb-1 block">SMS Text</label>
              <textarea
                value={smsState.message}
                onChange={(e) => setSmsState({ ...smsState, message: e.target.value })}
                rows={2}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white resize-none"
              />
            </div>
          </div>
        )}

        {content_type === "maps" && (
          <div className="space-y-2 text-xs">
            <label className="text-slate-400 mb-1 block">Location / Address / Coordinates</label>
            <input
              type="text"
              value={mapsState.query}
              onChange={(e) => setMapsState({ ...mapsState, query: e.target.value })}
              placeholder="e.g. 1600 Amphitheatre Parkway, Mountain View, CA"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
            />
          </div>
        )}

        {content_type === "applink" && (
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 mb-1 block">App URI Scheme</label>
              <input
                type="text"
                value={appLinkState.scheme}
                onChange={(e) => setAppLinkState({ ...appLinkState, scheme: e.target.value })}
                placeholder="instagram://user?username=antigravity"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 mb-1 block">Web Fallback URL (if app not installed)</label>
              <input
                type="url"
                value={appLinkState.fallback}
                onChange={(e) => setAppLinkState({ ...appLinkState, fallback: e.target.value })}
                placeholder="https://instagram.com/antigravity"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>
        )}

        {content_type === "text" && (
          <div className="space-y-2 text-xs">
            <label className="text-slate-400 mb-1 block">Plain Text / Serial Key / Raw Content</label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={4}
              placeholder="Enter text payload..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono resize-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}

