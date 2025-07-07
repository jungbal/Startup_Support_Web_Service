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
        if(marketTitle != null && marketContent != null){
            const form= new FormData(); //서버에 보낼 폼 

            form.append('marketNo', marketNo);
            form.append('marketTitle',marketTitle);
            form.append('marketContent', marketContent);
            form.append('price',marketPrice);
            form.append('marketType', marketType);

            

            for(let i=0; i<marketFile.length;i++){ //추가할 첨부파일
                
                form.append('isMainFile', marketFile[i].isMainFile ? 'Y' : 'N'); //대표 이미지 여부
                form.append('fileOrder', marketFile[i].fileOrder); //파일 순서 
                form.append('fileType', marketFile[i].file ? 'new' : 'old'); // 새 파일이면 new, 아니면 old
                if (marketFile[i].type =='old') {
                    // 기존 파일이면 marketFileNo도 같이 넘겨줘야 update 가능.
                    form.append('marketFileNo', marketFile[i].marketFileNo);
                }else{
                    //새 파일만 파일 객체주면됨 
                    form.append('marketFile',marketFile[i].file);
                }
            }



            for(let i=0; i<delFileList.length;i++){ //지울 첨부파일
                form.append('delFileList',delFileList[i]);
            }

            let options={};
            options.url=serverUrl+'/market';
            options.method='patch';
            options.data=form;
            options.headers={};
            options.headers.contentType="multipart/form-data";
            options.headers.processData=false;//쿼리 스트링 변환x

            console.log(1);

            axiosInstance(options)
            .then(function(res){
                if(res.data.resData){
                    navigate('/market/list/'+marketNo);
                }
            });

        }
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