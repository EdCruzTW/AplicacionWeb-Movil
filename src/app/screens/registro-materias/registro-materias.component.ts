import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { MateriasService } from 'src/app/services/materias.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { MatDialog } from '@angular/material/dialog';
import { EditarMateriaModalComponent } from 'src/app/modals/editar-materia-modal/editar-materia-modal.component';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';

@Component({
  selector: 'app-registro-materias',
  templateUrl: './registro-materias.component.html',
  styleUrls: ['./registro-materias.component.scss']
})
export class RegistroMateriasComponent implements OnInit {

  public materia: any = {};
  public errors: any = {};
  public editar: boolean = false;
  public idMateria: number = 0;

  // Tema para el TimePicker (reloj circular)
  public timePickerTheme: NgxMaterialTimepickerTheme = {
    container: {
      bodyBackgroundColor: '#fff',
      buttonColor: '#1976d2'
    },
    dial: {
      dialBackgroundColor: '#1976d2',
      dialInactiveColor: '#90caf9',
      dialActiveColor: '#fff'
    },
    clockFace: {
      clockFaceBackgroundColor: '#f5f5f5',
      clockHandColor: '#1976d2',
      clockFaceTimeInactiveColor: '#333'
    }
  };

  // Listas para los selects
  public programasEducativos: string[] = [];
  public diasSemana: string[] = [];
  public maestros: any[] = [];

  constructor(
    private router: Router,
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private materiasService: MateriasService,
    private maestrosService: MaestrosService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Cargar listas
    this.programasEducativos = this.materiasService.getProgramasEducativos();
    this.diasSemana = this.materiasService.getDiasSemana();
    this.obtenerMaestros();

    // Verificar si es edición
    if (this.activatedRoute.snapshot.params['id'] != undefined) {
      this.editar = true;
      this.idMateria = this.activatedRoute.snapshot.params['id'];
      console.log("ID Materia: ", this.idMateria);
      this.obtenerMateriaPorID();
    } else {
      // Nuevo registro
      this.materia = this.materiasService.esquemaMateria();
      // Inicializar horas por defecto
      this.materia.hora_inicio = '07:00';
      this.materia.hora_fin = '08:00';
    }
  }

  // Obtener lista de maestros para el select
  public obtenerMaestros() {
    this.maestrosService.obtenerListaMaestros().subscribe(
      (response) => {
        this.maestros = response;
        console.log("Maestros cargados: ", this.maestros);
      },
      (error) => {
        console.error("Error al obtener maestros: ", error);
      }
    );
  }

  // Obtener materia por ID para edición
  public obtenerMateriaPorID() {
    this.materiasService.obtenerMateriaPorID(this.idMateria).subscribe(
      (response) => {
        this.materia = response;
        console.log("Materia obtenida: ", this.materia);

        // Parsear dias_json si es string
        if (typeof this.materia.dias_json === 'string') {
          try {
            this.materia.dias_json = JSON.parse(this.materia.dias_json);
          } catch (e) {
            this.materia.dias_json = [];
          }
        }

        // Asignar profesor_id si existe
        if (this.materia.profesor && this.materia.profesor.id) {
          this.materia.profesor_id = this.materia.profesor.id;
        }
      },
      (error) => {
        console.error("Error al obtener materia: ", error);
        alert("No se pudo obtener la materia");
      }
    );
  }

  // Manejar checkbox de días
  public checkboxDiaChange(event: any, dia: string) {
    if (!this.materia.dias_json) {
      this.materia.dias_json = [];
    }

    if (event.checked) {
      if (!this.materia.dias_json.includes(dia)) {
        this.materia.dias_json.push(dia);
      }
    } else {
      const index = this.materia.dias_json.indexOf(dia);
      if (index > -1) {
        this.materia.dias_json.splice(index, 1);
      }
    }
    console.log("Días seleccionados: ", this.materia.dias_json);
  }

  // Verificar si un día está seleccionado
  public isDiaSeleccionado(dia: string): boolean {
    return this.materia.dias_json && this.materia.dias_json.includes(dia);
  }

  // Regresar
  public regresar() {
    this.location.back();
  }

  // Registrar nueva materia
  public registrar() {
    this.errors = {};
    this.errors = this.materiasService.validarMateria(this.materia, false);

    if (Object.keys(this.errors).length > 0) {
      console.log("Errores de validación: ", this.errors);
      return;
    }

    this.materiasService.registrarMateria(this.materia).subscribe(
      (response) => {
        alert("Materia registrada exitosamente");
        console.log("Materia registrada: ", response);
        this.router.navigate(['/materias']);
      },
      (error) => {
        console.error("Error al registrar materia: ", error);
        if (error.error && error.error.error) {
          alert(error.error.error);
        } else {
          alert("Error al registrar materia");
        }
      }
    );
  }

  // Actualizar materia existente
  public actualizar() {
    this.errors = {};
    this.errors = this.materiasService.validarMateria(this.materia, true);

    if (Object.keys(this.errors).length > 0) {
      console.log("Errores de validación: ", this.errors);
      return;
    }

    // Mostrar modal de confirmación
    const dialogRef = this.dialog.open(EditarMateriaModalComponent, {
      data: { nombre: this.materia.nombre },
      height: '280px',
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.confirmar) {
        // Agregar el ID para la actualización
        const dataActualizar = {
          ...this.materia,
          id: this.idMateria
        };

        this.materiasService.actualizarMateria(dataActualizar).subscribe(
          (response) => {
            alert("Materia actualizada exitosamente");
            console.log("Materia actualizada: ", response);
            this.router.navigate(['/materias']);
          },
          (error) => {
            console.error("Error al actualizar materia: ", error);
            alert("Error al actualizar materia");
          }
        );
      }
    });
  }
}
