import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, Observable, of, tap} from 'rxjs';
import {Node, DeviceInfo, DevRegister} from "./node";
import {API_URL} from "./app.globals";

@Injectable({
  providedIn: 'root'
})
export class NodesService {
  private nodes_url= `${API_URL}/nodes`
  private node_url= `${API_URL}/node`

  constructor(private http: HttpClient) {
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      // this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  get_devices(): Observable<Node[]> {
    return this.http.get<Node[]>(this.nodes_url).pipe(
      //tap(_ => console.log(`get_devices`))
      catchError(this.handleError<Node[]>('get_devices'))
    );
  }

  get_device_info(dev: Node): Observable<DeviceInfo> {
    const url = `${this.node_url}/${dev.id}`;
    return this.http.get<DeviceInfo>(url).pipe(
      //tap(_ => console.log(`get_devices`))
      catchError(this.handleError<DeviceInfo>('get_device_info'))
    );
  }

  get_register(dev: Node, reg: DevRegister): Observable<number|number[]|string> {
    const url = `${this.node_url}/${dev.id}/reg/${reg.number}`;
    return this.http.get<number|number[]|string>(url).pipe(
      //tap(_ => console.log(`get_devices`))
      catchError(this.handleError<number|number[]|string>('get_register'))
    );
  }

  set_register(dev: Node, reg: DevRegister): Observable<number|number[]|string> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    const url = `${this.node_url}/${dev.id}/reg/${reg.number}`;
    if (reg.type != 'str' && (typeof reg.value === "string")) {
      reg.value = parseInt(reg.value);
    }
    return this.http.put<number|number[]|string>(url, {"value": reg.value}).pipe(
      //tap(_ => console.log(`get_devices`))
      catchError(this.handleError<number|number[]|string>('set_register'))
    );
  }
}
