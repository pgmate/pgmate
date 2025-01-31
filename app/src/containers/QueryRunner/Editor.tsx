/**
 * Editor component for QueryRunner
 * so far we use the CodeViewer component as a shortcut.
 *
 * Here there should be a fully functional editor component with autocomplete and syntax highlighting...
 */

import { CodeViewer } from "components/CodeViewer";

interface EditorProps {
  source: string;
  onChange: (source: string) => void;
  onRequestRun: (source: string) => void;
}

export const Editor: React.FC<EditorProps> = ({
  source,
  onChange,
  onRequestRun,
}) => {
  return (
    <CodeViewer
      autoScrollIntoView
      readOnly={false}
      height={200}
      language="sql"
      code={source}
      onChange={onChange}
      onRequestRun={onRequestRun}
    />
  );
};
