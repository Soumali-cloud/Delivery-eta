import Dashboard from "./pages/Dashboard";
import TrackOrder from "./pages/TrackOrder";


function App() {

    return window.location.pathname === "/track-order"
        ? <TrackOrder />
        : <Dashboard />;

}


export default App;