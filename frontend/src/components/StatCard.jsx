function StatCard({ title, value, subtitle, icon }) {

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">

            <div className="flex items-start justify-between">

                <div>
                    <p className="text-sm text-gray-500">
                        {title}
                    </p>

                    <h2 className="text-3xl font-bold mt-2">
                        {value}
                    </h2>

                    <p className="text-xs text-gray-400 mt-2">
                        {subtitle}
                    </p>
                </div>

                <div className="text-2xl">
                    {icon}
                </div>

            </div>

        </div>
    );
}

export default StatCard;