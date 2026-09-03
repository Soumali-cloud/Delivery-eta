import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";


function AnalyticsChart() {

    const data = [
        {
            day: "Mon",
            predicted: 28,
            actual: 30
        },
        {
            day: "Tue",
            predicted: 31,
            actual: 34
        },
        {
            day: "Wed",
            predicted: 25,
            actual: 27
        },
        {
            day: "Thu",
            predicted: 29,
            actual: 28
        },
        {
            day: "Fri",
            predicted: 34,
            actual: 37
        },
        {
            day: "Sat",
            predicted: 30,
            actual: 32
        },
        {
            day: "Sun",
            predicted: 27,
            actual: 29
        }
    ];


    return (

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

            <h2 className="text-xl font-semibold">
                ETA Accuracy
            </h2>

            <p className="text-sm text-gray-500 mt-1">
                Predicted vs actual delivery time
            </p>


            <div className="h-72 mt-6">

                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >

                    <LineChart data={data}>

                        <CartesianGrid
                            strokeDasharray="3 3"
                        />

                        <XAxis
                            dataKey="day"
                        />

                        <YAxis />

                        <Tooltip />

                        <Line
                            type="monotone"
                            dataKey="predicted"
                            stroke="black"
                            strokeWidth={2}
                        />

                        <Line
                            type="monotone"
                            dataKey="actual"
                            stroke="#888"
                            strokeWidth={2}
                        />

                    </LineChart>

                </ResponsiveContainer>

            </div>

        </div>
    );
}

export default AnalyticsChart;