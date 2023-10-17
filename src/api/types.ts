/**
* This file was @generated using pocketbase-typegen
*/

export enum Collections {
	Boards = "boards",
	Cards = "cards",
	Comments = "comments",
	Labels = "labels",
	Lists = "lists",
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

export type BoardsRecord = {
	description?: string
	members?: RecordIdString[]
	title: string
}

export enum CardsPriorityOptions {
	"lowest" = "lowest",
	"low" = "low",
	"medium" = "medium",
	"high" = "high",
	"highest" = "highest",
}
export type CardsRecord = {
	author?: RecordIdString
	board?: RecordIdString
	date?: IsoDateString
	description?: HTMLString
	labels?: RecordIdString[]
	list: RecordIdString
	members?: RecordIdString[]
	position?: number
	priority?: CardsPriorityOptions
	title: string
}

export type CommentsRecord = {
	author?: RecordIdString
	card?: RecordIdString
	content?: HTMLString
}

export type LabelsRecord = {
	board?: RecordIdString
	color?: string
	title: string
}

export type ListsRecord = {
	board?: RecordIdString
	position?: number
	title: string
}

export type UsersRecord = {
	avatar?: string
	name?: string
}

// Response types include system fields and match responses from the PocketBase API
export type BoardsResponse<Texpand = unknown> = Required<BoardsRecord> & BaseSystemFields<Texpand>
export type CardsResponse<Texpand = unknown> = Required<CardsRecord> & BaseSystemFields<Texpand>
export type CommentsResponse<Texpand = unknown> = Required<CommentsRecord> & BaseSystemFields<Texpand>
export type LabelsResponse<Texpand = unknown> = Required<LabelsRecord> & BaseSystemFields<Texpand>
export type ListsResponse<Texpand = unknown> = Required<ListsRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	boards: BoardsRecord
	cards: CardsRecord
	comments: CommentsRecord
	labels: LabelsRecord
	lists: ListsRecord
	users: UsersRecord
}

export type CollectionResponses = {
	boards: BoardsResponse
	cards: CardsResponse
	comments: CommentsResponse
	labels: LabelsResponse
	lists: ListsResponse
	users: UsersResponse
}