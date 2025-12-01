import { useCallback, useRef } from 'react';
import styles from './Editor.module.css';

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
  '/1 ': '# ',
  '/2 ': '## ',
  '/3 ': '### ',
  '/4 ': '#### ',
};

export function Editor({ value, onChange }: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      let newValue = e.target.value;

      // 슬래시 단축키 변환
      for (const [shortcut, replacement] of Object.entries(SLASH_SHORTCUTS)) {
        if (newValue.endsWith(shortcut)) {
          newValue = newValue.slice(0, -shortcut.length) + replacement;
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
