const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-white rounded-xl border border-dashed border-gray-200">
    {Icon && (
      <div className="w-12 h-12 rounded-full bg-brand-mint text-brand-green flex items-center justify-center mb-4">
        <Icon size={22} />
      </div>
    )}
    <p className="font-medium text-brand-navy mb-1">{title}</p>
    {description && <p className="text-sm text-gray-500 max-w-sm mb-4">{description}</p>}
    {action}
  </div>
);

export default EmptyState;