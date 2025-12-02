import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FacadeService } from './facade.service';
import { ErrorsService } from './tools/errors.service';
import { ValidatorService } from './tools/validator.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MateriasService {

  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService
  ) { }

  //Esquema del formulario de materia
  public esquemaMateria(){
    return {
      'nrc': '',
      'nombre': '',
      'seccion': '',
      'dias_json': [],
      'hora_inicio': '',
      'hora_fin': '',
      'salon': '',
      'programa_educativo': '',
      'profesor_id': '',
      'creditos': ''
    }
  }

  //Lista de programas educativos de la FCC
  public getProgramasEducativos(): string[]{
    return [
      'Ingeniería en Ciencias de la Computación',
      'Licenciatura en Ciencias de la Computación',
      'Ingeniería en Tecnologías de la Información'
    ];
  }

  //Lista de días de la semana
  public getDiasSemana(): string[]{
    return ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  }

  //Validación del formulario
  public validarMateria(data: any, editar: boolean){
    console.log("Validando materia... ", data);
    let error: any = [];

    //NRC: obligatorio, solo números, 6 dígitos
    if(!this.validatorService.required(data["nrc"])){
      error["nrc"] = this.errorService.required;
    }else if(!/^\d{6}$/.test(data["nrc"])){
      error["nrc"] = "El NRC debe tener exactamente 6 dígitos numéricos";
    }

    //Nombre: obligatorio, solo letras y espacios
    if(!this.validatorService.required(data["nombre"])){
      error["nombre"] = this.errorService.required;
    }else if(!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(data["nombre"])){
      error["nombre"] = "El nombre solo puede contener letras y espacios";
    }

    //Sección: obligatorio, solo números, máximo 3 dígitos
    if(!this.validatorService.required(data["seccion"])){
      error["seccion"] = this.errorService.required;
    }else if(!/^\d{1,3}$/.test(data["seccion"])){
      error["seccion"] = "La sección debe ser numérica y máximo 3 dígitos";
    }

    //Días: al menos uno seleccionado
    if(!data["dias_json"] || data["dias_json"].length === 0){
      error["dias_json"] = "Debes seleccionar al menos un día";
    }

    //Hora inicio: obligatorio
    if(!this.validatorService.required(data["hora_inicio"])){
      error["hora_inicio"] = this.errorService.required;
    }

    //Hora fin: obligatorio
    if(!this.validatorService.required(data["hora_fin"])){
      error["hora_fin"] = this.errorService.required;
    }

    //Validar que hora inicio sea menor que hora fin
    if(data["hora_inicio"] && data["hora_fin"]){
      if(data["hora_inicio"] >= data["hora_fin"]){
        error["hora_fin"] = "La hora de fin debe ser mayor a la hora de inicio";
      }
    }

    //Salón: obligatorio, alfanumérico, máximo 15 caracteres
    if(!this.validatorService.required(data["salon"])){
      error["salon"] = this.errorService.required;
    }else if(!/^[a-zA-Z0-9\s]{1,15}$/.test(data["salon"])){
      error["salon"] = "El salón debe ser alfanumérico y máximo 15 caracteres";
    }

    //Programa educativo: obligatorio
    if(!this.validatorService.required(data["programa_educativo"])){
      error["programa_educativo"] = this.errorService.required;
    }

    //Profesor: obligatorio
    if(!this.validatorService.required(data["profesor_id"])){
      error["profesor_id"] = "Debes seleccionar un profesor";
    }

    //Créditos: obligatorio, numérico, valor entre 1 y 10
    if(!this.validatorService.required(data["creditos"])){
      error["creditos"] = this.errorService.required;
    }else{
      const creditos = parseInt(data["creditos"], 10);
      if(isNaN(creditos) || creditos < 1 || creditos > 10){
        error["creditos"] = "Los créditos deben ser un número entre 1 y 10";
      }
    }

    return error;
  }

  //Servicio para registrar nueva materia
  public registrarMateria(data: any): Observable<any>{
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if(token){
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    }else{
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.post<any>(`${environment.url_api}/materias/`, data, { headers });
  }

  //Servicio para obtener la lista de materias
  public obtenerListaMaterias(): Observable<any>{
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if(token){
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    }else{
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.get<any>(`${environment.url_api}/lista-materias/`, { headers });
  }

  //Petición para obtener una materia por su ID
  public obtenerMateriaPorID(idMateria: number): Observable<any>{
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if(token){
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    }else{
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.get<any>(`${environment.url_api}/materias/?id=${idMateria}`, { headers });
  }

  //Petición para actualizar una materia
  public actualizarMateria(data: any): Observable<any>{
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if(token){
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    }else{
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.put<any>(`${environment.url_api}/materias/`, data, { headers });
  }

  //Petición para eliminar una materia
  public eliminarMateria(idMateria: number): Observable<any>{
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if(token){
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    }else{
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.delete<any>(`${environment.url_api}/materias/?id=${idMateria}`, { headers });
  }
}
