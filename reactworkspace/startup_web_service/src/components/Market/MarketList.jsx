import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import createInstance from "../../api/Interceptor";
import useAuthStore from "../../store/authStore";
import PageNavi from "../common/PageNavi";
import "./MarketList.css"; 

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';



export default function MarketList(){
    const serverUrl = import.meta.env.VITE_BACK_SERVER;
    const axiosInstance=createInstance();

    const [marketList, setMarketList] =useState([]);
    const [reqPage, setReqPage]=useState(1);
    const [pageInfo, setPageInfo] = useState({});           
    const {isLogined} = useAuthStore();

    //마켓글 불러오기
    useEffect(function(){
        let options={};
        options.url=serverUrl + "/market/list/"+reqPage;
        options.method='get';

        axiosInstance(options)
        .then(function(res){
            setMarketList(res.data.resData.marketList);
            setPageInfo(res.data.resData.pageInfo);
        });
    },[reqPage]);

    

    return(
        <div className="market-list-container">
            <div className="market-header">
                <h1 className="marketTypo">Market</h1>
                {isLogined
                ?
                <Link to="/market/write" className="btn-primary">판매글 쓰기</Link>
                :''}
            </div>
            <div>
                <ul className="market-list">
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
    const serverUrl = import.meta.env.VITE_BACK_SERVER;
    const navigate = useNavigate();


    return (
        <li className="market-item" onClick={function(){
            navigate("/market/view/" + market.marketNo);
        }}>
            <Card sx={{ maxWidth: 345 }}>
                <CardActionArea>
                    <CardMedia
                        component="img"
                        height="300"
                        image={market.filePath ? serverUrl + "/market/postFile/" + market.filePath.substring(0,8) + "/" + market.filePath
                                                : "/image/default_img.png"}
                    />
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            {market.marketTitle}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {market.userId}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {market.marketDate}
                        </Typography>
                    </CardContent>
            
                </CardActionArea>
            </Card>
        </li>
    )
}