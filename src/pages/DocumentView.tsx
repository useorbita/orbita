import { useRef, useState } from "react";

import { useParams } from "react-router-dom";

import {
  Button,
  Container,
  Group,
  Loader,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";

import dayjs from "dayjs";
import "dayjs/locale/de";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
dayjs.locale("de");

import { useDocument, useUpdateDocument } from "../api/documents";

import { DocumentEditor, type DocumentEditorHandle } from "../components/UI/DocumentEditor";

export function DocumentView() {
  const { documentId } = useParams();

  const doc = useDocument(documentId);
  const updateDocument = useUpdateDocument();

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");

  const [editingContent, setEditingContent] = useState(false);
  const editorRef = useRef<DocumentEditorHandle>(null);

  if (doc.isLoading) return <Loader color="gray" />;

  return (
    <Container key={documentId} pt="md">
      <Group justify="space-between" p="md">
        <Stack gap={0}>
          {editingTitle ? (
            <TextInput
              size="xl"
              value={titleValue}
              autoFocus
              onChange={(e) => setTitleValue(e.currentTarget.value)}
              onBlur={() => {
                if (titleValue.trim()) {
                  updateDocument.mutate({
                    id: documentId!,
                    data: { title: titleValue.trim() },
                  });
                }
                setEditingTitle(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Escape") {
                  e.currentTarget.blur();
                }
              }}
              styles={{
                input: {
                  fontFamily: "Outfit",
                  fontWeight: 400,
                  fontSize: "2rem",
                  border: "none",
                },
              }}
            />
          ) : (
            <Title
              style={{ fontFamily: "Outfit", fontWeight: 400, cursor: "text" }}
              onClick={() => {
                setTitleValue(doc.data?.title ?? "");
                setEditingTitle(true);
              }}
            >
              {doc.data?.title || "Untitled"}
            </Title>
          )}

          <Text c={"dimmed"}>
            Zuletzt geändert {dayjs(doc.data?.updated).fromNow()}{" "}
          </Text>
        </Stack>

        <Button
          variant={"default"}
          color="gray"
          onClick={() => {
            if (editingContent) {
              const html = editorRef.current?.getHTML() ?? "";
              updateDocument.mutate({ id: documentId!, data: { content: html } });
            }
            setEditingContent(!editingContent);
          }}
        >
          {editingContent ? "Speichern" : "Bearbeiten"}
        </Button>
      </Group>

      <DocumentEditor
        ref={editorRef}
        content={doc.data?.content ?? ""}
        isEditable={editingContent}
      />
    </Container>
  );
}
