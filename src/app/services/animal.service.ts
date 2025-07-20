import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Animal {
  id: number;
  nombre: string;
  categoria_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnimalService {
  private apiUrl = 'http://localhost:4000/api/animal';

  constructor(private http: HttpClient) {}

  getAnimales(): Observable<Animal[]> {
    return this.http.get<Animal[]>(this.apiUrl);
  }
}
