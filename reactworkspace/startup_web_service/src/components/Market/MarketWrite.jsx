import { useState } from "react";
import createInstance from "../../api/Interceptor";
import useAuthStore from "../../store/authStore";
import MarketFrm from "./MarketFrm";
import ToastEditor from "../common/ToastEditor";
import { useNavigate } from "react-router-dom";

export default function MarketWrite(){

    const {loginMember}=useAuthStore();
    const[marketTitle, setMarketTitle]= useState("");               //게시글 제목
    const[marketContent, setMarketContent]= useState("");           //본문 내용
    const[marketFile, setMarketFile]= useState([]);                 //첨부 파일
    const [marketPrice, setMarketPrice] = useState("");             //가격
    const [marketType, setMarketType] = useState("sale");   //분류

    

    const serverUrl=import.meta.env.VITE_BACK_SERVER;
    const axiosInstnce= createInstance();
    const navigate = useNavigate();

    function MarketWrite(){
        if(marketTitle!='' && marketContent!=''){

            const form = new FormData(); //파일 업로드 시 사용할 수 있는 내장 객체
            //첫 번째로 작성하는 문자열 => input의 name 속성값 역할
            form.append("marketTitle",marketTitle);
            form.append("marketContent",marketContent);
            form.append("userId",loginMember.userId);
            form.append("price", marketPrice);
            form.append("marketType", marketType);

            console.log(loginMember);
            console.log(loginMember.memberId);


            for(let i=0; i<marketFile.length; i++){//첨부파일 업로드 한 경우에만
                form.append("marketFile", marketFile[i]);//모두 동일한 이름으로 append
            }

            let options={};
            options.method='post';
            options.url=serverUrl+'/market';
            options.data=form;
            options.headers={};
            options.headers.contentType="multipart/form-data";
            options.headers.processData=false;//쿼리스트링으로 변환하지 않도록 설정

            axiosInstnce(options)
            .then(function(res){
                navigate('/market/list')
            });
        }
    }

    return (
        <div>
            <div>게시글 작성</div>
            <form onSubmit={function(e){
                e.preventDefault();
                MarketWrite();
            }}>
                <MarketFrm loginMember={loginMember}
                            marketTitle={marketTitle}
                            setMarketTitle={setMarketTitle}
                            marketFile={marketFile}
                            setMarketFile={setMarketFile}
                            marketPrice={marketPrice}
                            setMarketPrice={setMarketPrice}
                            marketType={marketType}
                            setMarketType={setMarketType}>
                </MarketFrm>
                <div>
                    <ToastEditor marketContent={marketContent}
                                 setMarketContent={setMarketContent}
                                 type={0}>
                    </ToastEditor>
                </div>
                <div>
                    <button type="submit">등록하기</button>
                </div>
            </form>
        </div>
    )
}