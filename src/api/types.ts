/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Authorigins = "_authOrigins",
	Externalauths = "_externalAuths",
	Mfas = "_mfas",
	Otps = "_otps",
	Superusers = "_superusers",
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

export type AuthoriginsRecord = {
	collectionRef: string
	created?: IsoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated?: IsoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated?: IsoDateString
}

export type MfasRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	method: string
	recordRef: string
	updated?: IsoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated?: IsoDateString
}

export type SuperusersRecord = {
	created?: IsoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated?: IsoDateString
	verified?: boolean
}

export type BoardsRecord = {
	cardCount?: number
	created?: IsoDateString
	description?: string
	id: string
	members?: RecordIdString[]
	title: string
	updated?: IsoDateString
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
	created?: IsoDateString
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
	updated?: IsoDateString
}

export type CommentsRecord = {
	author?: RecordIdString
	card?: RecordIdString
	content?: HTMLString
	created?: IsoDateString
	id: string
	updated?: IsoDateString
}

export enum EventsActionOptions {
	"CREATE" = "CREATE",
	"UPDATE" = "UPDATE",
}
export type EventsRecord = {
	action?: EventsActionOptions
	card?: RecordIdString
	created?: IsoDateString
	id: string
	updated?: IsoDateString
	user?: RecordIdString
}

export type LabelsRecord = {
	board?: RecordIdString
	color?: string
	created?: IsoDateString
	id: string
	title: string
	updated?: IsoDateString
}

export type ListsRecord = {
	board?: RecordIdString
	created?: IsoDateString
	id: string
	position?: number
	title: string
	updated?: IsoDateString
}

export type UsersRecord = {
	avatar?: string
	created?: IsoDateString
	email?: string
	emailVisibility?: boolean
	id: string
	name?: string
	password: string
	tokenKey: string
	updated?: IsoDateString
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
export type CardsResponse<Texpand = unknown> = Required<CardsRecord> & BaseSystemFields<Texpand>
export type CommentsResponse<Texpand = unknown> = Required<CommentsRecord> & BaseSystemFields<Texpand>
export type EventsResponse<Texpand = unknown> = Required<EventsRecord> & BaseSystemFields<Texpand>
export type LabelsResponse<Texpand = unknown> = Required<LabelsRecord> & BaseSystemFields<Texpand>
export type ListsResponse<Texpand = unknown> = Required<ListsRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	boards: BoardsRecord
	cards: CardsRecord
	comments: CommentsRecord
	events: EventsRecord
	labels: LabelsRecord
	lists: ListsRecord
	users: UsersRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
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
	collection(idOrName: '_authOrigins'): RecordService<AuthoriginsResponse>
	collection(idOrName: '_externalAuths'): RecordService<ExternalauthsResponse>
	collection(idOrName: '_mfas'): RecordService<MfasResponse>
	collection(idOrName: '_otps'): RecordService<OtpsResponse>
	collection(idOrName: '_superusers'): RecordService<SuperusersResponse>
	collection(idOrName: 'boards'): RecordService<BoardsResponse>
	collection(idOrName: 'cards'): RecordService<CardsResponse>
	collection(idOrName: 'comments'): RecordService<CommentsResponse>
	collection(idOrName: 'events'): RecordService<EventsResponse>
	collection(idOrName: 'labels'): RecordService<LabelsResponse>
	collection(idOrName: 'lists'): RecordService<ListsResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
}
