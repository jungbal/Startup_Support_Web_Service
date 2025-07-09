import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { Viewer } from "@toast-ui/react-editor";
import createInstance from "../../api/Interceptor";
import "./MarketView.css"

export default function MarketView(){
    
    const params = useParams(); //url 뒤에 전달한 게시글 번호 불러오기 위해
    const marketNo=params.marketNo;

    const {loginMember}=useAuthStore(); //로그인 정보

    const serverUrl =import.meta.env.VITE_BACK_SERVER;
    const axiosInstance=createInstance();
    const navigate=useNavigate();

    const[market, setMarket]=useState({}); //게시글 1개 정보 저장
    const[marketFile, setMarketFile]=useState([]); //게시글 1개의 첨부파일들 리스트 
    const [currentImageIndex, setCurrentImageIndex] = useState(0); // 현재 이미지 인덱스

    //게시글 1개 정보 불러오기
    useEffect(function(){
        let options={};
        options.url=serverUrl+'/market/'+marketNo;
        options.method='get';

        axiosInstance(options)
        .then(function(res){
            setMarket(res.data.resData.market);
            

            //파일 순서인 fileOrder에 따라 배열을 정렬해주고 marketFile에 set해줌
            const sortedFiles = res.data.resData.files.sort(function(a, b) {
                return a.fileOrder - b.fileOrder;
            });
            setMarketFile(sortedFiles);
            
        });
    },[]);

    //게시글 삭제
    function deleteMarket(){
        let options={};
        options.url =serverUrl + '/market/' + market.marketNo;
        options.method='delete';

        axiosInstance(options)
        .then(function(res){
            if(res.data.resData){
                navigate('/market/list');
            }
        });
    }

    return(
        <div>
            <div>게시글 상세보기</div>
            <div>
                <div>
                    {   
                        //파일리스트가 존재할 때 사진 보여주기
                        marketFile.length > 0 ?  
                        <div className="image-slider">
                            <button className="arrow-btn" onClick={function(prev){
                                setCurrentImageIndex(function(prev) {
                                    return (prev - 1 + marketFile.length) % marketFile.length;
                                });
                            }}
                            >◀</button>

                            <img className="file-img"
                                 src={
                                        marketFile[currentImageIndex].filePath
                                        ? serverUrl + "/market/postFile/" + marketFile[currentImageIndex].filePath.substring(0, 8) + "/" + marketFile[currentImageIndex].filePath
                                        : "/image/default_img.png" //혹시나 해서 방어코드. marketFile이 null이 아니면 filePath가 비어있을일은 없긴 함.
            
                            } />

                            <button className="arrow-btn" onClick={function() {
                                setCurrentImageIndex(function(prev) {
                                    return (prev + 1) % marketFile.length;
                                });
                            }}
                            >▶</button>
                        </div>

                        :
                        //파일이 존재하지 않을때 기본 이미지 보여주기
                        <div className="image-slider">
                            <img className="file-img" src={"/image/default_img.png"} />
                        </div>
                    }
                    {
                        //인디케이터 추가
                        marketFile.length > 1 &&
                        <div className="indicator-wrap">
                            {
                                marketFile.map(function(_, idx) {
                                    return (
                                        <span 
                                            key={"dot" + idx} 
                                            className={currentImageIndex === idx ? "dot active" : "dot"}
                                            onClick={function() {
                                                setCurrentImageIndex(idx);
                                            }}
                                        >●</span>
                                    )
                                })
                            }
                        </div>
                    }
                </div>
                <div>
                    <table className="tbl">
                        <tbody>
                            <tr>
                                <td className="left" colSpan={4}>
                                    {market.marketTitle}
                                </td>
                            </tr>
                            <tr>
                                <th style={{width:"20%"}}>작성자</th>
                                <td style={{width:"20%"}}>{market.userId}</td>
                                <th style={{width:"20%"}}>작성일</th>
                                <td style={{width:"20%"}}>{market.marketDate}</td>
                                <th style={{width:"20%"}}>조회수</th>
                                <td style={{width:"20%"}}>{market.readCount}</td>
                            </tr>
                            <tr>
                                <th style={{width:"20%"}}>가격</th>
                                <td style={{width:"20%"}}>{market.price}</td>
                                <th style={{width:"20%"}}>구분</th>
                                <td style={{width:"20%"}}>{market.marketType}</td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="board-content-wrap">
                                        {   market.marketContent
                                            ? <Viewer initialValue={market.marketContent} />
                                            : ''
                                        }
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                
                <div className="view-btn-zone">
                {
                    loginMember != null && loginMember.userId == market.userId
                    ?
                    <div className="view-btn-zone">
                        <Link to={'/market/update/'+market.marketNo} className="btn-primary lb">수정</Link>
                        <button type="button" className="btn-cecondary lg" onClick={deleteMarket}>삭제</button>
                    </div>
                    : ''    
                }
                </div>
            </div>
        </div>
    )
}

//이미지 파일 한 개 정보
/*
function FileItem(props){
    const file=props.file;

    const serverUrl =import.meta.env.VITE_BACK_SERVER;
    const axiosInstance=createInstance();

    return(
        <div>
            <img className="file-img" src={
                        file.filePath ? serverUrl + "/market/postFile/" + file.filePath.substring(0,8) + "/" + file.filePath
                                                : "/image/default_img.png"
                    }/>
        </div>
    )
}
*/