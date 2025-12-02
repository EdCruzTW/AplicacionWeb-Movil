import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MateriasService } from 'src/app/services/materias.service';
import { FacadeService } from 'src/app/services/facade.service';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-materias-screen',
  templateUrl: './materias-screen.component.html',
  styleUrls: ['./materias-screen.component.scss']
})
export class MateriasScreenComponent implements OnInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_materias: any[] = [];

  // Columnas para admin (con editar/eliminar)
  displayedColumnsAdmin: string[] = ['nrc', 'nombre', 'seccion', 'dias', 'horario', 'salon', 'programa_educativo', 'profesor', 'creditos', 'editar', 'eliminar'];
  // Columnas para maestro (sin editar/eliminar)
  displayedColumnsMaestro: string[] = ['nrc', 'nombre', 'seccion', 'dias', 'horario', 'salon', 'programa_educativo', 'profesor', 'creditos'];

  displayedColumns: string[] = [];

  dataSource = new MatTableDataSource<DatosMateria>(this.lista_materias as DatosMateria[]);

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  ngAfterViewInit() {
    // Configurar el accessor del sort para mapear columnas personalizadas
    this.dataSource.sortingDataAccessor = (item: any, property) => {
      switch(property) {
        case 'nrc': return item.nrc;
        case 'nombre': return item.nombre?.toLowerCase() || '';
        case 'seccion': return item.seccion;
        case 'programa_educativo': return item.programa_educativo?.toLowerCase() || '';
        case 'creditos': return item.creditos;
        default: return item[property];
      }
    };

    // Configurar filtro personalizado para buscar solo por NRC y nombre
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const searchStr = filter.toLowerCase();
      return data.nrc?.toString().toLowerCase().includes(searchStr) ||
             data.nombre?.toLowerCase().includes(searchStr);
    };
  }

  constructor(
    private materiasService: MateriasService,
    private facadeService: FacadeService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    // Validar que haya inicio de sesión
    this.token = this.facadeService.getSessionToken();
    if(this.token == ""){
      this.router.navigate(["/"]);
    }
    // Asignar columnas según el rol
    if (this.rol === 'administrador') {
      this.displayedColumns = this.displayedColumnsAdmin;
    } else {
      this.displayedColumns = this.displayedColumnsMaestro;
    }
    // Obtener lista de materias
    this.obtenerMaterias();
  }

  // Obtener lista de materias
  public obtenerMaterias(): void {
    this.materiasService.obtenerListaMaterias().subscribe(
      (response) => {
        this.lista_materias = response;
        // Procesar los días para mostrarlos como cadena y el nombre del profesor
        this.lista_materias.forEach((materia) => {
          // Procesar dias_json
          if (materia.dias_json && Array.isArray(materia.dias_json)) {
            materia.dias_str = materia.dias_json.join(', ');
          } else if (typeof materia.dias_json === 'string') {
            try {
              const diasArray = JSON.parse(materia.dias_json);
              materia.dias_str = diasArray.join(', ');
            } catch {
              materia.dias_str = materia.dias_json;
            }
          } else {
            materia.dias_str = '';
          }
          // Procesar nombre del profesor
          if (materia.profesor && materia.profesor.user) {
            materia.profesor_nombre = materia.profesor.user.first_name + ' ' + materia.profesor.user.last_name;
          } else {
            materia.profesor_nombre = 'Sin asignar';
          }
        });
        console.log("Lista de materias:", this.lista_materias);
        if(this.lista_materias.length > 0) {
          // Actualizar los datos del dataSource
          this.dataSource.data = this.lista_materias;
          setTimeout(() => {
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
          });
        }
      },
      (error) => {
        alert("No se pudo obtener la lista de materias");
        console.error("Error:", error);
      }
    );
  }

  // Filtrar tabla
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Navegar a la vista de registro de nueva materia
  public goRegistro(): void {
    this.router.navigate(["/registro-materias"]);
  }

  // Navegar a la vista de edición de materia
  public goEditar(idMateria: number): void {
    this.router.navigate(["/registro-materias/" + idMateria]);
  }

  // Eliminar materia
  public delete(idMateria: number): void {
    // Solo administrador puede eliminar
    if (this.rol !== 'administrador') {
      alert("No tienes permisos para eliminar materias.");
      return;
    }

    const dialogRef = this.dialog.open(EliminarUserModalComponent, {
      data: { id: idMateria, rol: 'materia' },
      height: '288px',
      width: '328px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.isDelete) {
        alert("Materia eliminada correctamente.");
        window.location.reload();
      } else {
        alert("La materia no se ha podido eliminar.");
      }
    });
  }

}

// Interface para los datos de la tabla
export interface DatosMateria {
  id: number;
  nrc: number;
  nombre: string;
  seccion: number;
  dias_json: string[] | string;
  dias_str?: string;
  hora_inicio: string;
  hora_fin: string;
  salon: string;
  programa_educativo: string;
  profesor: any;
  profesor_nombre?: string;
  creditos: number;
}
