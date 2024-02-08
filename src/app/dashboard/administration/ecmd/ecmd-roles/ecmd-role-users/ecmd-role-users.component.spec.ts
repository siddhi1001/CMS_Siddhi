import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcmdRoleUsersComponent } from './ecmd-role-users.component';

describe('EcmdRoleUsersComponent', () => {
  let component: EcmdRoleUsersComponent;
  let fixture: ComponentFixture<EcmdRoleUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcmdRoleUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcmdRoleUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
