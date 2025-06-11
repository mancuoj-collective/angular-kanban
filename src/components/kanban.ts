import { Component, signal, OnInit, WritableSignal, model } from '@angular/core'
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

interface KanbanItem {
  id: string
  title: string
}

interface KanbanList {
  id: string
  title: string
  data: WritableSignal<KanbanItem[]>
}

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

  template: `
    <div cdkDropListGroup class="flex gap-3 md:gap-6">
      @for (list of kanbanList(); track list.id) {
      <div
        class="w-1/3 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg shadow-sm"
      >
        <div
          class="flex justify-between items-center border-b border-surface-200 dark:border-surface-700 pb-3 p-4"
        >
          <h2 class="text-lg font-medium shrink-0 text-surface-900 dark:text-surface-50">
            {{ list.title }}
          </h2>
          <p-button
            rounded="true"
            outlined="true"
            icon="pi pi-plus"
            (click)="openDialog(list.id)"
          />
        </div>

        <div
          cdkDropList
          [cdkDropListData]="list.data()"
          (cdkDropListDropped)="drop($event)"
          class="space-y-2 p-3 pt-5 h-[520px] overflow-y-auto scrollbar-thin scrollbar-thumb-surface-300 dark:scrollbar-thumb-surface-600 scrollbar-track-surface-100 dark:scrollbar-track-surface-700"
        >
          @for (item of list.data(); track item) {
          <div
            class="bg-white dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-md h-11 flex items-center pl-3 pr-2 min-w-0 shrink-0 truncate group border border-surface-200 dark:border-surface-700"
            cdkDrag
          >
            <span class="text-surface-900 dark:text-surface-50">{{ item.title }}</span>
            <div class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
              <p-button
                (click)="toggleMenu(menu, $event, list.id, item.id)"
                icon="pi pi-ellipsis-v"
                text="true"
                rounded="true"
                size="small"
              />
              <p-menu #menu [model]="items" [popup]="true" />
            </div>

            <div *cdkDragPreview>
              <div
                class="bg-surface-100 dark:bg-surface-700 p-3 rounded-md shadow-lg border border-surface-200 dark:border-surface-600"
              >
                {{ item.title }}
              </div>
            </div>

            <div
              *cdkDragPlaceholder
              class="border-2 border-dashed border-surface-300 dark:border-surface-600 h-11 rounded-md"
            ></div>
          </div>
          }
        </div>
      </div>
      }
    </div>

    <p-dialog
      [header]="isEditMode ? 'Edit Task' : 'Add New Task'"
      [(visible)]="dialogVisible"
      [style]="{ width: '450px' }"
      [modal]="true"
    >
      <div class="flex flex-col gap-4">
        <p-floatlabel variant="in">
          <input pInputText id="task-title" [(ngModel)]="taskTitle" class="w-full" />
          <label for="task-title">Title</label>
        </p-floatlabel>

        <div class="flex justify-end gap-3 pt-2">
          <p-button label="Cancel" (click)="closeDialog()" severity="secondary" text="true" />
          <p-button label="Save" (click)="saveTask()" [disabled]="!taskTitle()" />
        </div>
      </div>
    </p-dialog>
  `,
})
export class KanbanComponent implements OnInit {
  todoList = signal<KanbanItem[]>([])
  inProgressList = signal<KanbanItem[]>([])
  doneList = signal<KanbanItem[]>([])
  kanbanList = signal<KanbanList[]>([])

  dialogVisible = false
  taskTitle = model('')
  currentListId = ''
  currentItemId = ''
  isEditMode = false

  items: MenuItem[] = [
    {
      label: 'Edit',
      icon: 'pi pi-pencil',
      command: () => {
        this.openDialog(this.currentListId, true)
      },
    },
    {
      label: 'Delete',
      icon: 'pi pi-trash',
      command: () => {
        this.deleteTask()
      },
    },
  ]

  ngOnInit() {
    this.loadData()
    this.kanbanList.set([
      { id: 'todo', title: 'To Do', data: this.todoList },
      { id: 'inProgress', title: 'In Progress', data: this.inProgressList },
      { id: 'done', title: 'Done', data: this.doneList },
    ])
  }

  openDialog(listId: string, isEdit = false) {
    this.currentListId = listId
    this.isEditMode = isEdit

    if (isEdit) {
      const list = this.kanbanList().find((l) => l.id === listId)
      const task = list?.data().find((i) => i.id === this.currentItemId)
      if (task) {
        this.taskTitle.set(task.title)
      }
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

    const list = this.kanbanList().find((l) => l.id === this.currentListId)
    if (list) {
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
      this.saveData()
    }
    this.closeDialog()
  }

  deleteTask() {
    const list = this.kanbanList().find((l) => l.id === this.currentListId)
    if (list) {
      list.data.update((items) => items.filter((i) => i.id !== this.currentItemId))
      this.saveData()
    }
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

  private saveData() {
    const data = {
      todo: this.todoList(),
      inProgress: this.inProgressList(),
      done: this.doneList(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
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
    this.saveData()
  }
}
