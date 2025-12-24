import { useCallback, useRef, useLayoutEffect } from "react";
import styles from "./Editor.module.css";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

const PLACEHOLDER = `# 프로젝트명을 입력하세요
## 카테고리를 입력하세요
### 세부 항목을 입력하세요
#### 하위 세부사항을 입력하세요

예시:
# 주간 업무 보고
## 회의
### 일시 : 2024-11-27
### 내용 : 프로젝트 킥오프
## 개발
### API 설계
#### 엔드포인트 정의

팁: /1, /2, /3, /4 + Space로 빠르게 헤딩 입력`;

const SLASH_SHORTCUTS: Record<string, string> = {
  "/1 ": "# ",
  "/2 ": "## ",
  "/3 ": "### ",
  "/4 ": "#### ",
};

export function Editor({ value, onChange }: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingCursorRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (pendingCursorRef.current !== null && textareaRef.current) {
      textareaRef.current.selectionStart = pendingCursorRef.current;
      textareaRef.current.selectionEnd = pendingCursorRef.current;
      pendingCursorRef.current = null;
    }
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      let newValue = e.target.value;
      const cursorPos = e.target.selectionStart;

      // 커서 앞쪽 텍스트 추출
      const textBeforeCursor = newValue.slice(0, cursorPos);

      // 커서 위치 기준으로 슬래시 단축키 변환
      for (const [shortcut, replacement] of Object.entries(SLASH_SHORTCUTS)) {
        if (textBeforeCursor.endsWith(shortcut)) {
          const before = textBeforeCursor.slice(0, -shortcut.length);
          const after = newValue.slice(cursorPos);

          newValue = before + replacement + after;
          const lengthDiff = replacement.length - shortcut.length;
          pendingCursorRef.current = cursorPos + lengthDiff;
          break;
        }
      }

      onChange(newValue);
    },
    [onChange]
  );

  return (
    <div className={styles.container}>
      <textarea
        ref={textareaRef}
        className={styles.textarea}
        value={value}
        onChange={handleChange}
        placeholder={PLACEHOLDER}
        aria-label="마크다운 입력 영역"
        data-testid="editor"
        spellCheck={false}
      />
    </div>
  );
}
