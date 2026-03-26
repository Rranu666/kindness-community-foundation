import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const initiatives = [
  { id: "education", name: "Education", icon: "🎓", description: "Teach and mentor students" },
  { id: "economic", name: "Economic Empowerment", icon: "💼", description: "Support livelihoods" },
  { id: "health", name: "Health & Wellness", icon: "🏥", description: "Community health programs" },
  { id: "development", name: "Community Development", icon: "🏘️", description: "Build infrastructure" },
  { id: "environment", name: "Environmental Sustainability", icon: "🌱", description: "Environmental action" },
  { id: "culture", name: "Cultural Preservation", icon: "🎭", description: "Preserve heritage" },
];

export default function InitiativeSignupModal({ user, onSuccess, onClose }) {
  const [selectedInitiative, setSelectedInitiative] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!selectedInitiative) return;

    setLoading(true);
    try {
      await base44.entities.VolunteerSignup.create({
        user_email: user.email,
        user_name: user.full_name,
        initiative_id: selectedInitiative.id,
        initiative_name: selectedInitiative.name,
        start_date: new Date().toISOString().split("T")[0],
        status: "active",
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
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Join an Initiative</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {initiatives.map((initiative) => (
              <button
                key={initiative.id}
                onClick={() => setSelectedInitiative(initiative)}
                className={`p-4 rounded-xl border-2 transition text-left ${
                  selectedInitiative?.id === initiative.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="text-2xl mb-2">{initiative.icon}</div>
                <h3 className="font-semibold text-slate-900 mb-1">{initiative.name}</h3>
                <p className="text-sm text-slate-600">{initiative.description}</p>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSignup}
              disabled={!selectedInitiative || loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign Up
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}