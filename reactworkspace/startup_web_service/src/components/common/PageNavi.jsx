import "../../styles/pageNavi.css";

import FirstPageIcon from '@mui/icons-material/FirstPage';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LastPageIcon from '@mui/icons-material/LastPage';

//목록 하단 페이지 네비게이션 제작 컴포넌트
export default function PageNavi(props){
    
    const pageInfo = props.pageInfo;        //페이지 네비게이션 정보
    const reqPage= props.reqPage;           //요청페이지
    const setReqPage = props.setReqPage;    //요청 페이지 변경 호출 함수

    const pageArr = new Array();            //페이지 네비게이션 JSX를 저장할 배열
    

    // << 제일 앞 페이지로 이동
    pageArr.push(
        <li key="first-page">
            <FirstPageIcon className="page-item page-button" onClick={function(){
                setReqPage(1);
            }}
            />
        </li>
    );
    
    // < 이전 페이지로 이동
    pageArr.push(
        <li key="prev-page">
            <NavigateBeforeIcon className="page-item page-button" onClick={function(){
                if(reqPage > 1){
                    setReqPage(reqPage-1);
                }
            }}
            />
        </li>
    );

    // 1 2 3 4 5 페이징 숫자 제작
    let pageNo = pageInfo.pageNo; //페이지 시작 번호
    for(let i=0; i<pageInfo.pageNaviSize;i++){
        pageArr.push(
            <li key={"page"+i}>
                <span className={"page-item"+ (pageNo == reqPage ? " active-page" : "")} onClick={function(e){
                setReqPage(e.target.innerText);
            }}>
                    {pageNo}
                </span>
            </li>
        );
        pageNo++;

        //항상 pageNaviSize만큼 제작하지 않고 게시글 전부 출력되었으면stop
        if(pageNo > pageInfo.totalPage){
            break;
        }
    }

    // > 다음 페이지로 이동
    pageArr.push(
        <li key="next-page">
            <NavigateNextIcon className="page-item page-button" onClick={function(){
                if(reqPage < pageInfo.totalPage){
                    setReqPage(reqPage+1);
                }
            }}
            />
        </li>
    );

    // >>제일 마지막 페이지로 이동

    pageArr.push(
        <li key="last-page">
            <LastPageIcon className="page-item page-button" onClick={function(){
                setReqPage(pageInfo.totalPage);
            }}
            />
        </li>
    );

    return(
        <ul className="pagination">
            {pageArr}
        </ul>
    )
}