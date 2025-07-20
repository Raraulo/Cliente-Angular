import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Persona {
  id?:        number;
  cedula?:    string;
  nombre:     string;
  apellido?:  string;
  mail?:      string;
  login:      string;
  password:   string;
  telefono?:  string;
  sexo?:      string;
  direccion?: string;
  activo?:    number;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = 'http://localhost:4000/api/user';

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') ?? '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      token
    });
  }

  /** CRUD ------------------------------------------------------------- */
  create(data: Persona): Observable<Persona> {
    return this.http.post<Persona>(this.api, data, { headers: this.authHeaders() });
  }

  list(): Observable<Persona[]> {
    return this.http.get<Persona[]>(this.api, { headers: this.authHeaders() });
  }

  get(id: number): Observable<Persona> {
    return this.http.get<Persona>(`${this.api}/${id}`, { headers: this.authHeaders() });
  }

  update(id: number, data: Persona): Observable<Persona> {
    return this.http.put<Persona>(`${this.api}/${id}`, data, { headers: this.authHeaders() });
  }

  delete(id: number): Observable<Persona> {
    return this.http.delete<Persona>(`${this.api}/${id}`, { headers: this.authHeaders() });
  }
}
