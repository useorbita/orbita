import { useEffect, useMemo, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import {
  ActionIcon,
  AppShell,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Indicator,
  Loader,
  Avatar as MantineAvatar,
  Modal,
  NavLink,
  ScrollArea,
  Select,
  Space,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import {
  IconBuilding,
  IconCalendar,
  IconChecklist,
  IconChevronRight,
  IconCircleDotted,
  IconFile,
  IconInbox,
  IconLayout,
  IconLayoutDashboard,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconSearch,
  IconUser,
} from "@tabler/icons-react";

import { useBoards } from "../../api/boards";
import { useDocuments } from "../../api/documents";
import {
  useCreateOrganization,
  useOrganizations,
} from "../../api/organizations";
import { pb } from "../../api/pocketbase";
import { useProjects } from "../../api/projects";

interface NavbarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Navbar({ collapsed, onToggleCollapse }: NavbarProps) {
  const organizations = useOrganizations();
  const projects = useProjects();
  const boards = useBoards();
  const documents = useDocuments();

  const createOrganization = useCreateOrganization();

  const navigate = useNavigate();
  const location = useLocation();

  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  // Modal state for org creation
  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const [orgName, setOrgName] = useState("");

  const isLoading =
    organizations.isLoading ||
    projects.isLoading ||
    boards.isLoading ||
    documents.isLoading;

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

  // Compute projects with their boards and documents for the selected org
  const orgProjects = useMemo(() => {
    if (!selectedOrgId || !projects.data || !boards.data || !documents.data)
      return [];
    return projects.data
      .filter((p) => p.organization === selectedOrgId)
      .map((project) => ({
        ...project,
        boards: boards.data.filter((b) => b.project === project.id),
        documents: documents.data.filter((d) => d.project === project.id),
      }));
  }, [selectedOrgId, projects.data, boards.data, documents.data]);

  // Handlers
  const handleOrgSelectChange = (value: string | null) => {
    if (value === "__create__") {
      setOrgModalOpen(true);
    } else {
      setSelectedOrgId(value);
      if (value) navigate(`/orgs/${value}`);
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

  if (collapsed) {
    return (
      <>
        <AppShell.Section>
          <Box mt={20} mb={12}>
            <Tooltip label="Aufklappen" position="right" withArrow>
              <NavLink
                h={41}
                variant="subtle"
                leftSection={
                  <IconLayoutSidebarLeftExpand size="1.2em" color="grey" />
                }
                onClick={onToggleCollapse}
              />
            </Tooltip>
          </Box>

          <Box>
            <Tooltip label="Dein Dashboard" position="right" withArrow>
              <NavLink
                h={41}
                leftSection={
                  <IconLayoutDashboard size={"1.2em"} stroke={1.5} />
                }
                onClick={() => navigate("/")}
                active={location.pathname === "/"}
              />
            </Tooltip>
          </Box>

          <Box>
            <Tooltip label="Eingang" position="right" withArrow>
              <NavLink
                h={41}
                leftSection={
                  <Indicator size={6}>
                    <IconInbox size={"1.2em"} stroke={1.5} />
                  </Indicator>
                }
                onClick={() => navigate("/inbox")}
                active={location.pathname === "/inbox"}
              />
            </Tooltip>
          </Box>

          <Box>
            <Tooltip label="Suche" position="right" withArrow>
              <NavLink
                h={41}
                leftSection={<IconSearch size={"1.2em"} stroke={1.5} />}
                onClick={() => navigate("/search")}
                active={location.pathname === "/search"}
              />
            </Tooltip>
          </Box>

          <Box>
            <Tooltip label="Kalender" position="right" withArrow>
              <NavLink
                h={41}
                leftSection={<IconCalendar size={"1.2em"} stroke={1.5} />}
                onClick={() => navigate("/calendar")}
                active={location.pathname === "/calendar"}
              />
            </Tooltip>
          </Box>

          <Box>
            <Tooltip label="Mir zugewiesen" position="right" withArrow>
              <NavLink
                h={41}
                leftSection={<IconChecklist size={"1.2em"} stroke={1.5} />}
                onClick={() => navigate("/assigned")}
                active={location.pathname === "/assigned"}
              />
            </Tooltip>
          </Box>
        </AppShell.Section>

        <AppShell.Section grow />

        <AppShell.Section>
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
          label="Dein Dashboard"
          leftSection={<IconLayoutDashboard size={"1.2em"} stroke={1.5} />}
          onClick={() => navigate("/")}
          active={location.pathname === "/"}
        />
        <NavLink
          label="Eingang"
          leftSection={<IconInbox size={"1.2em"} stroke={1.5} />}
          rightSection={<Badge variant="default">42</Badge>}
          onClick={() => navigate("/inbox")}
          active={location.pathname === "/inbox"}
        />
        <NavLink
          label="Suchen"
          leftSection={<IconSearch size={"1.2em"} stroke={1.5} />}
          onClick={() => navigate("/search")}
          active={location.pathname === "/search"}
        />
        <NavLink
          label="Kalender"
          leftSection={<IconCalendar size={"1.2em"} stroke={1.5} />}
          onClick={() => navigate("/calendar")}
          active={location.pathname === "/calendar"}
        />
        <NavLink
          label="Mir zugewiesen"
          leftSection={<IconChecklist size={"1.2em"} stroke={1.5} />}
          onClick={() => navigate("/assigned")}
          active={location.pathname === "/assigned"}
        />
        <Space h="md" />
        <Divider />
      </AppShell.Section>

      <AppShell.Section grow component={ScrollArea}>
        {isLoading ? (
          <Loader color="gray" m="md" />
        ) : (
          <>
            <Select
              value={selectedOrgId}
              onChange={handleOrgSelectChange}
              data={orgSelectData}
              allowDeselect={false}
              p={"xs"}
              pt={"md"}
            />

            <NavLink
              label={"Organisation"}
              leftSection={<IconBuilding size={"1.2em"} stroke={1.5} />}
              onClick={() => navigate(`/orgs/${selectedOrgId}`)}
              active={
                location.pathname.startsWith(`/orgs/${selectedOrgId}`) &&
                !location.pathname.startsWith(`/orgs/${selectedOrgId}/settings`)
              }
            />

            <Text size="xs" fw={500} c="dimmed" p={"xs"}>
              Projekte
            </Text>

            {orgProjects.map((project) => (
              <NavLink
                key={project.id}
                label={project.name}
                leftSection={<IconCircleDotted size="1.2em" stroke={1.5} />}
                childrenOffset={16}
                onClick={() => navigate(`/projects/${project.id}`)}
                active={location.pathname === `/projects/${project.id}`}
                rightSection={
                  project.boards.length != 0 ||
                  project.documents.length != 0 ? (
                    <IconChevronRight size="1em" stroke={1.5} />
                  ) : (
                    <></>
                  )
                }
              >
                {project.boards.map((board) => (
                  <NavLink
                    key={board.id}
                    label={board.title}
                    leftSection={<IconLayout size="1.2em" stroke={1.5} />}
                    onClick={() => navigate(`/boards/${board.id}`)}
                    active={location.pathname === `/boards/${board.id}`}
                  />
                ))}

                {project.documents.map((doc) => (
                  <NavLink
                    key={doc.id}
                    label={doc.title || "Untitled"}
                    leftSection={<IconFile size="1.2em" stroke={1.5} />}
                    onClick={() => navigate(`/documents/${doc.id}`)}
                    active={location.pathname === `/documents/${doc.id}`}
                  />
                ))}
              </NavLink>
            ))}
          </>
        )}
      </AppShell.Section>

      <AppShell.Section>
        <Divider />

        <NavLink
          label={pb.authStore.record?.name}
          description={pb.authStore.record?.email}
          leftSection={
            <MantineAvatar
              radius="xl"
              name={pb.authStore.record?.name}
              color="initials"
            />
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
    </>
  );
}
