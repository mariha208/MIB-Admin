import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

const data = [
    { name: 'Surat', chapter1: 45, chapter2: 32, chapter3: 28, chapter4: 19 },
    { name: 'Mumbai', chapter1: 52, chapter2: 41, chapter3: 35, chapter4: 23 },
    { name: 'Ahmedabad', chapter1: 38, chapter2: 29, chapter3: 22, chapter4: 15 },
    { name: 'Baroda', chapter1: 31, chapter2: 25, chapter3: 18, chapter4: 12 },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: 'rgba(26, 26, 46, 0.95)',
                border: '1px solid rgba(108, 92, 231, 0.3)',
                borderRadius: '8px',
                padding: '12px 16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            }}>
                <p style={{
                    color: '#fff',
                    fontWeight: 600,
                    marginBottom: '8px',
                    fontSize: '14px'
                }}>{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} style={{
                        color: entry.color,
                        fontSize: '12px',
                        margin: '4px 0'
                    }}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function BusinessChart({ title = "Total Business by Chapter" }) {
    return (
        <div className="chart-section animate-fade-in animate-delay-4" style={{ opacity: 0 }}>
            <div className="chart-header">
                <h2 className="chart-title">{title}</h2>
                <div className="chart-filters">
                    <button className="chart-filter-btn active">Weekly</button>
                    <button className="chart-filter-btn">Monthly</button>
                    <button className="chart-filter-btn">Yearly</button>
                </div>
            </div>
            <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(108, 92, 231, 0.1)"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="name"
                            stroke="#a0a0b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={{ stroke: 'rgba(108, 92, 231, 0.2)' }}
                        />
                        <YAxis
                            stroke="#a0a0b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={{ stroke: 'rgba(108, 92, 231, 0.2)' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="circle"
                        />
                        <Bar
                            dataKey="chapter1"
                            name="Chapter 1"
                            fill="#6c5ce7"
                            radius={[4, 4, 0, 0]}
                        />
                        <Bar
                            dataKey="chapter2"
                            name="Chapter 2"
                            fill="#a29bfe"
                            radius={[4, 4, 0, 0]}
                        />
                        <Bar
                            dataKey="chapter3"
                            name="Chapter 3"
                            fill="#00cec9"
                            radius={[4, 4, 0, 0]}
                        />
                        <Bar
                            dataKey="chapter4"
                            name="Chapter 4"
                            fill="#81ecec"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
