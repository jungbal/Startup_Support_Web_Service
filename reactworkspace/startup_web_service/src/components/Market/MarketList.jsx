import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import instance from "../../api/axios";

export default function MarketList(){
    const serverUrl = import.meta.env.VITE_BACK_SERVER;
    const axiosInstance=instance();

    const [marketList, setMarketList] =useState([]);
    const [reqPage, setReqPage]=useState(1);

    useEffect(function(){
        let options={};
        options.url=serverUrl + "/market/list";
        options.method='get';

        axiosInstance(options)
        .then(function(res){

        })
        .catch(function(err){

        })
    },[]);


    return(
        <div>
            <div>Market</div>
            <Link to="/market/write" className="btn-primary">판매글 쓰기</Link>
            <div>
                <ul>
                    {marketList.map(function(market, index){
                        return <MarketItem key={"market"+index} market={market} />
                    })}
                </ul>
            </div>

        </div>
    )
}

function MarketItem(props){
    const market=props.market;
    const navigate = useNavigate();

    return (
        <li onClick={function(){
            navigate("/market/view/" + market.market.No);
        }}>
            <div>
                <div>{market.marketTitle}</div>
                <div>{market.userId}</div>
                <div>{market.marketDate}</div>
            </div>

        </li>
    )
}