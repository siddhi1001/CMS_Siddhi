import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentDelegationsComponent } from './current-delegations.component';

describe('CurrentDelegationsComponent', () => {
  let component: CurrentDelegationsComponent;
  let fixture: ComponentFixture<CurrentDelegationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrentDelegationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentDelegationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
