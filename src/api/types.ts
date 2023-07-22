/**
* This file was @generated using pocketbase-typegen
*/

export enum Collections {
	Cards = "cards",
	Comments = "comments",
	Labels = "labels",
	Projects = "projects",
	States = "states",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

// System fields
export type BaseSystemFields<T = never> = {
	id: RecordIdString
	created: IsoDateString
	updated: IsoDateString
	collectionId: string
	collectionName: Collections
	expand?: T
}

export type AuthSystemFields<T = never> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export enum CardsPriorityOptions {
	"lowest" = "lowest",
	"low" = "low",
	"medium" = "medium",
	"high" = "high",
	"highest" = "highest",
}
export type CardsRecord = {
	title: string
	description?: HTMLString
	members?: RecordIdString[]
	labels?: RecordIdString[]
	state: RecordIdString
	dueDate?: IsoDateString
	priority?: CardsPriorityOptions
	author?: RecordIdString
	project?: RecordIdString
}

export type CommentsRecord = {
	content?: HTMLString
	field?: RecordIdString
}

export type LabelsRecord = {
	name: string
}

export type ProjectsRecord = {
	name?: string
	members?: RecordIdString[]
}

export type StatesRecord = {
	name: string
}

export type UsersRecord = {
	name?: string
	avatar?: string
}

// Response types include system fields and match responses from the PocketBase API
export type CardsResponse<Texpand = unknown> = Required<CardsRecord> & BaseSystemFields<Texpand>
export type CommentsResponse<Texpand = unknown> = Required<CommentsRecord> & BaseSystemFields<Texpand>
export type LabelsResponse<Texpand = unknown> = Required<LabelsRecord> & BaseSystemFields<Texpand>
export type ProjectsResponse<Texpand = unknown> = Required<ProjectsRecord> & BaseSystemFields<Texpand>
export type StatesResponse<Texpand = unknown> = Required<StatesRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	cards: CardsRecord
	comments: CommentsRecord
	labels: LabelsRecord
	projects: ProjectsRecord
	states: StatesRecord
	users: UsersRecord
}

export type CollectionResponses = {
	cards: CardsResponse
	comments: CommentsResponse
	labels: LabelsResponse
	projects: ProjectsResponse
	states: StatesResponse
	users: UsersResponse
}