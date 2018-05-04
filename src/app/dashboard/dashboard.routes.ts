import {DashboardComponent} from "./dashboard.component";
export const dashboardRoutes=[
  {
    path:'',
    redirectTo:'main',
    pathMatch:'full'
  },
  {
    path:'main',
    component: DashboardComponent
  }
];
