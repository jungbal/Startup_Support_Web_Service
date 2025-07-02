import { useState } from "react";
import createInstance from "../../api/Interceptor";
import useAuthStore from "../../store/authStore";
import MarketFrm from "./MarketFrm";
import ToastEditor from "../common/ToastEditor";

export default function MarketWrite(){

    const {loginMember}=useAuthStore();
    const[MarketTitle, setMarketTitle]= useState("");     //게시글 제목
    const[MarketContent, setMarketContent]= useState(""); //본문 내용
    const[MarketFile, setMarketFile]= useState([]);       //첨부 파일


    const serverUrl=import.meta.env.VITE_BACK_SERVER;
    const axiosInstnce= createInstance();

    return (
        <div>
            <div>게시글 작성</div>
            <form onSubmit={function(){
                e.preventDefault();
                MarketWrite();
            }}>
                <MarketFrm loginMember={loginMember}
                            MarketTitle={MarketTitle}
                            setMarketTitle={setMarketTitle}
                            MarketFile={MarketFile}
                            setMarketFile={setMarketFile}>
                </MarketFrm>
                <div>
                    <ToastEditor MarketContent={MarketContent}
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