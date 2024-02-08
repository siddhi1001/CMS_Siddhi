import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgmdTeamUsersComponent } from './orgmd-team-users.component';

describe('OrgmdTeamUsersComponent', () => {
  let component: OrgmdTeamUsersComponent;
  let fixture: ComponentFixture<OrgmdTeamUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrgmdTeamUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgmdTeamUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
