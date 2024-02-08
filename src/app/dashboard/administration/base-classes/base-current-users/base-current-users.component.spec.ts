import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseCurrentUsersComponent } from './base-current-users.component';

describe('BaseCurrentUsersComponent', () => {
  let component: BaseCurrentUsersComponent;
  let fixture: ComponentFixture<BaseCurrentUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BaseCurrentUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseCurrentUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
