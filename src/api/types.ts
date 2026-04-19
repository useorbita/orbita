/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export const Collections = {
	Authorigins: "_authOrigins",
	Externalauths: "_externalAuths",
	Mfas: "_mfas",
	Otps: "_otps",
	Superusers: "_superusers",
	Boards: "boards",
	CardComments: "card_comments",
	CardEvents: "card_events",
	Cards: "cards",
	DocumentEvents: "document_events",
	Documents: "documents",
	Invitations: "invitations",
	Labels: "labels",
	Lists: "lists",
	OrganizationMembers: "organization_members",
	Organizations: "organizations",
	ProjectMembers: "project_members",
	Projects: "projects",
	Users: "users",
} as const
export type Collections = typeof Collections[keyof typeof Collections]

// Alias types for improved usability
export type IsoDateString = string
export type IsoAutoDateString = string & { readonly autodate: unique symbol }
export type RecordIdString = string
export type FileNameString = string & { readonly filename: unique symbol }
export type HTMLString = string

type ExpandType<T> = unknown extends T
	? T extends unknown
		? { expand?: unknown }
		: { expand: T }
	: { expand: T }

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
} & ExpandType<T>

export type AuthSystemFields<T = unknown> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated: IsoAutoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated: IsoAutoDateString
}

export type MfasRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	method: string
	recordRef: string
	updated: IsoAutoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated: IsoAutoDateString
}

