export default function HealthLogCard({ log, onEdit, onDelete }) {
  const date = new Date(log.logged_at).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const time = new Date(log.logged_at).toLocaleTimeString('en-PK', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-white rounded-xl p-5 shadow-[var(--shadow-card)] animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary-container/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary-container">monitor_heart</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-on-surface font-['Epilogue']">{date}</p>
            <p className="text-xs text-outline">{time}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onEdit && (
            <button onClick={() => onEdit(log)} className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-lg text-outline">edit</span>
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(log)} className="w-8 h-8 rounded-lg hover:bg-error-container/30 flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-lg text-error">delete</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {log.weight_kg && (
          <div className="bg-surface-container rounded-lg p-3 text-center">
            <span className="material-symbols-outlined text-primary-container text-lg mb-1">scale</span>
            <p className="text-lg font-bold text-on-surface font-['Epilogue']">{log.weight_kg}</p>
            <p className="text-[10px] text-outline uppercase tracking-wider">kg</p>
          </div>
        )}
        {log.blood_pressure && (
          <div className="bg-surface-container rounded-lg p-3 text-center">
            <span className="material-symbols-outlined text-error text-lg mb-1">bloodtype</span>
            <p className="text-lg font-bold text-on-surface font-['Epilogue']">{log.blood_pressure}</p>
            <p className="text-[10px] text-outline uppercase tracking-wider">mmHg</p>
          </div>
        )}
        {log.blood_sugar && (
          <div className="bg-surface-container rounded-lg p-3 text-center">
            <span className="material-symbols-outlined text-secondary text-lg mb-1">water_drop</span>
            <p className="text-lg font-bold text-on-surface font-['Epilogue']">{log.blood_sugar}</p>
            <p className="text-[10px] text-outline uppercase tracking-wider">mg/dL</p>
          </div>
        )}
      </div>

      {log.notes && (
        <p className="mt-3 text-xs text-outline italic border-t border-outline-variant/30 pt-3">
          <span className="material-symbols-outlined text-xs align-middle mr-1">notes</span>
          {log.notes}
        </p>
      )}
    </div>
  );
}
