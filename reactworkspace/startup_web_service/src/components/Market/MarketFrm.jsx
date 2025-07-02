import { style } from "@mui/system";
import { useRef, useState } from "react";
import Swal from "sweetalert2";

export default function MarketFrm(props){

    const loginMember = props.loginMember;
    const marketTitle = props.marketTitle;
    const setMarketTitle = props.setMarketTitle;
    const marketFile= props.marketFile;
    const setMarketFile=props.setMarketFile;
    const marketPrice = props.marketPrice;
    const setMarketPrice = props.setMarketPrice;
    const marketCategory = props.marketCategory;
    const setMarketCategory = props.setMarketCategory;

    //제목 변경시 호출
    function chgMarketTitle(e){
        setMarketTitle(e.target.value);
    }

    //가격 변경시 호출 함수
    function chgMarketPrice(e) {
        setMarketPrice(e.target.value);
    }

    //분류 변경 함수
    function chgMarketCategory(e) {
        setMarketCategory(e.target.value);
    }

    //이미지 미리보기용 변수(서버에 전송x)
    const[marketImg, setMarketImg]=useState([]);
    //현재 보고 있는 이미지 인덱스
    const [currentImgIndex, setCurrentImgIndex] = useState(0); 
    //input type=file인 썸네일 업로드 요소와 연결하여 사용
    const thumbFileEl=useRef(null);

    //이미지 변경 시 호출 함수(onChange)
    function chgThumbFile(e){
        const files=e.target.files;

        if(files.length>10){
            Swal.fire({
                title :'알림',
                text:'이미지는 최대 10장까지 업로드 가능합니다',
                icon :"warning"
            });
        }

        const fileArr=new Array(); // 파일 업로드를 위한 배열 //map 등등 배열에 쓸 수 있는 함수들 쓰기 위함
        const imgArr=new Array(); // 파일 미리 보기를 위한 배열

        if(files.length>0){
            let loadedCount = 0;

            for(let i=0; i<files.length; i++){
                fileArr.push(files[i]);    //서버에 전송될 파일 객체 넣기 
                
                //이미지 화면에 보여주기
                const reader = new FileReader();    //브라우저에서 파일을 비동기적으로 읽을 수 있게 해주는 객체
                reader.readAsDataURL(files[i]);     //파일 데이터 읽어오기
                reader.onloadend=function(){        //모두 읽어오면 실행할 함수 작성
                    imgArr[i] = reader.result;
                    loadedCount++;

                    //모든 이미지 로딩 끝났을 때 한 번만 set
                    if(loadedCount === files.length){
                        setMarketImg(imgArr);
                    }
                };
            }
            setMarketFile(fileArr); //서버에 전송될 파일배열 세팅 

        }else{
            setMarketFile([]);
            setMarketImg([]);
            setCurrentImgIndex(0);
        }

    }

    // 이미지 삭제
    function removeImage(index) {
        const updatedImgs = marketImg.filter(function (img, i) {
            return i !== index;
        });

        const updatedFiles = marketFile.filter(function (file, i) {
            return i !== index;
        });

        setMarketImg(updatedImgs);
        setMarketFile(updatedFiles);
    }


    const dragItem = useRef();
    const dragOverItem = useRef();
    //드래그해서 사진 순서 바꾸기 
    function handleSortEnd() {
        const files = [...marketFile];
        const imgs = [...marketImg];

        const draggedItem = dragItem.current;
        const overItem = dragOverItem.current;

        const tempFile = files[draggedItem];
        const tempImg = imgs[draggedItem];
        files[draggedItem] = files[overItem];
        imgs[draggedItem] = imgs[overItem];
        files[overItem] = tempFile;
        imgs[overItem] = tempImg;

        setMarketFile(files);
        setMarketImg(imgs);
    }


    return (
        <div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {marketImg.length > 0
                ? //첨부 파일이 존재하는 경우 
                    marketImg.map(function (img, index) {
                        return (
                            <div key={index} style={{ position: "relative" }} draggable
                                onDragStart={() => (dragItem.current = index)}
                                onDragEnter={() => (dragOverItem.current = index)}
                                onDragEnd={handleSortEnd}>
                                <img src={img}
                                    alt={"미리보기" + index}
                                    onClick={function () {
                                        thumbFileEl.current.click();
                                    }}
                                    style={{
                                        width: "100px",
                                        height: "100px",
                                        objectFit: "cover",
                                        border: "1px solid #ccc",
                                        cursor: "pointer",
                                    }}
                                />
                                {index == 0 && (
                                    <span
                                        style={{
                                        position: "absolute",
                                        top: "5px",
                                        left: "5px",
                                        background: "#007bff",
                                        color: "white",
                                        padding: "2px 6px",
                                        borderRadius: "4px",
                                        fontSize: "12px",
                                        }}
                                    >
                                        대표
                                    </span>
                                )}
                                <button type="button"
                                        onClick={function () {
                                        removeImage(index);
                                    }}
                                    style={{
                                        position: "absolute",
                                        top: "-5px",
                                        right: "-5px",
                                        background: "red",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: "20px",
                                        height: "20px",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                        lineHeight: "20px",
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        );
                    })
                
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
                        <tr>
                            <th>가격</th>
                            <td>
                                <input
                                type="number"
                                name="marketPrice"
                                value={marketPrice}
                                onChange={chgMarketPrice}
                                placeholder="숫자만 입력"
                                />
                            </td>
                        </tr>
                        <tr>
                            <th>분류</th>
                            <td>
                                <select value={marketCategory} onChange={chgMarketCategory}>
                                    <option value="sale">판매</option>
                                    <option value="purchase">구매</option>
                                    <option value="free">무료나눔</option>
                                </select>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    )
}