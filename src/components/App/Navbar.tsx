import {
  ActionIcon,
  AppShell,
  Box,
  Button,
  Divider,
  Group,
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
  IconCalendar,
  IconCircleDotted,
  IconFile,
  IconHome,
  IconLayout,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconSearch,
  IconUser,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBoards } from "../../api/boards";
import { useDocs } from "../../api/docs";
import {
  useCreateOrganization,
  useOrganizations,
} from "../../api/organizations";
import { pb } from "../../api/pocketbase";
import { useProjects } from "../../api/projects";
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

  const navigate = useNavigate();

  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  // Modal state for org creation
  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const [orgName, setOrgName] = useState("");

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

          <Box pt={5}>
            <Tooltip label="Kalender" position="right" withArrow>
              <NavLink
                leftSection={<IconCalendar size={"1.2em"} stroke={1.5} />}
                onClick={() => navigate("/calendar")}
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
        <NavLink
          label="Kalender"
          leftSection={<IconCalendar size={"1.2em"} stroke={1.5} />}
          onClick={() => navigate("/calendar")}
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

            <Space h="md" />

            {orgProjects.map((project) => (
              <NavLink
                key={project.id}
                label={project.name}
                leftSection={<IconCircleDotted size="1.2em" stroke={1.5} />}
                childrenOffset={16}
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                {project.boards.map((board) => (
                  <NavLink
                    key={board.id}
                    label={board.title}
                    leftSection={<IconLayout size="1.2em" stroke={1.5} />}
                    onClick={() => navigate(`/boards/${board.id}`)}
                  />
                ))}

                {project.docs.map((doc) => (
                  <NavLink
                    key={doc.id}
                    label={doc.title || "Untitled"}
                    leftSection={<IconFile size="1.2em" stroke={1.5} />}
                    onClick={() => navigate(`/docs/${doc.id}`)}
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
    </>
  );
}
