const StatCard = ({ icon: Icon, label, value, tone = "brand" }) => {
  const iconWrapTones = {
    brand: "bg-brand-mint text-brand-green",
    blue: "bg-blue-50 text-brand-blue",
    purple: "bg-purple-50 text-brand-purple",
    gold: "bg-yellow-50 text-brand-gold",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      {Icon && (
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${iconWrapTones[tone] || iconWrapTones.brand}`}>
          <Icon size={20} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-2xl font-semibold text-brand-navy leading-tight">{value ?? "—"}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
};

export default StatCard;