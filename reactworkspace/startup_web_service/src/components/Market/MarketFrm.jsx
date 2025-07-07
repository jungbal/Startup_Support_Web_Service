import { style } from "@mui/system";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";

export default function MarketFrm(props){

    const loginMember = props.loginMember;
    const marketTitle = props.marketTitle;
    const setMarketTitle = props.setMarketTitle;
    const marketFile= props.marketFile;
    const setMarketFile=props.setMarketFile;
    const marketPrice = props.marketPrice;
    const setMarketPrice = props.setMarketPrice;
    const marketType = props.marketType;
    const setMarketType = props.setMarketType;

    //수정시 필요 데이터 
    const prevFileList=props.prevFileList;
    const setPrevFileList=props.setPrevFileList;
    const delFileList=props.delFileList;
    const setDelFileList=props.setDelFileList;

    const serverUrl=import.meta.env.VITE_BACK_SERVER;

    //제목 변경시 호출
    function chgMarketTitle(e){
        setMarketTitle(e.target.value);
    }

    //가격 변경시 호출 함수
    function chgMarketPrice(e) {
        setMarketPrice(e.target.value);
    }

    //분류 변경 함수
    function chgMarketType(e) {
        setMarketType(e.target.value);
    }


    //썸네일 이미지 미리보기용 변수(서버에 전송x)
    const [marketImg, setMarketImg] = useState([]);

    //수정시 기존 이미지 가져오기
    useEffect(function(){
        if (prevFileList && prevFileList.length > 0) {
            let serverImgs = [];

            for (let i = 0; i < prevFileList.length; i++) {
                let filePath = prevFileList[i].filePath;
                let imgUrl = serverUrl + "/market/postFile/" + filePath.substring(0, 8) + "/" + filePath;
                
                serverImgs.push({
                                    url: imgUrl,
                                    type: "old",
                                    filePath: filePath,
                                    marketFileNo : prevFileList[i].marketFileNo
                                });
            }

            setMarketImg(serverImgs); //미리보기 세팅
            updateFilesFromImgs(serverImgs); // 서버에 보낼 파일 세팅
        }
    }, [prevFileList]);



    //input type=file인 썸네일 업로드 요소와 연결하여 사용
    const thumbFileEl=useRef(null);

    //이미지 변경 시 호출 함수(onChange)
    function chgThumbFile(e){
        const files=e.target.files;

        // 현재 업로드된 이미지 총합 계산 (기존 이미지 + 새 이미지)
        const totalImageCount = marketImg.length + files.length;

        if(totalImageCount>10){
            Swal.fire({
                title :'알림',
                text:'이미지는 최대 10장까지 업로드 가능합니다',
                icon :"warning"
            });

            // 파일 선택 input 초기화
            e.target.value = "";
            return;
        }

        /* 새 파일과 미리보기 배열 준비 */
        const newImgArr   = [];            // 미리보기용 새 객체

        const fileArr=new Array(); // 파일 업로드를 위한 배열 //map 등등 배열에 쓸 수 있는 함수들 쓰기 위함
        const imgArr=[...marketImg]; // 파일 미리 보기를 위한 배열. 기존 이미지 복사해옴

        if(files.length>0){
            let loadedCount = 0;

            for(let i=0; i<files.length; i++){
                fileArr.push(files[i]);    //서버에 전송될 파일 객체 넣기 
                
                //이미지 화면에 보여주기
                const reader = new FileReader();    //브라우저에서 파일을 비동기적으로 읽을 수 있게 해주는 객체
                reader.readAsDataURL(files[i]);     //파일 데이터 읽어오기
                reader.onloadend=function(){        //모두 읽어오면 실행할 함수 작성
                    newImgArr.push({
                        url: reader.result,
                        file: files[i],
                        type: "new" // 새로 추가된 파일 표시
                    });
                    loadedCount++;

                    //모든 이미지 로딩 끝났을 때 한 번만 set
                    if(loadedCount == files.length){
                        setMarketFile(function(prev) {
                            const combinedImgs = imgArr.concat(newImgArr);
                            setMarketImg(combinedImgs);
                            updateFilesFromImgs(combinedImgs);
                        });
                    }
                };
            }
        }
    }

    // 이미지 삭제
    function removeImage(index) {
        const target = marketImg[index];

        /* 기존(old) delFileList에 추가 */
        if (target.type === "old") {
            setDelFileList(function(prev) {
                return prev.concat(target.marketFileNo);
            });
        }

        const updatedImgs = marketImg.filter(function (_, i) {
            return i !== index;
        });


        setMarketImg(updatedImgs); //미리보기 세팅
        updateFilesFromImgs(updatedImgs); //서버에 보낼 파일 세팅
    }

    const dragItem = useRef();
    const dragOverItem = useRef();
    //드래그해서 사진 순서 바꾸기 
    function handleSortEnd() {
        const imgs = [...marketImg];
        const draggedIndex = dragItem.current;
        const overIndex = dragOverItem.current;

        const temp = imgs[draggedIndex];
        imgs[draggedIndex] = imgs[overIndex];
        imgs[overIndex] = temp;

        setMarketImg(imgs); //미리보기 세팅
        updateFilesFromImgs(imgs);//서버에 보낼 파일 세팅
    }

    
    //이미지 순서와 대표 이미지 갱신 + marketFile set해주는 함수
    function updateFilesFromImgs(imgList) {
        const updatedFiles = imgList.map(function(img, index) {
            if (img.type == 'new') {
                return {
                    file: img.file,
                    fileOrder: index,
                    isMainFile: index == 0
                };
            } else {
                return {
                    marketFileNo: img.marketFileNo,
                    fileOrder: index,
                    isMainFile: index == 0
                };
            }
        });

        setMarketFile(updatedFiles);
    }


    return (
        <div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {marketImg.length > 0 
                ? 
                    //첨부 파일이 존재하는 경우 
                    marketImg.map(function (img, index) {
                        return (
                            <div key={index} style={{ position: "relative" }} draggable
                                onDragStart={function(){ dragItem.current = index; }}
                                onDragEnter={function(){ dragOverItem.current = index; }}
                                onDragEnd={handleSortEnd}>
                                <img src={img.url}
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
                
                : "" }
                {marketImg.length < 10 ? // 이미지 파일이 10장 이하 일시 input태그 보여줌 
                <div>
                    <img src="/image/default_img.png" onClick={function(e){
                                //e.target == img 요소 객체
                                //e.target의 속성을 이용해서 다음 요소인input을 동적으로 click하는게 가능하지만 react에서 권장되지 않음.
                                //useRef 라는 훅을 이용해 자바스크립트 변수와 input 요소를 연결시키고 해당 변수를 이용해서 컨트롤이 가능하다
                                thumbFileEl.current.click();
                    }} style={{ width: "100px", height: "100px"}} ></img>

                    
                    <input type="file" accept="image/*" style={{display :"none"}} ref={thumbFileEl} multiple onChange={chgThumbFile}/>
                </div>
                : "" }
                
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
                                <select value={marketType} onChange={chgMarketType}>
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


