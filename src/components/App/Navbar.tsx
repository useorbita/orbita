import {
  ActionIcon,
  AppShell,
  Button,
  Divider,
  Group,
  Loader,
  Modal,
  NavLink,
  Select,
  Space,
  Text,
  TextInput,
  Tooltip,
  Avatar as MantineAvatar,
  Box,
  ScrollArea,
} from "@mantine/core";
import {
  IconCalendar,
  IconCheck,
  IconCircleDotted,
  IconDots,
  IconFile,
  IconHome,
  IconLayout,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconPlus,
  IconSearch,
  IconSettings,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBoards } from "../../api/boards";
import { useCreateBoard } from "../../api/boards";
import { useCreateDoc } from "../../api/docs";
import { useDocs } from "../../api/docs";
import {
  useCreateOrganization,
  useOrganizations,
} from "../../api/organizations";
import { pb } from "../../api/pocketbase";
import { useCreateProject, useProjects } from "../../api/projects";
import { getInitials } from "../../shared/nameUtils";

interface NavbarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Navbar({ collapsed, onToggleCollapse }: NavbarProps) {
  const organizations = useOrganizations();
  const projects = useProjects();
  const boards = useBoards();
  const docs = useDocs();

  const createOrganization = useCreateOrganization();
  const createProject = useCreateProject();
  const createBoard = useCreateBoard();
  const createDoc = useCreateDoc();

  const navigate = useNavigate();

  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  // Modal state for org/project creation
  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");

  // Inline creation state for boards/docs
  const [creatingBoardForProject, setCreatingBoardForProject] = useState<
    string | null
  >(null);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [creatingDocForProject, setCreatingDocForProject] = useState<
    string | null
  >(null);
  const [newDocTitle, setNewDocTitle] = useState("");

  const boardInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const isLoading =
    organizations.isLoading ||
    projects.isLoading ||
    boards.isLoading ||
    docs.isLoading;

  // Build select data for organizations
  const orgSelectData = useMemo(() => {
    if (!organizations.data) return [];
    const items = [...organizations.data]
      .sort((a, b) => {
        if (a.is_personal && !b.is_personal) return -1;
        if (!a.is_personal && b.is_personal) return 1;
        return 0;
      })
      .map((org) => ({
        value: org.id,
        label: org.is_personal ? "Dein Bereich" : org.name || org.id,
      }));
    items.push({ value: "__create__", label: "+ Neue Organisation" });
    return items;
  }, [organizations.data]);

  // Auto-select the first org when data loads
  useEffect(() => {
    if (!selectedOrgId && orgSelectData.length > 0) {
      setSelectedOrgId(orgSelectData[0].value);
    }
  }, [selectedOrgId, orgSelectData]);

  // Focus inline inputs when they appear
  useEffect(() => {
    if (creatingBoardForProject) boardInputRef.current?.focus();
  }, [creatingBoardForProject]);

  useEffect(() => {
    if (creatingDocForProject) docInputRef.current?.focus();
  }, [creatingDocForProject]);

  // Compute projects with their boards and docs for the selected org
  const orgProjects = useMemo(() => {
    if (!selectedOrgId || !projects.data || !boards.data || !docs.data)
      return [];
    return projects.data
      .filter((p) => p.organization === selectedOrgId)
      .map((project) => ({
        ...project,
        boards: boards.data.filter((b) => b.project === project.id),
        docs: docs.data.filter((d) => d.project === project.id),
      }));
  }, [selectedOrgId, projects.data, boards.data, docs.data]);

  // Handlers
  const handleOrgSelectChange = (value: string | null) => {
    if (value === "__create__") {
      setOrgModalOpen(true);
    } else {
      setSelectedOrgId(value);
    }
  };

  const handleCreateOrg = () => {
    if (!orgName.trim()) return;
    createOrganization.mutate(
      { name: orgName.trim() },
      {
        onSuccess: (data) => {
          setSelectedOrgId(data.id);
          setOrgModalOpen(false);
          setOrgName("");
        },
      },
    );
  };

  const handleCreateProject = () => {
    if (!projectName.trim() || !selectedOrgId) return;
    createProject.mutate(
      { name: projectName.trim(), organization: selectedOrgId },
      {
        onSuccess: () => {
          setProjectModalOpen(false);
          setProjectName("");
        },
      },
    );
  };

  const handleCreateBoard = (projectId: string) => {
    if (!newBoardTitle.trim()) return;
    createBoard.mutate(
      { title: newBoardTitle.trim(), project: projectId },
      {
        onSuccess: () => {
          setCreatingBoardForProject(null);
          setNewBoardTitle("");
        },
      },
    );
  };

  const handleCreateDoc = (projectId: string) => {
    if (!newDocTitle.trim()) return;
    createDoc.mutate(
      { title: newDocTitle.trim(), project: projectId },
      {
        onSuccess: () => {
          setCreatingDocForProject(null);
          setNewDocTitle("");
        },
      },
    );
  };

