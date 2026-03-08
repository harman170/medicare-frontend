import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";


import Apps from "./Pages/MediShare";
import DonorForm from "./DonorForm";

import Navbar from "./components/Navbar";
import AvailMedForm from "./Availmed";
import MedicineListing from "./FetchMed" ;
import NeedyProfileForm from "./Needy";
import FindDonors from "./FindDonors";
import MedicalDonationPlatform from "./MedicalEquipment";
import NeedySearch from "./EquiFetch";
import DonorDashboard from "./Donordash";
import NeedyDashboard from "./needydash";
import MedicineSearchPage from "./MedicineSearch";
const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Apps/>} />
        <Route path="/donor/donorform" element={<DonorForm />} />
           <Route path="/donor/availmed" element={<AvailMedForm/>} />
            <Route path="/donor/FetchMed" element={<MedicineListing/>} />
            <Route path="/needy" element={<NeedyProfileForm />} />
               <Route path="/needy/FindDonors" element={<FindDonors/>} />
               <Route path="/donor/MedicalEquipment" element={<MedicalDonationPlatform/>} />
                <Route path="/needy/Needed-Equipment" element={<NeedySearch/>} />
                <Route path="/donor/Donordash" element={<DonorDashboard/>} />
                <Route path="/needy/dashboard" element={<NeedyDashboard/>} />
                <Route path="/needy/medicinesearch" element={<MedicineSearchPage/>} />


      </Routes>
    </BrowserRouter>
  );
};

export default App;
