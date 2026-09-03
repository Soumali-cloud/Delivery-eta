import { useEffect, useState } from "react";
import { API_URL } from "../config";

import StatCard from "../components/StatCard";
import PredictionForm from "../components/PredictionForm";
import AddDelivery from "../components/AddDelivery";
import TrafficPanel from "../components/TrafficPanel";
import AnalyticsChart from "../components/AnalyticsChart";
import DeliveryMap from "../components/map/DeliveryMap";
import MLPerformance from "../components/MLPerformance";
import DeliveryAlerts from "../components/DeliveryAlerts";
import useDeliveryWebSocket from "../hooks/useDeliveryWebSocket";


function Dashboard() {

    const [liveDeliveries, setLiveDeliveries] =
        useState({});
const [analytics, setAnalytics] = useState({
    total_deliveries: 0,
    active_deliveries: 0,
    completed_deliveries: 0,
    on_time: 0,
    delayed: 0,
    average_eta_error: 0,
    average_actual_delivery_time: 0,
    average_predicted_eta: 0
});

    useDeliveryWebSocket((event) => {

            try {

                const data =
                    JSON.parse(event.data);


                console.log(
                    "Live delivery update:",
                    data
                );


                setLiveDeliveries(
                    previous => ({

                        ...previous,

                        [data.order_id]: data

                    })
                );

            }

            catch (error) {

                console.error(
                    "Error reading WebSocket data:",
                    error
                );

            }

    });
useEffect(() => {

    const fetchAnalytics = async () => {

        try {

            const response = await fetch(
                `${API_URL}/api/analytics/summary`
            );

            if (!response.ok) {

                throw new Error(
                    `HTTP error: ${response.status}`
                );

            }

            const data =
                await response.json();

            console.log(
                "Analytics update:",
                data
            );

            setAnalytics(data);

        } catch (error) {

            console.error(
                "Analytics error:",
                error
            );

        }

    };


    // Fetch immediately

    fetchAnalytics();


    // Refresh every 5 seconds

    const interval = setInterval(
        fetchAnalytics,
        5000
    );


    return () => {

        clearInterval(interval);

    };

}, []);

    // ========================================
    // Count live deliveries
    // ========================================

    const deliveryCount =
        Object.keys(liveDeliveries).length;


    const formatMinutes = (value) => {

        const numericValue =
            Number(value ?? 0);

        if (Number.isNaN(numericValue)) {

            return "0 min";

        }

        return `${numericValue} min`;

    };


    const formatPercentage = (value) => {

        const numericValue =
            Number(value ?? 0);

        if (Number.isNaN(numericValue)) {

            return "0%";

        }

        return `${numericValue}%`;

    };


    // ========================================
    // Dashboard
    // ========================================

    return (

        <div className="min-h-screen bg-gray-100">


            {/* ================================= */}
            {/* Header */}
            {/* ================================= */}

            <header className="bg-white border-b">

                <div className="max-w-7xl mx-auto px-6 py-5">

                    <h1 className="text-2xl font-bold">
                        Delivery ETA Intelligence
                    </h1>

                    <p className="text-sm text-gray-500 mt-1">
                        AI-powered real-time delivery
                        prediction and route intelligence
                    </p>

                    <a
                        href="/track-order"
                        className="inline-block mt-4 text-blue-600 font-medium hover:text-blue-700"
                    >
                        Track an Order
                    </a>

                </div>

            </header>


            {/* ================================= */}
            {/* Main */}
            {/* ================================= */}

            <main className="max-w-7xl mx-auto px-6 py-8">


                {/* ================================= */}
                {/* Statistics */}
                {/* ================================= */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">


                    <StatCard
                        title="Active Deliveries"
                        value={
                            analytics.active_deliveries
                        }
                        subtitle="Live deliveries"
                        icon="🚚"
                    />


                    <StatCard
    title="On Time"
    value={`${analytics.on_time}%`}
    subtitle="Delivery success rate"
    icon="✓"
/>


                    <StatCard
    title="Delayed"
    value={`${analytics.delayed}%`}
    subtitle="Needs attention"
    icon="!"
/>

<StatCard
    title="Average ETA Error"
    value={`${analytics.average_eta_error} min`}
    subtitle="Prediction error"
    icon="⏱"
/>

                </div>


                {/* ================================= */}
                {/* ETA Prediction */}
                {/* ================================= */}

                <div className="mt-8">

                    <PredictionForm />

                </div>


                {/* ================================= */}
                {/* Create Delivery */}
                {/* ================================= */}

                <div className="mt-8">

                    <AddDelivery />

                </div>


                {/* ================================= */}
                {/* Traffic + Analytics */}
                {/* ================================= */}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

                    <TrafficPanel />

                    <AnalyticsChart  />

<div className="mt-8">
    <MLPerformance />
</div>

                </div>


                {/* ================================= */}
                {/* Live Delivery Map */}
                {/* ================================= */}

                <div className="mt-8">

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">


                        <div className="mb-5">

                            <h2 className="text-xl font-semibold">
                                Live Delivery Map
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                Real-time driver locations
                            </p>

                        </div>

<div className="mt-8">
    <DeliveryAlerts deliveries={liveDeliveries} />
</div>

                        <DeliveryMap
                            deliveries={liveDeliveries}
                        />


                    </div>

                </div>


                {/* ================================= */}
                {/* Live Deliveries Table */}
                {/* ================================= */}

                <div className="mt-8">

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">


                        {/* Table header */}

                        <div className="flex justify-between items-center mb-5">

                            <div>

                                <h2 className="text-xl font-semibold">
                                    Live Deliveries
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Real-time driver locations and ETA
                                </p>

                            </div>


                            <span className="px-3 py-1 rounded-full bg-gray-100 text-sm">

                                ● Live

                            </span>

                        </div>


                        {/* Table */}

                        <div className="overflow-x-auto">

                            <table className="w-full">


                                {/* Table header */}

                                <thead>

                                    <tr className="border-b text-left text-sm text-gray-500">

                                        <th className="pb-3">
                                            Order
                                        </th>

                                        <th className="pb-3">
                                            Latitude
                                        </th>

                                        <th className="pb-3">
                                            Longitude
                                        </th>

                                        <th className="pb-3">
                                            ETA
                                        </th>

                                        <th className="pb-3">
                                            Status
                                        </th>

                                    </tr>

                                </thead>


                                {/* Table body */}

                                <tbody>

                                    {Object.values(
                                        liveDeliveries
                                    ).map(
                                        delivery => (

                                            <tr
                                                key={
                                                    delivery.order_id
                                                }
                                                className="border-b"
                                            >


                                                <td className="py-4 font-medium">

                                                    {
                                                        delivery.order_id
                                                    }

                                                </td>


                                                <td className="py-4">

                                                    {
                                                        Number(
                                                            delivery.latitude
                                                        ).toFixed(5)
                                                    }

                                                </td>


                                                <td className="py-4">

                                                    {
                                                        Number(
                                                            delivery.longitude
                                                        ).toFixed(5)
                                                    }

                                                </td>


                                                <td className="py-4 font-semibold">

                                                    {
                                                        delivery.eta
                                                    }

                                                    {" "}
                                                    min

                                                </td>


                                                <td className="py-4">

                                                    {
                                                        delivery.status
                                                    }

                                                </td>


                                            </tr>

                                        )
                                    )}


                                    {/* Empty state */}

                                    {deliveryCount === 0 && (

                                        <tr>

                                            <td
                                                colSpan="5"
                                                className="py-10 text-center text-gray-500"
                                            >

                                                Waiting for live
                                                delivery updates...

                                            </td>

                                        </tr>

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>


            </main>

        </div>

    );

}


export default Dashboard;
