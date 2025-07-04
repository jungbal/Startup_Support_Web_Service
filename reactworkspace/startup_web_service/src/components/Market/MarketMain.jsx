import { Route, Routes } from "react-router-dom";
import MarketList from "./MarketList"
import MarketWrite from "./MarketWrite"
import MarketView from "./MarketView";
import MarketUpdate from "./MarketUpdate";

export default function MarketMain(){

    return(

        <Routes>
            <Route path="list" element={<MarketList />} />
            <Route path="write" element={<MarketWrite />} />
            <Route path="view/:marketNo" element={<MarketView />} />
            <Route path="update/:marketNo" element={<MarketUpdate />} />
        </Routes>
    );
}