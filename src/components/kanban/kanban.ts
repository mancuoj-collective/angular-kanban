import { Component, model, inject } from '@angular/core'
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
import { KanbanItem } from './type'
import { KanbanService } from './kanban.service'

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
export class KanbanComponent {
  kanbanService = inject(KanbanService)
  kanbanList = this.kanbanService.kanbanList

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
      this.taskTitle.set(this.kanbanService.getTask(listId, this.currentItemId).title)
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

    if (this.isEditMode) {
      this.kanbanService.updateTask(this.currentListId, this.currentItemId, title)
    } else {
      this.kanbanService.addTask(this.currentListId, title)
    }
    this.closeDialog()
  }

  deleteTask() {
    this.kanbanService.deleteTask(this.currentListId, this.currentItemId)
  }
}
