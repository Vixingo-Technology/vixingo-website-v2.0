"use client";

import { PortalShell } from "@/components/layout/PortalShell";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/FormElements";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [companySettings, setCompanySettings] = useState({
    companyName: "Vixingo",
    tagline: "Your Vision, Our Execution",
    contactEmail: "hello@vixingo.com",
    website: "https://vixingo.com",
    description:
      "AI Automation, Full-Stack Development, and AI Integration. We engineer systems that transform how businesses operate.",
  });

  const [socialLinks, setSocialLinks] = useState({
    linkedin: "https://linkedin.com/company/vixingo",
    github: "https://github.com/vixingo",
    twitter: "https://twitter.com/vixingo",
  });

  const [notifications, setNotifications] = useState({
    newSubmission: true,
    newWaitlist: true,
    taskAssigned: true,
    weeklyDigest: false,
  });

  const [chatbotSettings, setChatbotSettings] = useState({
    enabled: true,
    welcomeMessage: "Hey there! 👋 I'm the Vixingo AI assistant. How can I help you today?",
    personality: "professional",
  });

  const handleSaveGeneral = () => {
    toast.success("Company settings saved!");
  };

  const handleSaveSocial = () => {
    toast.success("Social links updated!");
  };

  const handleSaveNotifications = () => {
    toast.success("Notification preferences saved!");
  };

  const handleSaveChatbot = () => {
    toast.success("Chatbot settings updated!");
  };

  return (
    <PortalShell>
      <div className="space-y-8 max-w-3xl">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-text-primary">Settings</h1>
          <p className="text-text-secondary text-sm mt-1">Manage your platform configuration.</p>
        </div>

        {/* General Settings */}
        <section className="bg-bg-secondary border border-bg-border rounded-lg p-6 space-y-4">
          <h2 className="font-heading font-bold text-text-primary text-lg">General</h2>
          <Input
            label="Company Name"
            value={companySettings.companyName}
            onChange={(e) => setCompanySettings({ ...companySettings, companyName: e.target.value })}
          />
          <Input
            label="Tagline"
            value={companySettings.tagline}
            onChange={(e) => setCompanySettings({ ...companySettings, tagline: e.target.value })}
          />
          <Input
            label="Contact Email"
            type="email"
            value={companySettings.contactEmail}
            onChange={(e) => setCompanySettings({ ...companySettings, contactEmail: e.target.value })}
          />
          <Input
            label="Website URL"
            value={companySettings.website}
            onChange={(e) => setCompanySettings({ ...companySettings, website: e.target.value })}
          />
          <Textarea
            label="Company Description"
            value={companySettings.description}
            onChange={(e) => setCompanySettings({ ...companySettings, description: e.target.value })}
          />
          <div className="flex justify-end">
            <Button variant="primary" onClick={handleSaveGeneral}>Save Changes</Button>
          </div>
        </section>

        {/* Social Links */}
        <section className="bg-bg-secondary border border-bg-border rounded-lg p-6 space-y-4">
          <h2 className="font-heading font-bold text-text-primary text-lg">Social Links</h2>
          <Input
            label="LinkedIn"
            value={socialLinks.linkedin}
            onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
            placeholder="https://linkedin.com/company/..."
          />
          <Input
            label="GitHub"
            value={socialLinks.github}
            onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
            placeholder="https://github.com/..."
          />
          <Input
            label="Twitter / X"
            value={socialLinks.twitter}
            onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
            placeholder="https://twitter.com/..."
          />
          <div className="flex justify-end">
            <Button variant="primary" onClick={handleSaveSocial}>Save Links</Button>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-bg-secondary border border-bg-border rounded-lg p-6 space-y-4">
          <h2 className="font-heading font-bold text-text-primary text-lg">Email Notifications</h2>
          {[
            { key: "newSubmission", label: "New contact form submission", desc: "Get notified when someone fills out the contact form" },
            { key: "newWaitlist", label: "New waitlist signup", desc: "Get notified for each new SaaS waitlist entry" },
            { key: "taskAssigned", label: "Task assigned to you", desc: "Get notified when a task is assigned to you" },
            { key: "weeklyDigest", label: "Weekly digest", desc: "Receive a summary email every Monday" },
          ].map((item) => (
            <label key={item.key} className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-bg-elevated transition-colors">
              <input
                type="checkbox"
                checked={notifications[item.key as keyof typeof notifications]}
                onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                className="mt-1 accent-[var(--accent-gold)]"
              />
              <div>
                <p className="text-sm font-medium text-text-primary">{item.label}</p>
                <p className="text-xs text-text-muted">{item.desc}</p>
              </div>
            </label>
          ))}
          <div className="flex justify-end">
            <Button variant="primary" onClick={handleSaveNotifications}>Save Preferences</Button>
          </div>
        </section>

        {/* Chatbot Settings */}
        <section className="bg-bg-secondary border border-bg-border rounded-lg p-6 space-y-4">
          <h2 className="font-heading font-bold text-text-primary text-lg">AI Chatbot</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={chatbotSettings.enabled}
              onChange={(e) => setChatbotSettings({ ...chatbotSettings, enabled: e.target.checked })}
              className="accent-[var(--accent-gold)]"
            />
            <span className="text-sm text-text-primary">Enable chatbot on public pages</span>
          </label>
          <Textarea
            label="Welcome Message"
            value={chatbotSettings.welcomeMessage}
            onChange={(e) => setChatbotSettings({ ...chatbotSettings, welcomeMessage: e.target.value })}
          />
          <div className="flex justify-end">
            <Button variant="primary" onClick={handleSaveChatbot}>Save Chatbot Settings</Button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="border border-red-500/30 rounded-lg p-6 space-y-4">
          <h2 className="font-heading font-bold text-red-400 text-lg">Danger Zone</h2>
          <p className="text-sm text-text-muted">These actions are irreversible.</p>
          <div className="flex gap-3">
            <Button
              variant="danger"
              onClick={() => toast.error("This action is disabled in demo mode")}
            >
              Reset All Data
            </Button>
            <Button
              variant="danger"
              onClick={() => toast.error("This action is disabled in demo mode")}
            >
              Delete All Submissions
            </Button>
          </div>
        </section>
      </div>
    </PortalShell>
  );
}
