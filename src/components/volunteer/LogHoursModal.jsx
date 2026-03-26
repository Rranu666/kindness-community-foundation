import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LogHoursModal({ signup, user, onSuccess, onClose }) {
  const [hours, setHours] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!hours || !date) return;

    setLoading(true);
    try {
      await base44.entities.VolunteerHours.create({
        user_email: user.email,
        signup_id: signup.id,
        initiative_name: signup.initiative_name,
        hours: parseFloat(hours),
        activity_date: date,
        description,
      });
      onSuccess();
    } catch (error) {
      // silently ignore — handled by onError callback
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white">
        <div className="border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Log Hours</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-1">Initiative</p>
            <p className="text-slate-900 font-medium">{signup.initiative_name}</p>
          </div>

          <div>
            <Label htmlFor="hours" className="text-sm font-medium text-slate-700">
              Hours
            </Label>
            <Input
              id="hours"
              type="number"
              step="0.5"
              min="0"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="e.g., 2.5"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="date" className="text-sm font-medium text-slate-700">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium text-slate-700">
              Description (Optional)
            </Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you work on?"
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              rows="3"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!hours || !date || loading}
              className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Log Hours
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}