import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewDelegationComponent } from './new-delegation.component';

describe('NewDelegationComponent', () => {
  let component: NewDelegationComponent;
  let fixture: ComponentFixture<NewDelegationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewDelegationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewDelegationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
