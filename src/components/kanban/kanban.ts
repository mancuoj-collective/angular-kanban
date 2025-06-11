import { Component, signal, OnInit, model, computed, effect } from '@angular/core'
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
  CdkDragPlaceholder,
  CdkDragPreview,
} from '@angular/cdk/drag-drop'
import { ButtonModule } from 'primeng/button'
import { DialogModule } from 'primeng/dialog'
import { InputTextModule } from 'primeng/inputtext'
import { FormsModule } from '@angular/forms'
import { FloatLabelModule } from 'primeng/floatlabel'
import { MenuItem } from 'primeng/api'
import { Menu } from 'primeng/menu'
import { KanbanItem, KanbanList } from './type'

const STORAGE_KEY = 'kanban-data'

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
    CdkDragPlaceholder,
    CdkDragPreview,
    ButtonModule,
    DialogModule,
    InputTextModule,
    FormsModule,
    FloatLabelModule,
    Menu,
  ],
  templateUrl: './kanban.html',
})
export class KanbanComponent implements OnInit {
  todoList = signal<KanbanItem[]>([])
  inProgressList = signal<KanbanItem[]>([])
  doneList = signal<KanbanItem[]>([])
  kanbanList = computed<KanbanList[]>(() => [
    { id: 'todo', title: 'To Do', data: this.todoList },
    { id: 'inProgress', title: 'In Progress', data: this.inProgressList },
    { id: 'done', title: 'Done', data: this.doneList },
  ])

  dialogVisible = false
  taskTitle = model('')
  currentListId = ''
  currentItemId = ''
  isEditMode = false

  items: MenuItem[] = [
    {
      label: 'Edit',
      icon: 'pi pi-pencil',
      command: () => this.openDialog(this.currentListId, true),
    },
    {
      label: 'Delete',
      icon: 'pi pi-trash',
      command: () => this.deleteTask(),
    },
  ]

  constructor() {
    effect(() => {
      const data = {
        todo: this.todoList(),
        inProgress: this.inProgressList(),
        done: this.doneList(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    })
  }

  ngOnInit() {
    this.loadData()
  }

  drop(event: CdkDragDrop<KanbanItem[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex)
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      )
    }
  }

  openDialog(listId: string, isEdit = false) {
    this.currentListId = listId
    this.isEditMode = isEdit

    if (isEdit) {
      this.taskTitle.set(this.getTask(listId, this.currentItemId).title)
    } else {
      this.taskTitle.set('')
    }

    this.dialogVisible = true
  }

  closeDialog() {
    this.taskTitle.set('')
    this.dialogVisible = false
    this.isEditMode = false
  }

  toggleMenu(menu: Menu, event: MouseEvent, listId: string, itemId: string) {
    this.currentListId = listId
    this.currentItemId = itemId
    menu.toggle(event)
  }

  saveTask() {
    const title = this.taskTitle().trim()
    if (!title) return

    const list = this.getList(this.currentListId)
    if (this.isEditMode) {
      list.data.update((items) =>
        items.map((item) => (item.id === this.currentItemId ? { ...item, title } : item)),
      )
    } else {
      list.data.update((items) => [
        ...items,
        {
          id: crypto.randomUUID(),
          title: title,
        },
      ])
    }
    this.closeDialog()
  }

  deleteTask() {
    this.getList(this.currentListId).data.update((items) =>
      items.filter((i) => i.id !== this.currentItemId),
    )
  }

  private getList(listId: string) {
    return this.kanbanList().find((l) => l.id === listId)!
  }

  private getTask(listId: string, itemId: string) {
    return this.getList(listId)
      .data()
      .find((i) => i.id === itemId)!
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
