import { AreaChart as RechartsArea, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AreaChart = ({ data, dataKeys, colors, title, height = 300 }) => {
  const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsArea data={data}>
          <defs>
            {dataKeys.map((key, index) => (
              <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors?.[index] || defaultColors[index]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={colors?.[index] || defaultColors[index]} stopOpacity={0}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey="name" 
            stroke="#94a3b8" 
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#94a3b8" 
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          {dataKeys.map((key, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors?.[index] || defaultColors[index]}
              fillOpacity={1}
              fill={`url(#color${key})`}
            />
          ))}
        </RechartsArea>
      </ResponsiveContainer>
    </div>
  );
};

export default AreaChart;
