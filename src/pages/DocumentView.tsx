import { Box, Loader, TextInput, Title } from "@mantine/core";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useDocument, useUpdateDocument } from "../api/documents";
import { TextEditor } from "../components/UI/TextEditor";

export function DocumentView() {
  const { documentId } = useParams();

  const doc = useDocument(documentId);
  const updateDocument = useUpdateDocument();

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");

  if (doc.isLoading) return <Loader color="gray" />;

  return (
    <Box p="xl" maw={860}>
      {editingTitle ? (
        <TextInput
          size="xl"
          value={titleValue}
          autoFocus
          onChange={(e) => setTitleValue(e.currentTarget.value)}
          onBlur={() => {
            if (titleValue.trim()) {
              updateDocument.mutate({ id: documentId!, data: { title: titleValue.trim() } });
            }
            setEditingTitle(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape") {
              e.currentTarget.blur();
            }
          }}
          styles={{ input: { fontFamily: "Outfit", fontWeight: 400, fontSize: "2rem", border: "none" } }}
        />
      ) : (
        <Title
          style={{ fontFamily: "Outfit", fontWeight: 400, cursor: "text" }}
          mb="md"
          onClick={() => {
            setTitleValue(doc.data?.title ?? "");
            setEditingTitle(true);
          }}
        >
          {doc.data?.title || "Untitled"}
        </Title>
      )}

      <TextEditor
        content={doc.data?.content ?? ""}
        onSave={(content) => updateDocument.mutate({ id: documentId!, data: { content } })}
      />
    </Box>
  );
}
