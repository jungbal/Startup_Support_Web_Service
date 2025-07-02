import { Route, Routes } from "react-router-dom";
import MarketList from "./MarketList"
import MarketWrite from "./MarketWrite"

export default function MarketMain(){

    return(

        <Routes>
            <Route path="list" element={<MarketList />} />
            <Route path="write" element={<MarketWrite />} />
        </Routes>
    );
}