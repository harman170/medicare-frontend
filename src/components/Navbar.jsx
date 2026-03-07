// src/Components/Navbar.jsx
import { Link } from "react-router-dom";
import DonorForm from "../DonorForm";
import AvailMedForm from "../Availmed";
import MedicineListing from "../FetchMed" ;
import NeedyProfileForm from "../Needy";
import FindDonors from "../FindDonors";
import MedicalDonationPlatform from "../MedicalEquipment";
import NeedySearch from "../EquiFetch";
import DonorDashboard from "../Donordash";
import NeedyDashboard from "../needydash";
export default function Navbar() {
  return (
    <nav >
      {/* <h1 className="text-xl font-bold">Medishare</h1> */}
      <div className="space-x-4">
        {/* <Link to="/" className="hover:underline">Signup</Link>
        <Link to="/login" className="hover:underline">Login</Link> */}
         <Link
  to="/donor/donorform" ></Link>


      <Link
  to="/donor/availmed" ></Link>
<Link to="/donor/Fetchmed"></Link>

      </div>
<Link to="/needy"></Link>
<Link to="/needy/FindDonors"></Link>
<Link to="/donor/MedicalEquipment"></Link>
<Link to="/needy/Needed-Equipment"></Link>
<Link to="/donor/Donordash"></Link>
<Link to="/needy/dashboard"></Link>
    </nav>
  );
}

