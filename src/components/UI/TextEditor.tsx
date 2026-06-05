import { useEffect, useState } from "react";

import { Button, Group } from "@mantine/core";
import { Link, RichTextEditor } from "@mantine/tiptap";
import Highlight from "@tiptap/extension-highlight";
import SubScript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Underline from "@tiptap/extension-underline";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface TextEditorProps {
  content: string;
  onSave: (content: string) => void;
}

export function TextEditor({ content, onSave }: TextEditorProps) {
  const [isEditable, setIsEditable] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Superscript,
      SubScript,
      Highlight,
    ],
    content,
    editable: isEditable,
  });

  useEffect(() => {
    editor?.setEditable(isEditable);
    if (isEditable) {
      editor?.commands.focus();
    }
  }, [isEditable]);

  return (
    <>
      <RichTextEditor
        editor={editor}
        onClick={() => setIsEditable(true)}
        // style: not needed currently
      >
        {isEditable && (
          <RichTextEditor.Toolbar>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Bold />
              <RichTextEditor.Italic />
              <RichTextEditor.Underline />
              <RichTextEditor.Strikethrough />
              <RichTextEditor.ClearFormatting />
              <RichTextEditor.Highlight />
              <RichTextEditor.Code />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Blockquote />
              <RichTextEditor.Hr />
              <RichTextEditor.BulletList />
              <RichTextEditor.OrderedList />
              <RichTextEditor.Subscript />
              <RichTextEditor.Superscript />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Link />
              <RichTextEditor.Unlink />
            </RichTextEditor.ControlsGroup>
          </RichTextEditor.Toolbar>
        )}

        <RichTextEditor.Content />
      </RichTextEditor>

      {isEditable && (
        <Group mt={"sm"}>
          <Button
            variant="default"
            onClick={() => {
              onSave(editor?.getHTML() || "");
              setIsEditable(false);
            }}
          >
            Speichern
          </Button>

          <Button
            variant="subtle"
            color="gray"
            onClick={() => setIsEditable(false)}
          >
            Abbrechen
          </Button>
        </Group>
      )}
    </>
  );
}
