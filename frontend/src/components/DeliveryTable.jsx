function DeliveryTable() {

    const deliveries = [
        {
            id: "#1024",
            restaurant: "Burger House",
            driver: "Driver 21",
            eta: "27 min",
            status: "On Time"
        },
        {
            id: "#1025",
            restaurant: "Pizza Point",
            driver: "Driver 08",
            eta: "34 min",
            status: "Delayed"
        },
        {
            id: "#1026",
            restaurant: "Food Hub",
            driver: "Driver 14",
            eta: "19 min",
            status: "On Time"
        },
        {
            id: "#1027",
            restaurant: "Spice Kitchen",
            driver: "Driver 33",
            eta: "22 min",
            status: "On Time"
        }
    ];

    return (

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

            <h2 className="text-xl font-semibold mb-5">
                Active Deliveries
            </h2>

            <div className="overflow-x-auto">

                <table className="w-full">

                    <thead>

                        <tr className="border-b text-left text-sm text-gray-500">

                            <th className="pb-3">
                                Order
                            </th>

                            <th className="pb-3">
                                Restaurant
                            </th>

                            <th className="pb-3">
                                Driver
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

                        {deliveries.map((delivery) => (

                            <tr
                                key={delivery.id}
                                className="border-b last:border-0"
                            >

                                <td className="py-4 font-medium">
                                    {delivery.id}
                                </td>

                                <td className="py-4">
                                    {delivery.restaurant}
                                </td>

                                <td className="py-4">
                                    {delivery.driver}
                                </td>

                                <td className="py-4 font-semibold">
                                    {delivery.eta}
                                </td>

                                <td className="py-4">

                                    <span
                                        className={
                                            delivery.status === "Delayed"
                                                ? "px-3 py-1 rounded-full text-xs bg-gray-200 text-gray-700"
                                                : "px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                                        }
                                    >
                                        {delivery.status}
                                    </span>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    );
}

export default DeliveryTable;