import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import Navbar from '../../components/Navbar';
import { useToast } from '../../components/Toast';

export default function LogHealth() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    weight_kg: '',
    blood_pressure: '',
    blood_sugar: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.weight_kg && !form.blood_pressure && !form.blood_sugar) {
      e.general = 'At least one health metric is required';
    }
    if (form.weight_kg && (isNaN(form.weight_kg) || Number(form.weight_kg) <= 0)) {
      e.weight_kg = 'Weight must be greater than 0';
    }
    if (form.blood_pressure && !/^\d{2,3}\/\d{2,3}$/.test(form.blood_pressure)) {
      e.blood_pressure = 'Format: 120/80';
    }
    if (form.blood_sugar && (isNaN(form.blood_sugar) || Number(form.blood_sugar) <= 0)) {
      e.blood_sugar = 'Blood sugar must be greater than 0';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {};
      if (form.weight_kg) payload.weight_kg = Number(form.weight_kg);
      if (form.blood_pressure) payload.blood_pressure = form.blood_pressure;
      if (form.blood_sugar) payload.blood_sugar = Number(form.blood_sugar);
      if (form.notes) payload.notes = form.notes;

      await client.post('/health', payload);
      addToast('Health data logged successfully! 🎉', 'success');
      setForm({ weight_kg: '', blood_pressure: '', blood_sugar: '', notes: '' });
      navigate('/health-history');
    } catch (err) {
      addToast(err?.error || 'Failed to log health data', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="max-w-xl mx-auto px-5 pt-24 pb-12">
        <div className="animate-fade-in-up">
          <h1 className="font-['Epilogue'] font-bold text-2xl text-on-surface mb-1">Log Health Data</h1>
          <p className="text-sm text-outline font-['Manrope'] mb-6">Track your vitals and stay healthy.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-[var(--shadow-card)] p-6 space-y-5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {errors.general && (
            <div className="p-3 bg-error-container/30 rounded-xl text-sm text-error font-['Manrope'] flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">warning</span>
              {errors.general}
            </div>
          )}

          {/* Weight */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-outline uppercase tracking-wider px-1 font-['Manrope']">Weight (kg)</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary-container text-lg">scale</span>
              <input
                type="number"
                step="0.1"
                value={form.weight_kg}
                onChange={(e) => set('weight_kg', e.target.value)}
                placeholder="e.g. 72.5"
                className="w-full h-13 pl-12 pr-4 bg-surface-container border-none rounded-xl text-sm font-['Manrope'] focus:ring-2 focus:ring-primary-container outline-none transition-all"
                id="health-weight"
              />
            </div>
            {errors.weight_kg && <p className="text-xs text-error px-1">{errors.weight_kg}</p>}
          </div>

          {/* Blood Pressure */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-outline uppercase tracking-wider px-1 font-['Manrope']">Blood Pressure (mmHg)</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-error text-lg">bloodtype</span>
              <input
                type="text"
                value={form.blood_pressure}
                onChange={(e) => set('blood_pressure', e.target.value)}
                placeholder="e.g. 120/80"
                className="w-full h-13 pl-12 pr-4 bg-surface-container border-none rounded-xl text-sm font-['Manrope'] focus:ring-2 focus:ring-primary-container outline-none transition-all"
                id="health-bp"
              />
            </div>
            {errors.blood_pressure && <p className="text-xs text-error px-1">{errors.blood_pressure}</p>}
          </div>

          {/* Blood Sugar */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-outline uppercase tracking-wider px-1 font-['Manrope']">Blood Sugar (mg/dL)</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary text-lg">water_drop</span>
              <input
                type="number"
                value={form.blood_sugar}
                onChange={(e) => set('blood_sugar', e.target.value)}
                placeholder="e.g. 95"
                className="w-full h-13 pl-12 pr-4 bg-surface-container border-none rounded-xl text-sm font-['Manrope'] focus:ring-2 focus:ring-primary-container outline-none transition-all"
                id="health-sugar"
              />
            </div>
            {errors.blood_sugar && <p className="text-xs text-error px-1">{errors.blood_sugar}</p>}
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-outline uppercase tracking-wider px-1 font-['Manrope']">Notes (Optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="How are you feeling today?"
              rows={3}
              className="w-full p-4 bg-surface-container border-none rounded-xl text-sm font-['Manrope'] focus:ring-2 focus:ring-primary-container outline-none transition-all resize-none"
              id="health-notes"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-primary-container text-on-primary font-['Manrope'] font-semibold rounded-xl shadow-[var(--shadow-elevated)] hover:brightness-110 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            id="health-submit"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">add_circle</span>
                Log Health Data
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
