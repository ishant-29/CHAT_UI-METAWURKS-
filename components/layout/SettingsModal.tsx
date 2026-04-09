"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X, User, Shield, CreditCard, Bell } from "lucide-react";
import { useState } from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsModal({ open, onOpenChange }: Props) {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-[#0f172a]/20 backdrop-blur-sm z-40 transition-opacity" />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-white border border-[#e2e8f0] rounded-2xl w-[90vw] max-w-2xl h-[600px] max-h-[85vh] z-50 shadow-2xl focus:outline-none flex overflow-hidden">
          
          {/* Sidebar */}
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
                onClick={() => setActiveTab("billing")}
                className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${activeTab === "billing" ? "bg-[#e0e7f1] text-[#3b82f6]" : "text-[#475569] hover:bg-white hover:text-[#0f172a]"}`}
              >
                <CreditCard size={16} /> Billing & Plan
              </button>
              <button 
                onClick={() => setActiveTab("notifications")}
                className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${activeTab === "notifications" ? "bg-[#e0e7f1] text-[#3b82f6]" : "text-[#475569] hover:bg-white hover:text-[#0f172a]"}`}
              >
                <Bell size={16} /> Notifications
              </button>
              <button 
                onClick={() => setActiveTab("security")}
                className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${activeTab === "security" ? "bg-[#e0e7f1] text-[#3b82f6]" : "text-[#475569] hover:bg-white hover:text-[#0f172a]"}`}
              >
                <Shield size={16} /> Security
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col bg-white">
            <div className="flex justify-between items-center p-4 border-b border-[#e2e8f0]">
                <Dialog.Title className="text-[15px] font-semibold text-[#0f172a] capitalize">
                    {activeTab} Settings
                </Dialog.Title>
                <Dialog.Close asChild>
                    <button className="text-[#94a3b8] hover:text-[#0f172a] transition-colors p-1 rounded-md hover:bg-slate-50"><X size={18} /></button>
                </Dialog.Close>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
                {activeTab === "profile" && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-[#3b82f6] flex items-center justify-center text-white text-2xl font-bold">
                                U
                            </div>
                            <button className="px-4 py-1.5 border border-[#e2e8f0] rounded-lg text-[13px] font-medium text-[#0f172a] hover:bg-slate-50">
                                Upload Photo
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[12px] font-semibold text-[#475569] mb-1.5">Display Name</label>
                                <input type="text" defaultValue="User" className="w-full max-w-sm px-3 py-2 border border-[#cbd5e1] rounded-lg text-[13px] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]" />
                            </div>
                            <div>
                                <label className="block text-[12px] font-semibold text-[#475569] mb-1.5">Email Address</label>
                                <input type="email" defaultValue="user@metawurks.com" className="w-full max-w-sm px-3 py-2 border border-[#cbd5e1] rounded-lg text-[13px] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]" />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "billing" && (
                     <div className="space-y-6">
                         <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5">
                             <div className="flex justify-between items-start mb-2">
                                 <div>
                                     <h3 className="font-semibold text-[#0f172a]">Pro Plan</h3>
                                     <p className="text-[13px] text-[#64748b]">Unlimited GPT-5, Claude 3.5, and Gemini.</p>
                                 </div>
                                 <span className="bg-[#e0e7f1] text-[#3b82f6] px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide">Active</span>
                             </div>
                             <button className="mt-4 px-4 py-2 bg-white border border-[#cbd5e1] text-[#0f172a] text-[13px] font-medium rounded-lg hover:bg-slate-50 transition-colors">
                                 Manage Subscription
                             </button>
                         </div>
                     </div>
                )}

                {/* Notifications & Security placeholders */}
                {(activeTab === "notifications" || activeTab === "security") && (
                    <div className="h-full flex flex-col items-center justify-center text-[#94a3b8]">
                        <p className="text-[13px]">Configuration options coming soon.</p>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-[#e2e8f0] flex justify-end gap-3 bg-[#f8fafc]">
                <Dialog.Close asChild>
                    <button className="px-5 py-2 text-[13px] font-medium text-[#475569] hover:text-[#0f172a] transition-colors">Cancel</button>
                </Dialog.Close>
                <button className="px-5 py-2 bg-[#3b82f6] text-white text-[13px] font-medium rounded-lg hover:bg-[#2563eb] transition-colors shadow-sm">
                    Save Changes
                </button>
            </div>

          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
