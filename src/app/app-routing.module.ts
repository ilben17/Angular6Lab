import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import { CreateEmployeeComponent } from './employee/create-employee.component';
import { ListEmployeesComponent } from './employee/list-employees.component';


const appRoute: Routes = [
  {path: 'create', component: CreateEmployeeComponent},
  {path: 'list', component: ListEmployeesComponent},
  {path: '', redirectTo: '/create', pathMatch: 'full'}
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoute)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