  if (collapsed) {
    return (
      <>
        <AppShell.Section>
          {/* not ideal, but compensate positions */}
          <Box pt={19}>
            <Tooltip label="Aufklappen" position="right" withArrow>
              <NavLink
                leftSection={
                  <IconLayoutSidebarLeftExpand size="1.2em" color="grey" />
                }
                onClick={onToggleCollapse}
              />
            </Tooltip>
          </Box>

          {/* not ideal, but compensate positions */}
          <Box pt={18}>
            <Tooltip label="Übersicht" position="right" withArrow>
              <NavLink
                leftSection={<IconHome size={"1.2em"} stroke={1.5} />}
                onClick={() => navigate("/")}
              />
            </Tooltip>
          </Box>

          {/* not ideal, but compensate positions */}
          <Box pt={5}>
            <Tooltip label="Suche" position="right" withArrow>
              <NavLink
                leftSection={<IconSearch size={"1.2em"} stroke={1.5} />}
                onClick={() => navigate("/search")}
              />
            </Tooltip>
          </Box>

          <Space h="md" />
          <Divider />
        </AppShell.Section>

        <AppShell.Section grow />

        <AppShell.Section>
          <Divider />
          <Tooltip label="Account & Einstellungen" position="right" withArrow>
            <NavLink
              leftSection={<IconUser size="1.2em" stroke={1.5} />}
              onClick={() => navigate("/settings")}
            />
          </Tooltip>
        </AppShell.Section>
      </>
    );
  }

