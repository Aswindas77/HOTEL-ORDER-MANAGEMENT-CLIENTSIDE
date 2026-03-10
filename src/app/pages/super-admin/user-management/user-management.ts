import { Component,OnInit } from '@angular/core';
import { SuperAdminApiService } from '../../../services/super-admin-api/super-admin-api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.scss',
})
export class UserManagementComponent implements OnInit {

  users: any[] = [];
  filteredUsers: any[] = [];
  showForm = false;
  editingUserId: string | null = null;

  search = '';
  statusFilter = '';

  newUser = {
    name: '',
    email: '',
    password: '',
    role: 'MANAGER'
  };

  constructor(private api: SuperAdminApiService) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

fetchUsers(){

  this.api.getUsers().subscribe((res:any)=>{

    const allUsers = res.data || res;

    this.users = allUsers
      .filter((u:any)=>u.role === 'MANAGER')
      .map((u:any)=>({
        ...u,
        isActive: u.isActive === true || u.isActive === 'true'
      }));

    this.filteredUsers = [...this.users];

  });

}

    // APPLY SEARCH / FILTER
applyFilters(){

  this.filteredUsers = this.users.filter(user => {

    const matchSearch =
      !this.search ||
      user.name.toLowerCase().includes(this.search.toLowerCase()) ||
      user.email.toLowerCase().includes(this.search.toLowerCase());

    const matchStatus =
      !this.statusFilter ||
      user.isActive.toString() === this.statusFilter;

    return matchSearch && matchStatus;

  });

}
    // CLEAR FILTERS
  clearFilters(){
    this.search = '';
    this.statusFilter = '';
    this.applyFilters();
  }

  // CREATE MANAGER
  createUser(){

    const payload = {
      ...this.newUser,
      role:'MANAGER'
    };

    this.api.createUser(payload).subscribe(()=>{

      alert("Manager Created");

      this.newUser = {
        name:'',
        email:'',
        password:'',
        role:'MANAGER'
      };

      this.fetchUsers();

    });

  }

  // DELETE USER
  deleteUser(id: string) {

    if(!confirm('Delete this user?')) return;

    this.api.deleteUser(id).subscribe(() => {

      alert('User Deleted');

      this.fetchUsers();

    });

  }
openForm(){

  this.newUser = {
    name:'',
    email:'',
    password:'',
    role:'MANAGER'
  };

  this.showForm = true;

}

submitUser(){

  if(this.editingUserId){

    // UPDATE USER

    this.api.updateUser(this.editingUserId,this.newUser).subscribe(()=>{

      alert("User Updated");

      this.showForm=false;
      this.editingUserId=null;

      this.fetchUsers();

    });

  } else {

    // CREATE USER

    this.api.createUser(this.newUser).subscribe(()=>{

      alert("Manager Created");

      this.showForm=false;

      this.fetchUsers();

    });

  }

}
editUser(user:any){

  this.editingUserId = user._id;

  this.newUser = {
    name: user.name,
    email: user.email,
    password: '',
    role: user.role
  };

  this.showForm = true;

}


    // ACTIVATE USER
activateUser(id:string){

  this.api.updateUser(id,{isActive:true}).subscribe({
    next:()=>{
      alert("User Activated");
      this.fetchUsers();
    },
    error:(err)=>{
      console.error("Activate error",err);
    }
  });

}

  // DEACTIVATE USER
deactivateUser(id:string){

  this.api.updateUser(id,{isActive:false}).subscribe({
    next:()=>{
      alert("User Deactivated");
      this.fetchUsers();
    },
    error:(err)=>{
      console.error("Deactivate error",err);
    }
  });

}
}