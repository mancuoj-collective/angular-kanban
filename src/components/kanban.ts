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

const STORAGE_KEY = 'kanban'

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
    <div cdkDropListGroup class="flex gap-6">
      @for (list of kanbanList(); track list.id) {
      <div class="w-1/3 bg-surface-100 dark:bg-surface-800 rounded-xl shadow">
        <div
          class="flex justify-between items-center border-b-2 border-primary-300 dark:border-primary-600 pb-2 p-4"
        >
          <h2 class="text-xl font-bold">
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
          class="space-y-3 pt-4 h-[500px] overflow-y-auto"
        >
          @for (item of list.data(); track item) {
          <div
            class="bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600 rounded-xl h-12 flex items-center pl-3 pr-2 min-w-0 shrink-0 truncate group mx-4"
            cdkDrag
          >
            {{ item.title }}
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
              <div class="bg-surface-300 dark:bg-surface-600 p-3 rounded-xl">
                {{ item.title }}
              </div>
            </div>

            <div
              *cdkDragPlaceholder
              class="border-2 border-dashed border-primary-400 dark:border-primary-500 h-12 rounded-xl"
            ></div>
          </div>
          }
        </div>
      </div>
      }
    </div>

    <p-dialog
      header="Add New Task"
      [(visible)]="visible"
      [style]="{ width: '450px' }"
      [modal]="true"
    >
      <div class="flex flex-col gap-4">
        <p-floatlabel variant="in">
          <input pInputText id="task-title" [(ngModel)]="newTaskTitle" class="w-full" />
          <label for="task-title">Title</label>
        </p-floatlabel>

        <div class="flex justify-end gap-2">
          <p-button label="Cancel" (click)="closeDialog()" severity="secondary" />
          <p-button label="Save" (click)="saveNewTask()" [disabled]="!newTaskTitle()" />
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

  visible = false
  newTaskTitle = model('')
  currentListId = ''
  currentItemId = ''

  items: MenuItem[] = [
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

  openDialog(listId: string) {
    this.currentListId = listId
    this.newTaskTitle.set('')
    this.visible = true
  }

  closeDialog() {
    this.newTaskTitle.set('')
    this.visible = false
  }

  toggleMenu(menu: Menu, event: MouseEvent, listId: string, itemId: string) {
    this.currentListId = listId
    this.currentItemId = itemId
    menu.toggle(event)
  }

  saveNewTask() {
    const title = this.newTaskTitle().trim()
    if (!title) return

    const list = this.kanbanList().find((l) => l.id === this.currentListId)
    if (list) {
      list.data.update((items) => [
        ...items,
        {
          id: crypto.randomUUID(),
          title: title,
        },
      ])
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
