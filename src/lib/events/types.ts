export type DomainEventType =
  | 'decision.created'
  | 'decision.updated'
  | 'decision.status_changed'
  | 'decision.deprecated'
  | 'option.added'
  | 'option.chosen'
  | 'tag.assigned'
  | 'tag.removed'
  | 'comment.added'
  | 'comment.replied'

export interface BaseDomainEvent {
  id: string
  type: DomainEventType
  timestamp: Date
  userId?: string
  metadata?: Record<string, any>
}

export interface DecisionCreatedEvent extends BaseDomainEvent {
  type: 'decision.created'
  payload: {
    decisionId: string
    title: string
    status: string
  }
}

export interface DecisionUpdatedEvent extends BaseDomainEvent {
  type: 'decision.updated'
  payload: {
    decisionId: string
    changes: Record<string, any>
  }
}

export interface DecisionStatusChangedEvent extends BaseDomainEvent {
  type: 'decision.status_changed'
  payload: {
    decisionId: string
    oldStatus: string
    newStatus: string
  }
}

export interface OptionChosenEvent extends BaseDomainEvent {
  type: 'option.chosen'
  payload: {
    decisionId: string
    optionId: string
    optionTitle: string
  }
}

export interface TagAssignedEvent extends BaseDomainEvent {
  type: 'tag.assigned'
  payload: {
    decisionId: string
    tagId: string
    tagName: string
  }
}

export interface CommentAddedEvent extends BaseDomainEvent {
  type: 'comment.added'
  payload: {
    decisionId: string
    commentId: string
    content: string
  }
}

export type DomainEvent =
  | DecisionCreatedEvent
  | DecisionUpdatedEvent
  | DecisionStatusChangedEvent
  | OptionChosenEvent
  | TagAssignedEvent
  | CommentAddedEvent
