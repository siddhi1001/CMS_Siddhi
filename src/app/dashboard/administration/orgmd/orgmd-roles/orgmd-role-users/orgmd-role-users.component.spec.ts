import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgmdRoleUsersComponent } from './orgmd-role-users.component';

describe('OrgmdRoleUsersComponent', () => {
  let component: OrgmdRoleUsersComponent;
  let fixture: ComponentFixture<OrgmdRoleUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrgmdRoleUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgmdRoleUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
