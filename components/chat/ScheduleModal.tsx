"use client";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, CalendarClock } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSchedule: (date: Date) => void;
}

export default function ScheduleModal({ open, onOpenChange, onSchedule }: Props) {
  const [dateStr, setDateStr] = useState("");
  
  const handleSave = () => {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
          onSchedule(d);
          onOpenChange(false);
      }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity" />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-white border border-[var(--bg-border)] rounded-2xl w-[90vw] max-w-sm p-6 z-50 shadow-2xl focus:outline-none">
          <div className="flex justify-between items-center mb-4 border-b border-[var(--bg-border)] pb-3">
            <Dialog.Title className="text-sm font-semibold flex items-center gap-2 text-[var(--text-primary)]">
                <CalendarClock size={16} className="text-[#3b82f6]" />
                Schedule Message
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full p-1"><X size={16} /></button>
            </Dialog.Close>
          </div>
          <div className="space-y-4">
              <div>
                  <label className="text-xs text-[var(--text-secondary)] block mb-1.5 ml-1">Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--bg-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#3b82f6]" 
                  />
              </div>
              <button
                disabled={!dateStr} 
                onClick={handleSave}
                className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl py-2.5 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  Confirm Schedule
              </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
