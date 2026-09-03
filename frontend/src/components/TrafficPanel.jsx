function TrafficPanel() {

    const traffic = [
        {
            name: "Heavy",
            percentage: 18
        },
        {
            name: "Moderate",
            percentage: 51
        },
        {
            name: "Clear",
            percentage: 31
        }
    ];

    return (

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

            <h2 className="text-xl font-semibold">
                Traffic Intelligence
            </h2>

            <p className="text-sm text-gray-500 mt-1">
                Current traffic distribution
            </p>


            <div className="mt-6 space-y-6">

                {traffic.map((item) => (

                    <div key={item.name}>

                        <div className="flex justify-between text-sm mb-2">

                            <span>
                                {item.name}
                            </span>

                            <span className="font-medium">
                                {item.percentage}%
                            </span>

                        </div>


                        <div className="w-full bg-gray-200 rounded-full h-2">

                            <div
                                className="bg-black h-2 rounded-full"
                                style={{
                                    width: `${item.percentage}%`
                                }}
                            />

                        </div>

                    </div>

                ))}

            </div>

        </div>
    );
}

export default TrafficPanel;