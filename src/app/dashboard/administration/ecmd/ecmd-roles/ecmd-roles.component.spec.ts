import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcmdRolesComponent } from './ecmd-roles.component';

describe('EcmdRolesComponent', () => {
  let component: EcmdRolesComponent;
  let fixture: ComponentFixture<EcmdRolesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcmdRolesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcmdRolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
