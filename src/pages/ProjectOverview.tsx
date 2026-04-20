import { useEffect, useRef, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
  ActionIcon,
  Box,
  Button,
  Card,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Space,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconActivity,
  IconCheck,
  IconFile,
  IconLayout,
  IconPlus,
  IconSettings,
  IconTargetArrow,
  IconUsers,
  IconX,
} from "@tabler/icons-react";

import dayjs from "dayjs";
import "dayjs/locale/de";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
dayjs.locale("de");

import { useBoardsByProject, useCreateBoard } from "../api/boards";
import { useCreateDocument, useDocumentsByProject } from "../api/documents";
import { useProject } from "../api/projects";

export default function ProjectOverview() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const project = useProject(projectId);
  const boards = useBoardsByProject(projectId);
  const documents = useDocumentsByProject(projectId);
  const createBoard = useCreateBoard();
  const createDoc = useCreateDocument();

  const [creatingBoard, setCreatingBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [creatingDoc, setCreatingDoc] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");

  const boardInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const isLoading = project.isLoading || boards.isLoading || documents.isLoading;

  useEffect(() => {
    if (creatingBoard) boardInputRef.current?.focus();
  }, [creatingBoard]);

  useEffect(() => {
    if (creatingDoc) docInputRef.current?.focus();
  }, [creatingDoc]);

  const handleCreateBoard = () => {
    if (!newBoardTitle.trim()) return;
    createBoard.mutate(
      { title: newBoardTitle.trim(), project: projectId },
      {
        onSuccess: () => {
          setCreatingBoard(false);
          setNewBoardTitle("");
        },
      },
    );
  };

  const handleCreateDoc = () => {
    if (!newDocTitle.trim()) return;
    createDoc.mutate(
      { title: newDocTitle.trim(), project: projectId },
      {
        onSuccess: () => {
          setCreatingDoc(false);
          setNewDocTitle("");
        },
      },
    );
  };

  if (isLoading) return <Loader color="gray" />;

  return (
    <Box key={projectId} p="xl">
      <Group justify="space-between" mb="xl">
        <Title style={{ fontFamily: "Outfit", fontWeight: 400 }}>
          {project.data?.name}
        </Title>
        <Button
          variant="subtle"
          color="gray"
          leftSection={<IconSettings size="1.2em" stroke={1.5} />}
          onClick={() => navigate(`/projects/${projectId}/settings`)}
        >
          Einstellungen
        </Button>
      </Group>

      <Stack gap="xl">
        <Box>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase">
            Boards
          </Text>

          {boards.data?.length === 0 && (
            <Text size="sm" c="dimmed">
              Keine Boards vorhanden
            </Text>
          )}

          <Space h="md" />

          <SimpleGrid cols={3} spacing="sm">
            {boards.data?.map((board) => (
              <Card
                key={board.id}
                withBorder
                shadow="sm"
                padding="md"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/boards/${board.id}`)}
              >
                <Group gap="xs">
                  <IconLayout size="1em" stroke={1.5} />
                  <Text size="sm">{board.title}</Text>
                </Group>
                {/* <Text size="xs" c="dimmed" mt="xs">
                  {dayjs(board.updated).fromNow()}
                </Text> */}
              </Card>
            ))}
          </SimpleGrid>

          <Space h="sm" />

          {creatingBoard ? (
            <Group gap="xs" maw={400}>
              <TextInput
                ref={boardInputRef}
                size="sm"
                placeholder="Board Name"
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateBoard();
                  if (e.key === "Escape") {
                    setCreatingBoard(false);
                    setNewBoardTitle("");
                  }
                }}
                style={{ flex: 1 }}
              />
              <ActionIcon
                variant="subtle"
                color="green"
                size="sm"
                onClick={handleCreateBoard}
                disabled={!newBoardTitle.trim()}
              >
                <IconCheck size="0.9em" stroke={1.5} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                onClick={() => {
                  setCreatingBoard(false);
                  setNewBoardTitle("");
                }}
              >
                <IconX size="0.9em" stroke={1.5} />
              </ActionIcon>
            </Group>
          ) : (
            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconPlus size="0.9em" stroke={1.5} />}
              onClick={() => {
                setNewBoardTitle("");
                setCreatingBoard(true);
              }}
            >
              Neues Board
            </Button>
          )}
        </Box>

        <Box>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase">
            Dokumente
          </Text>

          {documents.data?.length === 0 && (
            <Text size="sm" c="dimmed">
              Keine Dokumente vorhanden
            </Text>
          )}

          <Space h="md" />

          <SimpleGrid cols={3} spacing="sm">
            {documents.data?.map((doc) => (
              <Card
                key={doc.id}
                withBorder
                shadow="sm"
                padding="md"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/documents/${doc.id}`)}
              >
                <Group gap="xs">
                  <IconFile size="1em" stroke={1.5} />
                  <Text size="sm">{doc.title || "Untitled"}</Text>
                </Group>
                <Text size="xs" c="dimmed" mt="xs">
                  {dayjs(doc.updated).fromNow()}
                </Text>
              </Card>
            ))}
          </SimpleGrid>

          <Space h="sm" />

          {creatingDoc ? (
            <Group gap="xs" maw={400}>
              <TextInput
                ref={docInputRef}
                size="sm"
                placeholder="Dokument Name"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateDoc();
                  if (e.key === "Escape") {
                    setCreatingDoc(false);
                    setNewDocTitle("");
                  }
                }}
                style={{ flex: 1 }}
              />
              <ActionIcon
                variant="subtle"
                color="green"
                size="sm"
                onClick={handleCreateDoc}
                disabled={!newDocTitle.trim()}
              >
                <IconCheck size="0.9em" stroke={1.5} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                onClick={() => {
                  setCreatingDoc(false);
                  setNewDocTitle("");
                }}
              >
                <IconX size="0.9em" stroke={1.5} />
              </ActionIcon>
            </Group>
          ) : (
            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconPlus size="0.9em" stroke={1.5} />}
              onClick={() => {
                setNewDocTitle("");
                setCreatingDoc(true);
              }}
            >
              Neues Dokument
            </Button>
          )}
        </Box>

        <SimpleGrid cols={2} spacing="sm">
          <Paper withBorder p="md" radius="sm" style={{ borderStyle: "dashed", opacity: 0.6 }}>
            <Group gap="xs" mb="xs">
              <IconActivity size="1.2em" stroke={1.5} />
              <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                Aktivitaet (Activity Feed)
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              Recent card/doc changes within this project.
              From card_events/document_events filtered by project.
              Great for seeing what changed since your last visit.
            </Text>
          </Paper>

          <Paper withBorder p="md" radius="sm" style={{ borderStyle: "dashed", opacity: 0.6 }}>
            <Group gap="xs" mb="xs">
              <IconTargetArrow size="1.2em" stroke={1.5} />
              <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                Anstehende Fristen (Due Dates)
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              Cards with due dates from this project, sorted by date.
              Show priority color, card title, board, days remaining.
              Basically a project-scoped version of the Home deadlines widget.
            </Text>
          </Paper>

          <Paper withBorder p="md" radius="sm" style={{ borderStyle: "dashed", opacity: 0.6 }}>
            <Group gap="xs" mb="xs">
              <IconUsers size="1.2em" stroke={1.5} />
              <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                Team (Project Members)
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              List of project_members with avatars.
              Show role (admin/member), card count per member, last active.
              Maybe "cards assigned to each member" breakdown.
            </Text>
          </Paper>

          <Paper withBorder p="md" radius="sm" style={{ borderStyle: "dashed", opacity: 0.6 }}>
            <Group gap="xs" mb="xs">
              <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                Kartenstatus (Card Stats)
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              Total cards, by priority (high/medium/low), by label.
              Progress bar: cards done vs total (needs "done" concept).
              Priority distribution chart or simple counts.
            </Text>
          </Paper>
        </SimpleGrid>
      </Stack>
    </Box>
  );
}
