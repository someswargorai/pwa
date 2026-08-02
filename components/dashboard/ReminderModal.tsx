import { X, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteTitle: string;
  noteContent: string;
}

export default function ReminderModal({
  isOpen,
  onClose,
  noteTitle,
  noteContent
}: ReminderModalProps) {
  const [reminderTime, setReminderTime] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Set default time to 1 hour from now
      const defaultTime = new Date();
      defaultTime.setHours(defaultTime.getHours() + 1);
      defaultTime.setMinutes(defaultTime.getMinutes() - defaultTime.getTimezoneOffset());
      setReminderTime(defaultTime.toISOString().slice(0, 16));
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleSchedule = async () => {
    if (!reminderTime) {
      toast.error("Please select a time.");
      return;
    }

    const scheduledTime = new Date(reminderTime).getTime();
    if (scheduledTime <= Date.now()) {
      toast.error("Reminder time must be in the future.");
      return;
    }

    setIsScheduling(true);

    try {
      const pushEnabled = localStorage.getItem('nexus_notifications') === 'true';
      const emailEnabled = localStorage.getItem('nexus_email_notifications') === 'true';
      
      let pushSubscription = null;
      if (pushEnabled) {
        const sub = localStorage.getItem('nexus_push_subscription');
        if (sub) pushSubscription = JSON.parse(sub);
      }

      const delaySeconds = Math.max(0, Math.floor((scheduledTime - Date.now()) / 1000));
      
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: noteTitle || "Note Reminder",
          body: "It's time to review your note: " + (noteTitle || "Untitled"),
          email: emailEnabled,
          push: pushEnabled,
          pushSubscription: pushSubscription,
          delayStr: `${delaySeconds}s`
        })
      });

      if (!res.ok) throw new Error("Failed to schedule");

      toast.success(`Reminder scheduled for ${new Date(scheduledTime).toLocaleTimeString()}!`);
      onClose();
    } catch (error) {
      console.error("Failed to schedule via QStash", error);
      toast.error("Failed to schedule reminder");
    } finally {
      setIsScheduling(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)] animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
              <Clock size={16} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Set Reminder</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="flex flex-col gap-2 mb-8">
          <label className="text-[13px] font-bold text-gray-700 ml-1">Date & Time</label>
          <input 
            type="datetime-local" 
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-[15px] font-medium text-gray-900 outline-none focus:border-blue-500 focus:ring-0 transition-colors appearance-none"
          />
        </div>

        <button 
          onClick={handleSchedule}
          disabled={isScheduling}
          className="w-full py-4 rounded-2xl font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/25 disabled:opacity-50"
        >
          {isScheduling ? "Scheduling..." : "Save Reminder"}
        </button>
      </div>
    </div>
  );
}
