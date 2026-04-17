"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X, User, Shield, Settings2, Moon, Globe, Search, Mail, Volume2, Trash2, LogOut, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserSettings {
  theme: "light" | "dark" | "system";
  language: "en" | "es" | "fr" | "de";
  defaultModel: "gemini" | "deepseek" | "llama";
  webSearchEnabled: boolean;
  emailNotifications: boolean;
  browserNotifications: boolean;
  soundEnabled: boolean;
  saveHistory: boolean;
  analytics: boolean;
}

export default function SettingsModal({ open, onOpenChange }: Props) {
  const [activeTab, setActiveTab] = useState("profile");
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  
  // Loading states
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);

  // Profile state
  const [displayName, setDisplayName] = useState("");

  // Settings state
  const [settings, setSettings] = useState<UserSettings>({
    theme: "light",
    language: "en",
    defaultModel: "gemini",
    webSearchEnabled: true,
    emailNotifications: true,
    browserNotifications: false,
    soundEnabled: true,
    saveHistory: true,
    analytics: true,
  });

  // Load user settings when modal opens
  useEffect(() => {
    if (open && session?.user) {
      setDisplayName(session.user.name || "");
      loadSettings();
    }
  }, [open, session]);

  const loadSettings = async () => {
    setIsLoadingSettings(true);
    try {
      const response = await fetch("/api/user/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const getUserInitials = () => {
    if (!session?.user?.name) return "U";
    return session.user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      let profileUpdated = false;
      
      if (displayName !== session?.user?.name) {
        const profileResponse = await fetch("/api/user/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: displayName }),
        });

        if (profileResponse.ok) {
          profileUpdated = true;
        } else {
          const error = await profileResponse.json();
          alert(`Failed to update profile: ${error.error}`);
          setIsSaving(false);
          return;
        }
      }

      const settingsResponse = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (settingsResponse.ok) {
        alert("Settings saved successfully!");
        if (profileUpdated) {
          window.location.reload();
        } else {
          onOpenChange(false);
        }
      } else {
        const error = await settingsResponse.json();
        alert(`Failed to save settings: ${error.error}`);
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ redirect: false });
      router.push("/login");
      onOpenChange(false);
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone and will delete all your data.")) {
      return;
    }

    const confirmText = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmText !== "DELETE") {
      alert("Account deletion cancelled.");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Account deleted successfully.");
        await signOut({ redirect: false });
        router.push("/login");
        onOpenChange(false);
      } else {
        const error = await response.json();
        alert(`Failed to delete account: ${error.error}`);
      }
    } catch (error) {
      console.error("Delete account error:", error);
      alert("Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to clear all chat history? This action cannot be undone.")) {
      return;
    }

    setIsClearing(true);
    try {
      const response = await fetch("/api/user/clear-history", {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Chat history cleared! Deleted ${data.deletedConversations} conversations and ${data.deletedMessages} messages.`);
        // Refresh the page to update sidebar
        router.refresh();
      } else {
        const error = await response.json();
        alert(`Failed to clear history: ${error.error}`);
      }
    } catch (error) {
      console.error("Clear history error:", error);
      alert("Failed to clear history. Please try again.");
    } finally {
      setIsClearing(false);
    }
  };

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-[#0f172a]/20 backdrop-blur-sm z-[60] transition-opacity cursor-none" />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-white border border-[#e2e8f0] rounded-2xl w-[90vw] max-w-3xl h-[650px] max-h-[85vh] z-[70] shadow-2xl focus:outline-none flex overflow-hidden cursor-none [&_*]:cursor-none">
          
          <div className="w-56 bg-[#f8fafc] border-r border-[#e2e8f0] p-4 flex flex-col">
            <h2 className="text-[14px] font-bold text-[#0f172a] mb-4 px-2">Settings</h2>
            
            <div className="space-y-1">
              <button 
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${activeTab === "profile" ? "bg-[#e0e7f1] text-[#3b82f6]" : "text-[#475569] hover:bg-white hover:text-[#0f172a]"}`}
              >
                <User size={16} /> Profile
              </button>
              <button 
                onClick={() => setActiveTab("preferences")}
                className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${activeTab === "preferences" ? "bg-[#e0e7f1] text-[#3b82f6]" : "text-[#475569] hover:bg-white hover:text-[#0f172a]"}`}
              >
                <Settings2 size={16} /> Preferences
              </button>
              <button 
                onClick={() => setActiveTab("notifications")}
                className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${activeTab === "notifications" ? "bg-[#e0e7f1] text-[#3b82f6]" : "text-[#475569] hover:bg-white hover:text-[#0f172a]"}`}
              >
                <Mail size={16} /> Notifications
              </button>
              <button 
                onClick={() => setActiveTab("privacy")}
                className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${activeTab === "privacy" ? "bg-[#e0e7f1] text-[#3b82f6]" : "text-[#475569] hover:bg-white hover:text-[#0f172a]"}`}
              >
                <Shield size={16} /> Privacy & Security
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-white">
            <div className="flex justify-between items-center p-4 border-b border-[#e2e8f0]">
                <Dialog.Title className="text-[15px] font-semibold text-[#0f172a] capitalize">
                    {activeTab === "privacy" ? "Privacy & Security" : activeTab}
                </Dialog.Title>
                <Dialog.Close asChild>
                    <button className="text-[#94a3b8] hover:text-[#0f172a] transition-colors p-1 rounded-md hover:bg-slate-50">
                      <X size={18} />
                    </button>
                </Dialog.Close>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
                {isLoadingSettings && activeTab !== "profile" ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="animate-spin text-[#3b82f6]" size={24} />
                  </div>
                ) : (
                  <>
                    {activeTab === "profile" && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                {session?.user?.image ? (
                                  <img 
                                    src={session.user.image} 
                                    alt={session.user.name || "User"} 
                                    className="w-16 h-16 rounded-full"
                                  />
                                ) : (
                                  <div className="w-16 h-16 rounded-full bg-[#3b82f6] flex items-center justify-center text-white text-2xl font-bold">
                                    {getUserInitials()}
                                  </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[12px] font-semibold text-[#475569] mb-1.5">Display Name</label>
                                    <input 
                                      type="text" 
                                      value={displayName}
                                      onChange={(e) => setDisplayName(e.target.value)}
                                      className="w-full max-w-sm px-3 py-2 border border-[#cbd5e1] rounded-lg text-[13px] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-semibold text-[#475569] mb-1.5">Email Address</label>
                                    <input 
                                      type="email" 
                                      value={session?.user?.email || ""} 
                                      className="w-full max-w-sm px-3 py-2 border border-[#cbd5e1] rounded-lg text-[13px] bg-gray-50 cursor-not-allowed" 
                                      disabled
                                    />
                                    <p className="text-[11px] text-[#94a3b8] mt-1">Email cannot be changed</p>
                                </div>
                                <div>
                                    <label className="block text-[12px] font-semibold text-[#475569] mb-1.5">Account Type</label>
                                    <div className="flex items-center gap-2">
                                      <span className="px-3 py-1.5 bg-[#f0f9ff] text-[#0284c7] text-[12px] font-medium rounded-md border border-[#bae6fd]">
                                        {session?.user?.email?.includes("@") ? "Email Account" : "OAuth Account"}
                                      </span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-[#e2e8f0]">
                              <button 
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-colors disabled:opacity-50"
                              >
                                {isLoggingOut ? <Loader2 className="animate-spin" size={16} /> : <LogOut size={16} />}
                                {isLoggingOut ? "Logging out..." : "Log Out"}
                              </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "preferences" && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-[13px] font-semibold text-[#0f172a] mb-3">Appearance</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Moon size={16} className="text-[#64748b]" />
                                            <span className="text-[13px] text-[#0f172a]">Theme</span>
                                        </div>
                                        <select 
                                            value={settings.theme} 
                                            onChange={(e) => updateSetting("theme", e.target.value as any)}
                                            className="px-3 py-1.5 border border-[#cbd5e1] rounded-lg text-[13px] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                                        >
                                            <option value="light">Light</option>
                                            <option value="dark">Dark</option>
                                            <option value="system">System</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Globe size={16} className="text-[#64748b]" />
                                            <span className="text-[13px] text-[#0f172a]">Language</span>
                                        </div>
                                        <select 
                                            value={settings.language} 
                                            onChange={(e) => updateSetting("language", e.target.value as any)}
                                            className="px-3 py-1.5 border border-[#cbd5e1] rounded-lg text-[13px] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                                        >
                                            <option value="en">English</option>
                                            <option value="es">Español</option>
                                            <option value="fr">Français</option>
                                            <option value="de">Deutsch</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-[#e2e8f0] pt-6">
                                <h3 className="text-[13px] font-semibold text-[#0f172a] mb-3">Chat Settings</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <User size={16} className="text-[#64748b]" />
                                                <span className="text-[13px] text-[#0f172a]">Default Model</span>
                                            </div>
                                            <p className="text-[11px] text-[#94a3b8] ml-6">Model used for new chats</p>
                                        </div>
                                        <select 
                                            value={settings.defaultModel} 
                                            onChange={(e) => updateSetting("defaultModel", e.target.value as any)}
                                            className="px-3 py-1.5 border border-[#cbd5e1] rounded-lg text-[13px] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                                        >
                                            <option value="gemini">Gemini Pro</option>
                                            <option value="deepseek">DeepSeek V3</option>
                                            <option value="llama">Llama 3</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Search size={16} className="text-[#64748b]" />
                                                <span className="text-[13px] text-[#0f172a]">Web Search</span>
                                            </div>
                                            <p className="text-[11px] text-[#94a3b8] ml-6">Enable automatic web search</p>
                                        </div>
                                        <button
                                            onClick={() => updateSetting("webSearchEnabled", !settings.webSearchEnabled)}
                                            className={`relative w-11 h-6 rounded-full transition-colors ${settings.webSearchEnabled ? "bg-[#3b82f6]" : "bg-[#cbd5e1]"}`}
                                        >
                                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.webSearchEnabled ? "translate-x-5" : ""}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "notifications" && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-[13px] font-semibold text-[#0f172a] mb-3">Email Notifications</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Mail size={16} className="text-[#64748b]" />
                                                <span className="text-[13px] text-[#0f172a]">Email Updates</span>
                                            </div>
                                            <p className="text-[11px] text-[#94a3b8] ml-6">Receive updates via email</p>
                                        </div>
                                        <button
                                            onClick={() => updateSetting("emailNotifications", !settings.emailNotifications)}
                                            className={`relative w-11 h-6 rounded-full transition-colors ${settings.emailNotifications ? "bg-[#3b82f6]" : "bg-[#cbd5e1]"}`}
                                        >
                                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.emailNotifications ? "translate-x-5" : ""}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-[#e2e8f0] pt-6">
                                <h3 className="text-[13px] font-semibold text-[#0f172a] mb-3">Browser Notifications</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Mail size={16} className="text-[#64748b]" />
                                                <span className="text-[13px] text-[#0f172a]">Push Notifications</span>
                                            </div>
                                            <p className="text-[11px] text-[#94a3b8] ml-6">Show browser notifications</p>
                                        </div>
                                        <button
                                            onClick={() => updateSetting("browserNotifications", !settings.browserNotifications)}
                                            className={`relative w-11 h-6 rounded-full transition-colors ${settings.browserNotifications ? "bg-[#3b82f6]" : "bg-[#cbd5e1]"}`}
                                        >
                                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.browserNotifications ? "translate-x-5" : ""}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-[#e2e8f0] pt-6">
                                <h3 className="text-[13px] font-semibold text-[#0f172a] mb-3">Sound</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Volume2 size={16} className="text-[#64748b]" />
                                                <span className="text-[13px] text-[#0f172a]">Sound Effects</span>
                                            </div>
                                            <p className="text-[11px] text-[#94a3b8] ml-6">Play sounds for notifications</p>
                                        </div>
                                        <button
                                            onClick={() => updateSetting("soundEnabled", !settings.soundEnabled)}
                                            className={`relative w-11 h-6 rounded-full transition-colors ${settings.soundEnabled ? "bg-[#3b82f6]" : "bg-[#cbd5e1]"}`}
                                        >
                                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.soundEnabled ? "translate-x-5" : ""}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "privacy" && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-[13px] font-semibold text-[#0f172a] mb-3">Data & Privacy</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-[13px] text-[#0f172a]">Save Chat History</span>
                                            <p className="text-[11px] text-[#94a3b8]">Store conversations for later access</p>
                                        </div>
                                        <button
                                            onClick={() => updateSetting("saveHistory", !settings.saveHistory)}
                                            className={`relative w-11 h-6 rounded-full transition-colors ${settings.saveHistory ? "bg-[#3b82f6]" : "bg-[#cbd5e1]"}`}
                                        >
                                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.saveHistory ? "translate-x-5" : ""}`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-[13px] text-[#0f172a]">Analytics</span>
                                            <p className="text-[11px] text-[#94a3b8]">Help improve the app with usage data</p>
                                        </div>
                                        <button
                                            onClick={() => updateSetting("analytics", !settings.analytics)}
                                            className={`relative w-11 h-6 rounded-full transition-colors ${settings.analytics ? "bg-[#3b82f6]" : "bg-[#cbd5e1]"}`}
                                        >
                                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.analytics ? "translate-x-5" : ""}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-[#e2e8f0] pt-6">
                                <h3 className="text-[13px] font-semibold text-[#0f172a] mb-3">Data Management</h3>
                                <div className="space-y-3">
                                    <button 
                                        onClick={handleClearHistory}
                                        disabled={isClearing}
                                        className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-[#f59e0b] hover:bg-[#fffbeb] rounded-lg transition-colors w-full disabled:opacity-50"
                                    >
                                        {isClearing ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                                        {isClearing ? "Clearing..." : "Clear All Chat History"}
                                    </button>
                                </div>
                            </div>

                            <div className="border-t border-[#e2e8f0] pt-6">
                                <h3 className="text-[13px] font-semibold text-[#dc2626] mb-3">Danger Zone</h3>
                                <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg p-4">
                                    <p className="text-[12px] text-[#991b1b] mb-3">
                                        Once you delete your account, there is no going back. Please be certain.
                                    </p>
                                    <button 
                                        onClick={handleDeleteAccount}
                                        disabled={isDeleting}
                                        className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-white bg-[#dc2626] hover:bg-[#b91c1c] rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {isDeleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                                        {isDeleting ? "Deleting..." : "Delete Account"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                  </>
                )}
            </div>

            <div className="p-4 border-t border-[#e2e8f0] flex justify-end gap-3 bg-[#f8fafc]">
                <Dialog.Close asChild>
                    <button className="px-5 py-2 text-[13px] font-medium text-[#475569] hover:text-[#0f172a] transition-colors">
                      Cancel
                    </button>
                </Dialog.Close>
                <button 
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="px-5 py-2 bg-[#3b82f6] text-white text-[13px] font-medium rounded-lg hover:bg-[#2563eb] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                    {isSaving && <Loader2 className="animate-spin" size={14} />}
                    {isSaving ? "Saving..." : "Save Changes"}
                </button>
            </div>

          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
