import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendBackDialogComponent } from './send-back-dialog.component';

describe('SendBackDialogComponent', () => {
  let component: SendBackDialogComponent;
  let fixture: ComponentFixture<SendBackDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendBackDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendBackDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
