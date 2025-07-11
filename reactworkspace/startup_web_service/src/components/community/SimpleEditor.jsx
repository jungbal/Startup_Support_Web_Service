import React, { useState, useEffect } from 'react';
import './SimpleEditor.css';

const SimpleEditor = function({ initialValue = '', onChange, height = '300px' }) {
  const [content, setContent] = useState(initialValue);

  // 초기값이 변경될 때 content 업데이트
  useEffect(function() {
    if (initialValue !== content) {
      setContent(initialValue);
    }
  }, [initialValue]);

  // 내용 변경 핸들러
  const handleContentChange = function(e) {
    const newContent = e.target.value;
    setContent(newContent);
    if (onChange) {
      onChange(newContent);
    }
  };

  // 텍스트 삽입 함수
  const insertText = function(beforeText, afterText = '') {
    const textarea = document.getElementById('simple-editor-textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newContent = 
      content.substring(0, start) + 
      beforeText + selectedText + afterText + 
      content.substring(end);
    
    setContent(newContent);
    if (onChange) {
      onChange(newContent);
    }
    
    // 포커스 유지
    setTimeout(function() {
      textarea.focus();
      textarea.setSelectionRange(
        start + beforeText.length, 
        start + beforeText.length + selectedText.length
      );
    }, 0);
  };

  // 툴바 버튼 핸들러들
  const handleBold = function() {
    insertText('**', '**');
  };

  const handleItalic = function() {
    insertText('*', '*');
  };

  const handleUnderline = function() {
    insertText('__', '__');
  };

  const handleLink = function() {
    const url = prompt('링크 URL을 입력하세요:');
    if (url) {
      insertText('[링크텍스트](', `${url})`);
    }
  };

  const handleList = function() {
    insertText('- ');
  };

  const handleNumberList = function() {
    insertText('1. ');
  };

  const handleQuote = function() {
    insertText('> ');
  };

  const handleCode = function() {
    insertText('`', '`');
  };

  return (
    <div className="simple-editor">
      <div className="editor-toolbar">
        <button type="button" className="toolbar-btn" onClick={handleBold} title="굵게">
          <strong>B</strong>
        </button>
        <button type="button" className="toolbar-btn" onClick={handleItalic} title="기울임">
          <em>I</em>
        </button>
        <button type="button" className="toolbar-btn" onClick={handleUnderline} title="밑줄">
          <u>U</u>
        </button>
        <div className="toolbar-divider"></div>
        <button type="button" className="toolbar-btn" onClick={handleLink} title="링크">
          🔗
        </button>
        <button type="button" className="toolbar-btn" onClick={handleList} title="목록">
          •
        </button>
        <button type="button" className="toolbar-btn" onClick={handleNumberList} title="번호목록">
          1.
        </button>
        <button type="button" className="toolbar-btn" onClick={handleQuote} title="인용">
          "
        </button>
        <button type="button" className="toolbar-btn" onClick={handleCode} title="코드">
          {'</>'}
        </button>
      </div>
      
      <textarea
        id="simple-editor-textarea"
        className="editor-textarea"
        value={content}
        onChange={handleContentChange}
        placeholder="내용을 입력하세요..."
        style={{ height: height }}
        rows={10}
      />
      
      <div className="editor-info">
        <span className="char-count">{content.length} / 500자</span>
        <span className="editor-help">
          **굵게**, *기울임*, __밑줄__, [링크](URL), `코드`, {'>'}인용 등을 사용할 수 있습니다.
        </span>
      </div>
    </div>
  );
};

export default SimpleEditor; 