/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Boards = "boards",
	Cards = "cards",
	Comments = "comments",
	Events = "events",
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
	cardCount?: number
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
	board?: RecordIdString
	date?: IsoDateString
	description?: HTMLString
	labels?: RecordIdString[]
	list: RecordIdString
	members?: RecordIdString[]
	number?: number
	position?: number
	priority?: CardsPriorityOptions
	title: string
}

export type CommentsRecord = {
	author?: RecordIdString
	card?: RecordIdString
	content?: HTMLString
}

export enum EventsActionOptions {
	"CREATE" = "CREATE",
	"UPDATE" = "UPDATE",
}
export type EventsRecord = {
	action?: EventsActionOptions
	card?: RecordIdString
	user?: RecordIdString
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
export type EventsResponse<Texpand = unknown> = Required<EventsRecord> & BaseSystemFields<Texpand>
export type LabelsResponse<Texpand = unknown> = Required<LabelsRecord> & BaseSystemFields<Texpand>
export type ListsResponse<Texpand = unknown> = Required<ListsRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	boards: BoardsRecord
	cards: CardsRecord
	comments: CommentsRecord
	events: EventsRecord
	labels: LabelsRecord
	lists: ListsRecord
	users: UsersRecord
}

export type CollectionResponses = {
	boards: BoardsResponse
	cards: CardsResponse
	comments: CommentsResponse
	events: EventsResponse
	labels: LabelsResponse
	lists: ListsResponse
	users: UsersResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: 'boards'): RecordService<BoardsResponse>
	collection(idOrName: 'cards'): RecordService<CardsResponse>
	collection(idOrName: 'comments'): RecordService<CommentsResponse>
	collection(idOrName: 'events'): RecordService<EventsResponse>
	collection(idOrName: 'labels'): RecordService<LabelsResponse>
	collection(idOrName: 'lists'): RecordService<ListsResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
}