  return (
    <>
      <AppShell.Section>
        <Group justify="space-between" pl="md" pt="lg" pb="md" pr="xs">
          <Text size="xl" style={{ fontFamily: "Outfit", fontWeight: 400 }}>
            Orbita
          </Text>

          <ActionIcon variant="subtle" onClick={onToggleCollapse}>
            <IconLayoutSidebarLeftCollapse size={"1.2em"} color="grey" />
          </ActionIcon>
        </Group>
        <NavLink
          label="Übersicht"
          leftSection={<IconHome size={"1.2em"} stroke={1.5} />}
          onClick={() => navigate("/")}
        />
        <NavLink
          label="Suchen"
          leftSection={<IconSearch size={"1.2em"} stroke={1.5} />}
          onClick={() => navigate("/search")}
        />
        <Space h="md" />
        <Divider />
        <Space h="lg" />
      </AppShell.Section>

      <AppShell.Section grow component={ScrollArea}>
        {isLoading ? (
          <Loader color="gray" m="md" />
        ) : (
          <>
            <Group px="sm" gap="xs" wrap="nowrap">
              <Select
                value={selectedOrgId}
                onChange={handleOrgSelectChange}
                data={orgSelectData}
                style={{ flex: 1 }}
              />
              {selectedOrgId && selectedOrgId !== "__create__" && (
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={() => navigate(`/org/${selectedOrgId}/settings`)}
                >
                  <IconSettings size="1.2em" stroke={1.5} />
                </ActionIcon>
              )}
            </Group>

            <Space h="md" />

            {orgProjects.length === 0 && (
              <Text size="sm" c="dimmed" px="sm" py="xs">
                Keine Projekte vorhanden
              </Text>
            )}

            {orgProjects.map((project) => (
              <NavLink
                key={project.id}
                label={project.name}
                leftSection={<IconCircleDotted size="1.2em" stroke={1.5} />}
                childrenOffset={0}
                defaultOpened
              >
                {/* Calendar section */}
                <NavLink
                  label={"Kalender"}
                  leftSection={<IconCalendar size="1.2em" stroke={1.5} />}
                  onClick={() => navigate(`/${project.id}/calendar`)}
                />

                {/* Settings section */}
                <NavLink
                  label={"Projekteinstellungen"}
                  leftSection={<IconSettings size="1.2em" stroke={1.5} />}
                  onClick={() => navigate(`/${project.id}/settings`)}
                />

                {/* Boards section */}
                <Group justify="space-between" px="sm" mt="sm">
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                    Boards
                  </Text>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="xs"
                    onClick={() => {
                      setCreatingBoardForProject(project.id);
                      setNewBoardTitle("");
                    }}
                  >
                    <IconPlus size="0.9em" stroke={1.5} />
                  </ActionIcon>
                </Group>

                {project.boards.length === 0 &&
                  creatingBoardForProject !== project.id && (
                    <Text size="xs" c="dimmed" px="sm" py={4}>
                      Keine Boards vorhanden
                    </Text>
                  )}

                {project.boards.map((board) => (
                  <NavLink
                    key={board.id}
                    label={board.title}
                    leftSection={<IconLayout size="1.2em" stroke={1.5} />}
                    rightSection={
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="sm"
                        aria-label="Settings"
                        onClick={(e) => {
                          navigate(`/${board.id}/settings`);
                          e.stopPropagation();
                        }}
                      >
                        <IconDots size="0.9em" stroke={1.5} />
                      </ActionIcon>
                    }
                    onClick={() => navigate(`/${board.id}`)}
                  />
                ))}

                {/* Inline board creation */}
                {creatingBoardForProject === project.id && (
                  <Group gap="xs" px="sm" py={4}>
                    <TextInput
                      ref={boardInputRef}
                      size="xs"
                      placeholder="Board Name"
                      value={newBoardTitle}
                      onChange={(e) => setNewBoardTitle(e.currentTarget.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreateBoard(project.id);
                        if (e.key === "Escape") {
                          setCreatingBoardForProject(null);
                          setNewBoardTitle("");
                        }
                      }}
                      style={{ flex: 1 }}
                    />
                    <ActionIcon
                      variant="subtle"
                      color="green"
                      size="sm"
                      onClick={() => handleCreateBoard(project.id)}
                      disabled={!newBoardTitle.trim()}
                    >
                      <IconCheck size="0.9em" stroke={1.5} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      onClick={() => {
                        setCreatingBoardForProject(null);
                        setNewBoardTitle("");
                      }}
                    >
                      <IconX size="0.9em" stroke={1.5} />
                    </ActionIcon>
                  </Group>
                )}

                <Space h="xs" />

                {/* Documents section */}
                <Group justify="space-between" px="sm">
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                    Dokumente
                  </Text>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="xs"
                    onClick={() => {
                      setCreatingDocForProject(project.id);
                      setNewDocTitle("");
                    }}
                  >
                    <IconPlus size="0.9em" stroke={1.5} />
                  </ActionIcon>
                </Group>

                {project.docs.length === 0 &&
                  creatingDocForProject !== project.id && (
                    <Text size="xs" c="dimmed" px="sm" py={4}>
                      Keine Dokumente vorhanden
                    </Text>
                  )}

                {project.docs.map((doc) => (
                  <NavLink
                    key={doc.id}
                    label={doc.title || "Untitled"}
                    leftSection={<IconFile size="1.2em" stroke={1.5} />}
                    onClick={() => navigate(`/docs/${doc.id}`)}
                  />
                ))}

                {/* Inline doc creation */}
                {creatingDocForProject === project.id && (
                  <Group gap="xs" px="sm" py={4}>
                    <TextInput
                      ref={docInputRef}
                      size="xs"
                      placeholder="Dokument Name"
                      value={newDocTitle}
                      onChange={(e) => setNewDocTitle(e.currentTarget.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreateDoc(project.id);
                        if (e.key === "Escape") {
                          setCreatingDocForProject(null);
                          setNewDocTitle("");
                        }
                      }}
                      style={{ flex: 1 }}
                    />
                    <ActionIcon
                      variant="subtle"
                      color="green"
                      size="sm"
                      onClick={() => handleCreateDoc(project.id)}
                      disabled={!newDocTitle.trim()}
                    >
                      <IconCheck size="0.9em" stroke={1.5} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      onClick={() => {
                        setCreatingDocForProject(null);
                        setNewDocTitle("");
                      }}
                    >
                      <IconX size="0.9em" stroke={1.5} />
                    </ActionIcon>
                  </Group>
                )}
              </NavLink>
            ))}

            {/* Create new project button */}
            <NavLink
              my="md"
              label="Neues Projekt"
              leftSection={<IconPlus size="1.2em" stroke={1.5} />}
              c="dimmed"
              onClick={() => {
                setProjectName("");
                setProjectModalOpen(true);
              }}
            />
          </>
        )}
      </AppShell.Section>

      <AppShell.Section>
        <Divider />

        <NavLink
          label={pb.authStore.record?.name}
          description={pb.authStore.record?.email}
          leftSection={
            <MantineAvatar radius="xl">
              {getInitials(pb.authStore.record?.name)}
            </MantineAvatar>
          }
          onClick={() => navigate("/settings")}
        />
      </AppShell.Section>

      {/* Organization creation modal */}
      <Modal
        opened={orgModalOpen}
        onClose={() => {
          setOrgModalOpen(false);
          setOrgName("");
        }}
        title="Neue Organisation"
        size="sm"
        centered
      >
        <TextInput
          label="Name"
          placeholder="Organisation Name"
          value={orgName}
          onChange={(e) => setOrgName(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreateOrg();
          }}
        />
        <Space h="md" />
        <Button
          onClick={handleCreateOrg}
          loading={createOrganization.isPending}
          disabled={!orgName.trim()}
        >
          Erstellen
        </Button>
      </Modal>

      {/* Project creation modal */}
      <Modal
        opened={projectModalOpen}
        onClose={() => {
          setProjectModalOpen(false);
          setProjectName("");
        }}
        title="Neues Projekt"
        size="sm"
        centered
      >
        <TextInput
          label="Name"
          placeholder="Projekt Name"
          value={projectName}
          onChange={(e) => setProjectName(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreateProject();
          }}
        />
        <Space h="md" />
        <Button
          onClick={handleCreateProject}
          loading={createProject.isPending}
          disabled={!projectName.trim()}
        >
          Erstellen
        </Button>
      </Modal>
    </>
  );
}
