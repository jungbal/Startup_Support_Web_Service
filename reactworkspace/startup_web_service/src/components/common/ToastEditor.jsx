import '@toast-ui/editor/dist/toastui-editor.css'
import {Editor} from '@toast-ui/react-editor';
import { useEffect, useRef } from 'react';
import createInstance from '../../api/Interceptor';


//게시글 본문 작성을 위한 에디터 
export default function ToastEditor(props){
    const marketContent=props.marketContent;
    const setMarketContent=props.setMarketContent;
    const type= props.type; //등록 : 0, 수정 : 1
    
    const editorRef=useRef(null); //에디터와 연결할 ref 변수

    function changeContent(e){
        //에디터 본문에 작성한 내용 state변수에 세팅
        const editorText=editorRef.current.getInstance().getHTML(); 
        setMarketContent(editorText);
    }
    
    //툴바 커스텀 (이미지 업로드 제거)
    const customToolbar = [
        ['heading', 'bold', 'italic', 'strike'],
        ['hr', 'quote'],
        ['ul', 'ol', 'task'],
        ['table', 'link'],
        ['code', 'codeblock']
    ];


    return(
        <div style={{width : '100%', marginTop:'20px'}}>
            {/*
                initialEditType="wysiwyg"   => HTML 작성 없이 일반 텍스트로 작성 가능
            
                아래 조건식 작성 이유 

                수정인 경우 Update가 랜더링 되면서 호출하고 있는 에디터도 랜더링 됨 
                이후 서버에서 조회해온 게시글 정보로 State 변수를 변경하면 리랜더링이 일어남
                이 때, 에디터가 다시 그려지지 않는다 

                (1) MarketUpdate 컴포넌트로 전환 시 MarketContent는 초기값인 빈 문자열을 가지고 있다. 
                    이 때 에디터는 랜더링되지 않음 (아래 조건식에 의해)
                (2) MarketUpdate의 useEffect에 전달한 함수가 실행되고 MarketContent 변수를 변경함 
                    이 때 MarketContent는 빈 문자열이 아니므로 아래 조건식에 만족하여 에디터가 랜더링 된다
            */}
            {type == 0 || (type == 1 && marketContent != '')
            ?
            <Editor ref={editorRef}
                    initialValue={marketContent ? marketContent : ' '}
                    initialEditType="wysiwyg"
                    language="ko-KR"
                    height="600px"
                    onChange={changeContent}
                    hooks={{ addImageBlobHook: () => false }} //이미지 업로드 비활성화
                    toolbarItems={customToolbar} // 이미지 업로드 아이콘 비활성화
            />
            :''
            }
        </div>


    )

}