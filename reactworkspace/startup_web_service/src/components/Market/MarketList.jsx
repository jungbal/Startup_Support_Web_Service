import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import createInstance from "../../api/Interceptor";
import useAuthStore from "../../store/authStore";
import PageNavi from "./PageNavi";

export default function MarketList(){
    const serverUrl = import.meta.env.VITE_BACK_SERVER;
    const axiosInstance=createInstance();

    const [marketList, setMarketList] =useState([]);
    const [reqPage, setReqPage]=useState(1);
    const [pageInfo, setPageInfo] = useState({});           
    const {isLogined} = useAuthStore();

    useEffect(function(){
        let options={};
        options.url=serverUrl + "/market/list";
        options.method='get';

        axiosInstance(options)
        .then(function(res){
            console.log(res.data);
            setMarketList(res.data.resData.marketList);
            //setPageInfo(res.data.resData.pageInfo);
        });
    },[reqPage]);


    return(
        <div>
            <div>Market</div>
            {isLogined
            ?
            <Link to="/market/write" className="btn-primary">판매글 쓰기</Link>
            :''}
            <div>
                <ul>
                    {marketList.map(function(market, index){
                        return <MarketItem key={"market"+index} market={market} />
                    })}
                </ul>
            </div>
            <div>
                <PageNavi pageInfo={pageInfo} reqPage={reqPage} setReqPage={setReqPage} />
            </div>
        </div>
    )
}

function MarketItem(props){
    const market=props.market;
    const navigate = useNavigate();

    return (
        <li onClick={function(){
            navigate("/market/view/" + market.marketNo);
        }}>
            <div>
                <div>{market.marketTitle}</div>
                <div>{market.userId}</div>
                <div>{market.marketDate}</div>
            </div>

        </li>
    )
}