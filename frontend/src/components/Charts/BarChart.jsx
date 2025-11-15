import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BarChart = ({ data, dataKeys, colors, title, height = 300, horizontal = false }) => {
  const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const Chart = horizontal ? RechartsBar : RechartsBar;

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <Chart data={data} layout={horizontal ? 'vertical' : 'horizontal'}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          {horizontal ? (
            <>
              <XAxis type="number" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" style={{ fontSize: '12px' }} />
            </>
          ) : (
            <>
              <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
            </>
          )}
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Legend />
          {dataKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colors?.[index] || defaultColors[index % defaultColors.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </Chart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;
