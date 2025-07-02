import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuthStore from "../../store/authStore";

export default function MarketView(){
    
    const params = useParams(); //url 뒤에 전달한 게시글 번호 불러오기 위해
    const marketNo=params.marketNo;

    const {loginMember}=useAuthStore(); //로그인 정보

    const serverUrl =import.meta.env.VITE_BACK_SERVER;
    const axiosInstance=createInstance();
    const navigate=useNavigate();

    const[market, setMarket]=useState({}); //게시글 1개 정보 저장 
    
    //게시글 1개 정보 불러오기
    useEffect(function(){
        let options={};
        options.url=serverUrl+'/market/'+marketNo;
        options.method='get';

        axiosInstance(options)
        .then(function(res){
            setMarket(res.data.resData);
        });
    },[]);


    return(
        <div>
            <div>게시글 상세보기</div>
            <div>
                <div>
                    <img src={
                        market.market
                    }/>


                </div>
            </div>
        </div>
    )
}