import { Route, Routes } from "react-router-dom";
import MarketList from "./MarketList"


export default function MarketMain(){

    return(

        <Routes>
            <Route path="list" element={<MarketList />} />
        </Routes>
    );
}