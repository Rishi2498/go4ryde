function StatCard({title, value, color}) {
  const colors = {
    primary: 'from-primary/20 to-primary/5 border-primary/30',
    success: 'from-success/20 to-success/5 border-success/30',
    accent: 'from-accent/20 to-accent/5 border-accent/30',
  };

  return (
    <div
      className={`glass-card p-5 border bg-gradient-to-br ${colors[color]}`}>
      <p className="text-sm text-gray-400 mb-1">
        {title}
      </p>

      <p className="text-3xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

export default StatCard;

