import PocketBase from "npm:pocketbase";

// ---------------------------------------------------------------------------
// Config – adjust these values to match your environment
// ---------------------------------------------------------------------------
const PB_URL = "http://127.0.0.1:8090";
const EMAIL = "testuser@orbita.com";
const PASSWORD = "testpassword";
const ORG_NAME = "Shoppy Ltd.";
const BOARD_NAME = "E-Commerce Platform";
const PROJECT_NAME = "ShopWave";
// ---------------------------------------------------------------------------

const pb = new PocketBase(PB_URL);

await pb.collection("users").authWithPassword(EMAIL, PASSWORD);
const userId = pb.authStore.model?.id;
console.log(`Authenticated as ${userId}`);

// ---------- Organization
const organization = await pb.collection("organizations").create({
  name: ORG_NAME,
  is_personal: false,
});
console.log(`Created organization: ${organization.id}`);

// ---------- Add User to Organization
const organization_member = await pb.collection("organization_members").create({
  user: userId,
  organization: organization.id,
  role: "owner",
});
console.log(`Created organization member: ${organization_member.id}`);

// ---------- Project
const project = await pb.collection("projects").create({
  name: PROJECT_NAME,
  organization: organization.id,
  ticket_counter: 0,
});
console.log(`Created project: ${project.id}`);

// ---------- Board
const board = await pb.collection("boards").create({
  title: BOARD_NAME,
  project: project.id,
});
console.log(`Created board: ${board.id}`);

// ---------- Lists
const listsData: Array<{ title: string; position: number }> = JSON.parse(
  await Deno.readTextFile("./lists.json"),
);

const listIdMap = new Map<string, string>(); // old generated ID -> new PocketBase ID

for (const list of listsData) {
  const record = await pb.collection("lists").create({
    title: list.title,
    board: board.id,
    position: list.position,
  });
  listIdMap.set(list.id as string, record.id);
  console.log(`Created list: ${list.title} (${record.id})`);
}

// ---------- Labels
interface LabelData {
  id: string;
  name: string;
  color: string;
}
const labelsData: LabelData[] = JSON.parse(
  await Deno.readTextFile("./labels.json"),
);

const labelIdMap = new Map<string, string>(); // old generated ID -> new PocketBase ID

for (const label of labelsData) {
  const record = await pb.collection("labels").create({
    name: label.name,
    color: label.color,
    project: project.id,
  });
  labelIdMap.set(label.id, record.id);
  console.log(`Created label: ${label.name} (${record.id})`);
}

// ---------- Cards
interface CardData {
  id: string;
  title: string;
  description: string;
  members: string[];
  labels: string[];
  list: string;
  date: string;
  priority: string;
  board: string;
  position: number;
  number: number;
}
const cardsData: CardData[] = JSON.parse(
  await Deno.readTextFile("./cards.json"),
);

let created = 0;
let errors = 0;

for (const card of cardsData) {
  // Map old generated IDs to the new PocketBase IDs
  const newListId = listIdMap.get(card.list);
  if (!newListId) {
    console.error(`List ID not found for card "${card.title}", skipping.`);
    errors++;
    continue;
  }

  const newLabelIds = card.labels
    .map((oldId) => labelIdMap.get(oldId))
    .filter(Boolean) as string[];

  try {
    const record = await pb.collection("cards").create({
      title: card.title,
      description: card.description,
      members: [userId], // set the logged-in user as member
      labels: newLabelIds,
      list: newListId,
      date: card.date || null,
      priority: card.priority,
      board: board.id,
      position: card.position,
      number: card.number,
    });
    created++;
    console.log(`[${created}/${cardsData.length}] Created card: ${card.title}`);
  } catch (err) {
    errors++;
    console.error(`Failed to create card "${card.title}":`, err);
  }
}

console.log("\n========== Done ==========");
console.log(`Cards created: ${created}`);
console.log(`Errors: ${errors}`);
console.log(`Lists: ${listIdMap.size}`);
console.log(`Labels: ${labelIdMap.size}`);
