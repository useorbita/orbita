import {
  ActionIcon,
  AppShell,
  Divider,
  Loader,
  NavLink,
  Select,
  Space,
  Text,
  UnstyledButton,
} from "@mantine/core";
import {
  IconCircleDotted,
  IconDots,
  IconFile,
  IconHome,
  IconLayout,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBoards } from "../../api/boards";
import { useDocs } from "../../api/docs";
import { useOrganizations } from "../../api/organizations";
import { useProjects } from "../../api/projects";
import { UserAvatar } from "../UI/UserAvatar";

export function Navbar() {
  const organizations = useOrganizations();
  const projects = useProjects();
  const boards = useBoards();
  const docs = useDocs();

  const navigate = useNavigate();

  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  const isLoading =
    organizations.isLoading ||
    projects.isLoading ||
    boards.isLoading ||
    docs.isLoading;

  // Build select data for organizations
  const orgSelectData = useMemo(() => {
    if (!organizations.data) return [];
    return [...organizations.data]
      .sort((a, b) => {
        if (a.is_personal && !b.is_personal) return -1;
        if (!a.is_personal && b.is_personal) return 1;
        return 0;
      })
      .map((org) => ({
        value: org.id,
        label: org.is_personal ? "Private Projekte" : org.name || org.id,
      }));
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

  return (
    <>
      <AppShell.Section>
        <Text
          p="md"
          size="xl"
          style={{ fontFamily: "Outfit", fontWeight: 400 }}
        >
          Orbita
        </Text>

        <Divider />
        <NavLink
          label="Übersicht"
          leftSection={<IconHome size={"1.2em"} stroke={1.5} />}
          onClick={() => navigate("/")}
        />
        <NavLink
          label="Suchen"
          leftSection={<IconSearch size={"1.2em"} stroke={1.5} />}
          onClick={() => navigate("/")}
        />
        <NavLink
          label="Einstellungen"
          leftSection={<IconSettings size={"1.2em"} stroke={1.5} />}
          onClick={() => navigate("/settings")}
        />
      </AppShell.Section>

      <Space h="lg" />

      <AppShell.Section grow>
        {isLoading ? (
          <Loader color="gray" m="md" />
        ) : (
          <>
            <Select
              px="sm"
              value={selectedOrgId}
              onChange={setSelectedOrgId}
              data={orgSelectData}
            />

            <Space h="md" />

            {orgProjects.map((project) => (
              <NavLink
                key={project.id}
                label={project.name}
                leftSection={<IconCircleDotted size="1.2em" stroke={1.5} />}
                childrenOffset={0}
                defaultOpened
              >
                <Text
                  size="xs"
                  fw={700}
                  c="dimmed"
                  tt="uppercase"
                  px="sm"
                  py="sm"
                >
                  Boards
                </Text>

                {project.boards.map((board) => (
                  <NavLink
                    key={board.id}
                    label={board.title}
                    leftSection={<IconLayout size="1.2em" stroke={1.5} />}
                    rightSection={
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        aria-label="Settings"
                        onClick={(e) => {
                          navigate(`/${board.id}/settings`);
                          e.stopPropagation();
                        }}
                      >
                        <IconDots
                          style={{ width: "70%", height: "70%" }}
                          stroke={1.5}
                        />
                      </ActionIcon>
                    }
                    onClick={() => navigate(`/${board.id}`)}
                  />
                ))}

                <Space h="xs" />

                <Text size="xs" fw={700} c="dimmed" tt="uppercase" px="sm">
                  Dokumente
                </Text>
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

        <UnstyledButton
          p="md"
          style={{ width: "100%" }}
          onClick={() => navigate("/settings")}
        >
          <UserAvatar />
        </UnstyledButton>
      </AppShell.Section>
    </>
  );
}
