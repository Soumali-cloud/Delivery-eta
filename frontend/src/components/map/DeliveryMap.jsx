import {
    MapContainer,
    TileLayer,
    Marker,
    Popup
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";


// Fix default Leaflet marker icons

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({

    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"

});


function DeliveryMap({ deliveries }) {

    const center = [
        22.5726,
        88.3639
    ];


    return (

        <MapContainer
            center={center}
            zoom={12}
            className="w-full h-[500px] rounded-2xl"
        >

            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />


            {Object.values(deliveries).map(
                delivery => (

                    <Marker
                        key={delivery.order_id}
                        position={[
                            Number(
                                delivery.latitude
                            ),
                            Number(
                                delivery.longitude
                            )
                        ]}
                    >

                        <Popup>

                            <strong>
                                {delivery.order_id}
                            </strong>

                            <br />

                            ETA:
                            {" "}
                            {delivery.eta}
                            {" "}
                            minutes

                            <br />

                            Status:
                            {" "}
                            {delivery.status}

                        </Popup>

                    </Marker>

                )
            )}

        </MapContainer>

    );
}


export default DeliveryMap;