export type SuperusersRecord = {
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

export type BoardsRecord = {
	created: IsoAutoDateString
	description?: string
	id: string
	project?: RecordIdString
	title: string
	updated: IsoAutoDateString
}

export type CardCommentsRecord = {
	author?: RecordIdString
	card?: RecordIdString
	content?: HTMLString
	created: IsoAutoDateString
	id: string
	updated: IsoAutoDateString
}

export const CardEventsActionOptions = {
	"CREATE": "CREATE",
	"UPDATE": "UPDATE",
} as const
export type CardEventsActionOptions = typeof CardEventsActionOptions[keyof typeof CardEventsActionOptions]
export type CardEventsRecord = {
	action?: CardEventsActionOptions
	card?: RecordIdString
	created: IsoAutoDateString
	id: string
	updated: IsoAutoDateString
	user?: RecordIdString
}

export const CardsPriorityOptions = {
	"lowest": "lowest",
	"low": "low",
	"medium": "medium",
	"high": "high",
	"highest": "highest",
} as const
export type CardsPriorityOptions = typeof CardsPriorityOptions[keyof typeof CardsPriorityOptions]
export type CardsRecord = {
	board?: RecordIdString
	created: IsoAutoDateString
	date?: IsoDateString
	description?: HTMLString
	id: string
	labels?: RecordIdString[]
	list: RecordIdString
	members?: RecordIdString[]
	number?: number
	position?: number
	priority?: CardsPriorityOptions
	title: string
	updated: IsoAutoDateString
}

export const DocumentEventsActionOptions = {
	"CREATE": "CREATE",
	"UPDATE": "UPDATE",
} as const
export type DocumentEventsActionOptions = typeof DocumentEventsActionOptions[keyof typeof DocumentEventsActionOptions]
export type DocumentEventsRecord = {
	action?: DocumentEventsActionOptions
	created: IsoAutoDateString
	document?: RecordIdString
	id: string
	updated: IsoAutoDateString
	user?: RecordIdString
}

export type DocumentsRecord = {
	content?: HTMLString
	created: IsoAutoDateString
	id: string
	order?: number
	parent?: RecordIdString
	project?: RecordIdString
	title?: string
	updated: IsoAutoDateString
}

export const InvitationsRoleOptions = {
	"member": "member",
	"owner": "owner",
} as const
export type InvitationsRoleOptions = typeof InvitationsRoleOptions[keyof typeof InvitationsRoleOptions]
export type InvitationsRecord = {
	created: IsoAutoDateString
	id: string
	invited_by?: RecordIdString
	organization?: RecordIdString
	role?: InvitationsRoleOptions
	updated: IsoAutoDateString
	user?: RecordIdString
}

export type LabelsRecord = {
	color?: string
	created: IsoAutoDateString
	id: string
	name: string
	project?: RecordIdString
	updated: IsoAutoDateString
}

export type ListsRecord = {
	board?: RecordIdString
	created: IsoAutoDateString
	id: string
	position?: number
	title: string
	updated: IsoAutoDateString
}

export const OrganizationMembersRoleOptions = {
	"member": "member",
	"owner": "owner",
} as const
export type OrganizationMembersRoleOptions = typeof OrganizationMembersRoleOptions[keyof typeof OrganizationMembersRoleOptions]
export type OrganizationMembersRecord = {
	created: IsoAutoDateString
	id: string
	organization?: RecordIdString
	role?: OrganizationMembersRoleOptions
	updated: IsoAutoDateString
	user?: RecordIdString
}

export type OrganizationsRecord = {
	created: IsoAutoDateString
	id: string
	is_personal?: boolean
	name?: string
	updated: IsoAutoDateString
}

export const ProjectMembersRoleOptions = {
	"admin": "admin",
	"member": "member",
} as const
export type ProjectMembersRoleOptions = typeof ProjectMembersRoleOptions[keyof typeof ProjectMembersRoleOptions]
export type ProjectMembersRecord = {
	created: IsoAutoDateString
	id: string
	project?: RecordIdString
	role?: ProjectMembersRoleOptions
	updated: IsoAutoDateString
	user?: RecordIdString
}

export type ProjectsRecord = {
	created: IsoAutoDateString
	id: string
	name?: string
	organization?: RecordIdString
	ticket_counter?: number
	updated: IsoAutoDateString
}

export type UsersRecord = {
	avatar?: FileNameString
	created: IsoAutoDateString
	email?: string
	emailVisibility?: boolean
	id: string
	name?: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	username: string
	verified?: boolean
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type BoardsResponse<Texpand = unknown> = Required<BoardsRecord> & BaseSystemFields<Texpand>
export type CardCommentsResponse<Texpand = unknown> = Required<CardCommentsRecord> & BaseSystemFields<Texpand>
export type CardEventsResponse<Texpand = unknown> = Required<CardEventsRecord> & BaseSystemFields<Texpand>
export type CardsResponse<Texpand = unknown> = Required<CardsRecord> & BaseSystemFields<Texpand>
export type DocumentEventsResponse<Texpand = unknown> = Required<DocumentEventsRecord> & BaseSystemFields<Texpand>
export type DocumentsResponse<Texpand = unknown> = Required<DocumentsRecord> & BaseSystemFields<Texpand>
export type InvitationsResponse<Texpand = unknown> = Required<InvitationsRecord> & BaseSystemFields<Texpand>
export type LabelsResponse<Texpand = unknown> = Required<LabelsRecord> & BaseSystemFields<Texpand>
export type ListsResponse<Texpand = unknown> = Required<ListsRecord> & BaseSystemFields<Texpand>
export type OrganizationMembersResponse<Texpand = unknown> = Required<OrganizationMembersRecord> & BaseSystemFields<Texpand>
export type OrganizationsResponse<Texpand = unknown> = Required<OrganizationsRecord> & BaseSystemFields<Texpand>
export type ProjectMembersResponse<Texpand = unknown> = Required<ProjectMembersRecord> & BaseSystemFields<Texpand>
export type ProjectsResponse<Texpand = unknown> = Required<ProjectsRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	boards: BoardsRecord
	card_comments: CardCommentsRecord
	card_events: CardEventsRecord
	cards: CardsRecord
	document_events: DocumentEventsRecord
	documents: DocumentsRecord
	invitations: InvitationsRecord
	labels: LabelsRecord
	lists: ListsRecord
	organization_members: OrganizationMembersRecord
	organizations: OrganizationsRecord
	project_members: ProjectMembersRecord
	projects: ProjectsRecord
	users: UsersRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	boards: BoardsResponse
	card_comments: CardCommentsResponse
	card_events: CardEventsResponse
	cards: CardsResponse
	document_events: DocumentEventsResponse
	documents: DocumentsResponse
	invitations: InvitationsResponse
	labels: LabelsResponse
	lists: ListsResponse
	organization_members: OrganizationMembersResponse
	organizations: OrganizationsResponse
	project_members: ProjectMembersResponse
	projects: ProjectsResponse
	users: UsersResponse
}

// Utility types for create/update operations

type ProcessCreateAndUpdateFields<T> = Omit<{
	// Omit AutoDate fields
	[K in keyof T as Extract<T[K], IsoAutoDateString> extends never ? K : never]: 
		// Convert FileNameString to File
		T[K] extends infer U ? 
			U extends (FileNameString | FileNameString[]) ? 
				U extends any[] ? File[] : File 
			: U
		: never
}, 'id'>

// Create type for Auth collections
export type CreateAuth<T> = {
	id?: RecordIdString
	email: string
	emailVisibility?: boolean
	password: string
	passwordConfirm: string
	verified?: boolean
} & ProcessCreateAndUpdateFields<T>

// Create type for Base collections
export type CreateBase<T> = {
	id?: RecordIdString
} & ProcessCreateAndUpdateFields<T>

// Update type for Auth collections
export type UpdateAuth<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof AuthSystemFields>
> & {
	email?: string
	emailVisibility?: boolean
	oldPassword?: string
	password?: string
	passwordConfirm?: string
	verified?: boolean
}

// Update type for Base collections
export type UpdateBase<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof BaseSystemFields>
>

// Get the correct create type for any collection
export type Create<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? CreateAuth<CollectionRecords[T]>
		: CreateBase<CollectionRecords[T]>

// Get the correct update type for any collection
export type Update<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? UpdateAuth<CollectionRecords[T]>
		: UpdateBase<CollectionRecords[T]>

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = {
	collection<T extends keyof CollectionResponses>(
		idOrName: T
	): RecordService<CollectionResponses[T]>
} & PocketBase
