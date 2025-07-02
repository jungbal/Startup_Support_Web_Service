import { style } from "@mui/system";
import { useRef, useState } from "react";

export default function MarketFrm(props){

    const loginMember = props.loginMember;
    const marketTitle = props.marketTitle;
    const setMarketTitle = props.setMarketTitle;
    const marketFile= props.marketFile;
    const setMarketFile=props.setMarketFile;


    //제목 변경시 호출
    function chgMarketTitle(e){
        setMarketTitle(e.target.value);
    }

    //썸네일 이미지 미리보기용 변수(서버에 전송x)
    const[MarketImg, setMarketImg]=useState(null);

    //input type=file인 썸네일 업로드 요소와 연결하여 사용
    const thumbFileEl=useRef(null);

    //썸네일 이미지 변경 시 호출 함수(onChange)
    function chgThumbFile(e){
        const files=e.target.files;

        if(files.length != 0 && files[0] != null){
            setMarketFile(files[0]);    //게시글 등록하기 클릭 시, 서버에 전송될 썸네일 파일 객체 세팅해주기 
            
            //썸네일 이미지 화면에 보여주기
            const reader = new FileReader();    //브라우저에서 파일을 비동기적으로 읽을 수 있게 해주는 객체
            reader.readAsDataURL(files[0]);     //파일 데이터 읽어오기
            reader.onloadend=function(){        //모두 읽어오면 실행할 함수 작성
                setMarketImg(reader.result);     //미리보기용 state 변수에 세팅
            }
        }else{
            //업로드 팝업 취소한 경우 썸네일 파일 객체와 미리보기용 변수 초기화
            setMarketFile(null);
            setMarketImg(null);
        }

    //사용자가 업로드한 첨부파일을 화면에 보여주기 위한 용도의 변수
    const [marketFileImg, setMarketFileImg]=useState([]); //업로드한 파일명

    //첨부파일 업로드 시 동작함수(onChange)
    function chgMarketFile(e){
        const files=e.target.files; //유사배열이라 배열에서 제공되는 map함수 사용 불가 //때문에 하단의 배열에 다시 넣어줌
        const fileArr=new Array();  //부모 컴포넌트에서 전달한 첨부파일 배열 state 변수에 매개변수로 전달할 배열
        const fileNameArr=new Array(); //화면에 첨부파일 목록을 노출시키기 위한 배열

        for(let i=0; i<files.length; i++){ //사용자가 업로드한 파일's 순회
            fileArr.push(files[i]);
            fileNameArr.push(files[i].name);
        }

        /*
        fileArr, fileNameArr앞에 전개 연산자(...)를 생략하면 배열자체가 하나의 요소로 추가된다.

        let aArr=['a','b'];
        let bArr=['c','d'];

        [...aArr, ...bArr]     => ['a','b','c','d']
        [...aArr, bArr]        => ['a','b',['c','d']]
        */

        setMarketFile([...marketFile, ...fileArr]);       //파일 객체 배열
        setMarketFileImg([...marketFileImg, ...fileNameArr]);//파일 이름 배열


        }
    }


    return (
        <div>
            <div>
                {MarketImg
                ? //첨부 파일이 존재하는 경우 
                <img src={MarketImg} onClick={function(e){
                    thumbFileEl.current.click();
                }}  style={{width : "200px"}}/>
                
                : //첨부 파일이 존재하지 않는 경우
                <img src="/image/default_img.png" onClick={function(e){
                            //e.target == img 요소 객체
                            //e.target의 속성을 이용해서 다음 요소인input을 동적으로 click하는게 가능하지만 react에서 권장되지 않음.
                            //useRef 라는 훅을 이용해 자바스크립트 변수와 input 요소를 연결시키고 해당 변수를 이용해서 컨트롤이 가능하다
                            thumbFileEl.current.click();
                }}></img>

                }
                <input type="file" accept="image/*" style={{display :"none"}} ref={thumbFileEl} multiple onChange={chgThumbFile}/>

            </div>

            <div>
                <table>
                    <tbody>
                        <tr>
                            <th style={{width : "30%"}}>
                                <label htmlFor="marketTitle">제목</label>
                            </th>
                            <td>
                                <div className="input-item">
                                    <input type="text"
                                            id="marketTitle"
                                            name="marketTitle"
                                            value={marketTitle}
                                            onChange={chgMarketTitle} />
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <th>작성자</th>
                            <td className="left">{loginMember.userId}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    )
}