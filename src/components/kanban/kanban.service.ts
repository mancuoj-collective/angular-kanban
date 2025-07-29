import { Injectable, signal, computed, effect } from '@angular/core'
import { KanbanItem, KanbanList } from './type'

const STORAGE_KEY = 'kanban-data'

@Injectable({
  providedIn: 'root',
})
export class KanbanService {
  todoList = signal<KanbanItem[]>([])
  inProgressList = signal<KanbanItem[]>([])
  doneList = signal<KanbanItem[]>([])
  kanbanList = computed<KanbanList[]>(() => [
    { id: 'todo', title: 'To Do', data: this.todoList },
    { id: 'inProgress', title: 'In Progress', data: this.inProgressList },
    { id: 'done', title: 'Done', data: this.doneList },
  ])

  constructor() {
    this.loadData()

    effect(() => {
      const data = {
        todo: this.todoList(),
        inProgress: this.inProgressList(),
        done: this.doneList(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    })
  }

  getList(listId: string) {
    return this.kanbanList().find((l) => l.id === listId)!
  }

  getTask(listId: string, itemId: string) {
    return this.getList(listId)
      .data()
      .find((i) => i.id === itemId)!
  }

  addTask(listId: string, title: string) {
    this.getList(listId).data.update((items) => [...items, { id: crypto.randomUUID(), title }])
  }

  updateTask(listId: string, itemId: string, title: string) {
    this.getList(listId).data.update((items) =>
      items.map((item) => (item.id === itemId ? { ...item, title } : item)),
    )
  }

  deleteTask(listId: string, itemId: string) {
    this.getList(listId).data.update((items) => items.filter((i) => i.id !== itemId))
  }

  moveItemInSameList(listId: string, previousIndex: number, currentIndex: number) {
    this.getList(listId).data.update((items) => {
      const newItems = [...items]
      const [movedItem] = newItems.splice(previousIndex, 1)
      newItems.splice(currentIndex, 0, movedItem)
      return newItems
    })
  }

  moveItemBetweenLists(
    fromListId: string,
    toListId: string,
    previousIndex: number,
    currentIndex: number,
  ) {
    // 从源列表移除项目
    const movedItem = this.getList(fromListId).data()[previousIndex]
    this.getList(fromListId).data.update((items) =>
      items.filter((_, index) => index !== previousIndex),
    )

    // 添加到目标列表
    this.getList(toListId).data.update((items) => {
      const newItems = [...items]
      newItems.splice(currentIndex, 0, movedItem)
      return newItems
    })
  }

  private loadData() {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      try {
        const data = JSON.parse(savedData)
        this.todoList.set(data.todo || [])
        this.inProgressList.set(data.inProgress || [])
        this.doneList.set(data.done || [])
      } catch (e) {
        console.error('Failed to load kanban data:', e)
        this.initializeDefaultData()
      }
    } else {
      this.initializeDefaultData()
    }
  }

  private initializeDefaultData() {
    this.todoList.set([
      { id: '1', title: 'Learn Angular' },
      { id: '2', title: 'Learn React' },
    ])
    this.inProgressList.set([
      { id: '3', title: 'Learn Vue' },
      { id: '4', title: 'Learn Svelte' },
    ])
    this.doneList.set([{ id: '5', title: 'Learn Solid' }])
  }
}
