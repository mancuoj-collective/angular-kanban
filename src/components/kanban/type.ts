import { WritableSignal } from '@angular/core'

export interface KanbanItem {
  id: string
  title: string
}

export interface KanbanList {
  id: string
  title: string
  data: WritableSignal<KanbanItem[]>
}
