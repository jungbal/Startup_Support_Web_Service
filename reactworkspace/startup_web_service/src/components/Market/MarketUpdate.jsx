import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import createInstance from "../../api/Interceptor";
import useAuthStore from "../../store/authStore";
import MarketFrm from "./MarketFrm";
import ToastEditor from "../common/ToastEditor";


export default function MarketUpdate(){

    const param=useParams(); //url 게시글 번호 추출
    const marketNo=param.marketNo;

    const serverUrl=import.meta.env.VITE_BACK_SERVER;
    const axiosInstance = createInstance();
    const navigate=useNavigate();

    //서버로 보낼 데이터 
    const {loginMember}=useAuthStore();
    const[marketTitle, setMarketTitle]= useState("");               //게시글 제목
    const[marketContent, setMarketContent]= useState("");           //본문 내용
    const[marketFile, setMarketFile]= useState([]);                 //첨부 파일
    const [marketPrice, setMarketPrice] = useState("");             //가격
    const [marketType, setMarketType] = useState("");               //분류

    //기존 게시글에 들어있던 파일 목록
    const[prevFileList, setPrevFileList] = useState([]);
    //지울 파일 목록
    const[delFileList, setDelFileList] = useState([]);
    
    useEffect(function(){
        let options={};
        options.url=serverUrl+'/market/'+marketNo;
        options.method='get';

        axiosInstance(options)
        .then(function(res){
            const market=res.data.resData.market;
            
            setMarketTitle(market.marketTitle);
            setMarketContent(market.marketContent);
            setMarketPrice(market.price);
            setMarketType(market.marketType);
            setPrevFileList(market.fileList);

        });
    },[]);

    //수정하기 버튼 클릭시 
    function updateMarket(){

    }

    return(
        <div>
            <div>게시글 작성</div>
            <form onSubmit={function(e){
                e.preventDefault();
                updateMarket();
            }}>
                <MarketFrm loginMember={loginMember}
                            marketTitle={marketTitle}
                            setMarketTitle={setMarketTitle}
                            marketFile={marketFile}
                            setMarketFile={setMarketFile}
                            marketPrice={marketPrice}
                            setMarketPrice={setMarketPrice}
                            marketType={marketType}
                            setMarketType={setMarketType}
                            prevFileList={prevFileList}
                            setPrevFileList={setPrevFileList}
                            delFileList={delFileList}
                            setDelFileList={setDelFileList}
                            >

                </MarketFrm>
                <div>
                    <ToastEditor marketContent={marketContent}
                                    setMarketContent={setMarketContent}
                                    type={1}>
                    </ToastEditor>
                </div>
                <div>
                    <button type="submit">수정하기</button>
                </div>
            </form>
        </div>
    )
}