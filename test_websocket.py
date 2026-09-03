import {
    useEffect,
    useState
} from "react";

import StatCard from "../components/StatCard";
import PredictionForm from "../components/PredictionForm";
import DeliveryTable from "../components/DeliveryTable";
import TrafficPanel from "../components/TrafficPanel";
import AnalyticsChart from "../components/AnalyticsChart";


function Dashboard() {

    const [liveDeliveries, setLiveDeliveries] =
        useState({});


    useEffect(() => {

        const socket = new WebSocket(
            "ws://127.0.0.1:8000/ws/deliveries"
        );


        socket.onopen = () => {

            console.log(
                "Connected to delivery WebSocket"
            );

        };


        socket.onmessage = (event) => {

            const data = JSON.parse(
                event.data
            );


            setLiveDeliveries(
                previous => ({
                    ...previous,
                    [data.order_id]: data
                })
            );

        };


        socket.onerror = (error) => {

            console.error(
                "WebSocket error:",
                error
            );

        };


        socket.onclose = () => {

            console.log(
                "Delivery WebSocket disconnected"
            );

        };


        return () => {

            socket.close();

        };

    }, []);


    const deliveryCount =
        Object.keys(liveDeliveries).length;


    return (

        <div className="min-h-screen bg-gray-100">


            <header className="bg-white border-b">

                <div className="max-w-7xl mx-auto px-6 py-5">

                    <h1 className="text-2xl font-bold">
                        Delivery ETA Intelligence
                    </h1>

                    <p className="text-sm text-gray-500 mt-1">
                        AI-powered real-time delivery
                        prediction and route intelligence
                    </p>

                </div>

            </header>


            <main className="max-w-7xl mx-auto px-6 py-8">


                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                    <StatCard
                        title="Active Deliveries"
                        value={
                            deliveryCount || "1,248"
                        }
                        subtitle="Live deliveries"
                        icon="🚚"
                    />

                    <StatCard
                        title="On Time"
                        value="87%"
                        subtitle="Delivery success rate"
                        icon="✓"
                    />

                    <StatCard
                        title="Delayed"
                        value="13%"
                        subtitle="Needs attention"
                        icon="!"
                    />

                    <StatCard
                        title="Average ETA Error"
                        value="4.2 min"
                        subtitle="Prediction error"
                        icon="⏱"
                    />

                </div>


                <div className="mt-8">

                    <PredictionForm />

                </div>


                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

                    <TrafficPanel />

                    <AnalyticsChart />

                </div>


                <div className="mt-8">

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

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


                        <div className="overflow-x-auto">

                            <table className="w-full">

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
                                                        delivery.latitude
                                                    }
                                                </td>

                                                <td className="py-4">
                                                    {
                                                        delivery.longitude
                                                    }
                                                </td>

                                                <td className="py-4 font-semibold">
                                                    {
                                                        delivery.eta
                                                    }{" "}
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