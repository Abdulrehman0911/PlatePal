import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import Navbar from '../../components/Navbar';
import HealthLogCard from '../../components/HealthLogCard';
import Loading from '../../components/Loading';
import { useToast } from '../../components/Toast';

export default function HealthHistory() {
  const { addToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingLog, setEditingLog] = useState(null);
  const [editForm, setEditForm] = useState({});
  const canvasRef = useRef(null);

  const fetchData = async () => {
    try {
      const data = await client.get('/health');
      setLogs(data.logs);
      setStats(data.stats);
    } catch { console.error('Failed to fetch'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // Draw weight chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !logs.length) return;
    const ctx = canvas.getContext('2d');
    const weightLogs = logs.filter(l => l.weight_kg).slice(0, 30).reverse();
    if (weightLogs.length < 2) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;

    const weights = weightLogs.map(l => l.weight_kg);
    const min = Math.min(...weights) - 2;
    const max = Math.max(...weights) + 2;
    const pad = { top: 20, right: 20, bottom: 30, left: 40 };

    ctx.clearRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = '#e0e3e3';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (H - pad.top - pad.bottom) * (i / 4);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(W - pad.right, y);
      ctx.stroke();
      ctx.fillStyle = '#6e7979';
      ctx.font = '10px Manrope';
      ctx.textAlign = 'right';
      ctx.fillText((max - (max - min) * (i / 4)).toFixed(1), pad.left - 5, y + 3);
    }

    // Line
    const xStep = (W - pad.left - pad.right) / (weightLogs.length - 1);
    ctx.beginPath();
    ctx.strokeStyle = '#0d7377';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    weightLogs.forEach((l, i) => {
      const x = pad.left + i * xStep;
      const y = pad.top + (H - pad.top - pad.bottom) * (1 - (l.weight_kg - min) / (max - min));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Gradient fill under line
    const grad = ctx.createLinearGradient(0, pad.top, 0, H - pad.bottom);
    grad.addColorStop(0, 'rgba(13, 115, 119, 0.15)');
    grad.addColorStop(1, 'rgba(13, 115, 119, 0)');
    ctx.lineTo(pad.left + (weightLogs.length - 1) * xStep, H - pad.bottom);
    ctx.lineTo(pad.left, H - pad.bottom);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Dots
    weightLogs.forEach((l, i) => {
      const x = pad.left + i * xStep;
      const y = pad.top + (H - pad.top - pad.bottom) * (1 - (l.weight_kg - min) / (max - min));
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#0d7377';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    });
  }, [logs]);

  const handleDelete = async (log) => {
    if (!confirm('Delete this health log?')) return;
    try {
      await client.delete(`/health/${log.log_id}`);
      addToast('Health log deleted', 'info');
      fetchData();
    } catch { addToast('Failed to delete', 'error'); }
  };

  const handleEdit = (log) => {
    setEditingLog(log);
    setEditForm({
      weight_kg: log.weight_kg || '',
      blood_pressure: log.blood_pressure || '',
      blood_sugar: log.blood_sugar || '',
      notes: log.notes || '',
    });
  };

  const saveEdit = async () => {
    try {
      const payload = {};
      if (editForm.weight_kg) payload.weight_kg = Number(editForm.weight_kg);
      if (editForm.blood_pressure) payload.blood_pressure = editForm.blood_pressure;
      if (editForm.blood_sugar) payload.blood_sugar = Number(editForm.blood_sugar);
      payload.notes = editForm.notes || null;

      await client.put(`/health/${editingLog.log_id}`, payload);
      addToast('Health log updated!', 'success');
      setEditingLog(null);
      fetchData();
    } catch { addToast('Failed to update', 'error'); }
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="max-w-4xl mx-auto px-5 pt-24 pb-12">
        <div className="flex items-center justify-between mb-6 animate-fade-in-up">
          <div>
            <h1 className="font-['Epilogue'] font-bold text-2xl text-on-surface mb-1">Health History</h1>
            <p className="text-sm text-outline font-['Manrope']">Your health journey at a glance.</p>
          </div>
          <Link
            to="/log-health"
            className="flex items-center gap-1.5 px-4 py-2 bg-primary-container text-on-primary rounded-xl text-sm font-semibold hover:brightness-110 transition-all"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            New Log
          </Link>
        </div>

        {loading ? (
          <Loading text="Loading health data..." />
        ) : logs.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <span className="material-symbols-outlined text-5xl text-outline-variant mb-4">monitor_heart</span>
            <p className="font-['Epilogue'] font-semibold text-lg text-on-surface mb-1">No health logs yet</p>
            <p className="text-sm text-outline font-['Manrope']">Start logging your health data to see trends.</p>
          </div>
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              {[
                { label: 'Current Weight', value: stats.latest?.weight_kg ? `${stats.latest.weight_kg} kg` : '—', icon: 'scale', color: 'text-primary-container' },
                { label: 'Avg Weight', value: stats.avg_weight ? `${stats.avg_weight} kg` : '—', icon: 'monitoring', color: 'text-primary-container' },
                { label: 'Min Weight', value: stats.min_weight ? `${stats.min_weight} kg` : '—', icon: 'arrow_downward', color: 'text-cal-green' },
                { label: 'Max Weight', value: stats.max_weight ? `${stats.max_weight} kg` : '—', icon: 'arrow_upward', color: 'text-cal-red' },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl p-4 shadow-[var(--shadow-card)] text-center">
                  <span className={`material-symbols-outlined ${s.color} text-2xl mb-2`}>{s.icon}</span>
                  <p className="font-['Epilogue'] font-bold text-lg text-on-surface">{s.value}</p>
                  <p className="text-[10px] text-outline uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Trend */}
            {stats.trends && (
              <div className="mb-6 p-3 bg-white rounded-xl shadow-[var(--shadow-card)] text-center animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                <span className="text-xs text-outline font-['Manrope']">📊 {stats.trends}</span>
              </div>
            )}

            {/* Weight chart */}
            {logs.filter(l => l.weight_kg).length >= 2 && (
              <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] p-5 mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <h3 className="font-['Epilogue'] font-semibold text-sm text-on-surface mb-3">Weight Trend (Last 30 Entries)</h3>
                <canvas ref={canvasRef} className="w-full" style={{ height: '200px' }} />
              </div>
            )}

            {/* Edit modal */}
            {editingLog && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setEditingLog(null)}>
                <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 animate-slide-down" onClick={e => e.stopPropagation()}>
                  <h3 className="font-['Epilogue'] font-bold text-lg text-on-surface mb-4">Edit Health Log</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] text-outline uppercase font-bold tracking-wider">Weight (kg)</label>
                      <input type="number" step="0.1" value={editForm.weight_kg} onChange={(e) => setEditForm({...editForm, weight_kg: e.target.value})} className="w-full h-11 px-3 bg-surface-container rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-container mt-1" />
                    </div>
                    <div>
                      <label className="text-[10px] text-outline uppercase font-bold tracking-wider">Blood Pressure (mmHg)</label>
                      <input type="text" value={editForm.blood_pressure} onChange={(e) => setEditForm({...editForm, blood_pressure: e.target.value})} className="w-full h-11 px-3 bg-surface-container rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-container mt-1" />
                    </div>
                    <div>
                      <label className="text-[10px] text-outline uppercase font-bold tracking-wider">Blood Sugar (mg/dL)</label>
                      <input type="number" value={editForm.blood_sugar} onChange={(e) => setEditForm({...editForm, blood_sugar: e.target.value})} className="w-full h-11 px-3 bg-surface-container rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-container mt-1" />
                    </div>
                    <div>
                      <label className="text-[10px] text-outline uppercase font-bold tracking-wider">Notes</label>
                      <textarea value={editForm.notes} onChange={(e) => setEditForm({...editForm, notes: e.target.value})} rows={2} className="w-full p-3 bg-surface-container rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-container resize-none mt-1" />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-5">
                    <button onClick={() => setEditingLog(null)} className="flex-1 h-11 border border-outline-variant/40 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</button>
                    <button onClick={saveEdit} className="flex-1 h-11 bg-primary-container text-on-primary rounded-xl text-sm font-semibold hover:brightness-110 transition-all">Save</button>
                  </div>
                </div>
              </div>
            )}

            {/* Logs timeline */}
            <div className="space-y-4">
              {logs.map((log) => (
                <HealthLogCard key={log.log_id} log={log} onEdit={handleEdit} onDelete={handleDelete} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
