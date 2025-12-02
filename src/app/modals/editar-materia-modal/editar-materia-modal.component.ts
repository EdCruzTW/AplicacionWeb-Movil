import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-editar-materia-modal',
  templateUrl: './editar-materia-modal.component.html',
  styleUrls: ['./editar-materia-modal.component.scss']
})
export class EditarMateriaModalComponent implements OnInit {

  public nombreMateria: string = "";

  constructor(
    private dialogRef: MatDialogRef<EditarMateriaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.nombreMateria = this.data.nombre || "materia";
  }

  public cerrar_modal() {
    this.dialogRef.close({ confirmar: false });
  }

  public confirmarEdicion() {
    this.dialogRef.close({ confirmar: true });
  }
}
