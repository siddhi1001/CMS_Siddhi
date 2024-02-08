import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCounterpartDialogComponent } from './edit-counterpart-dialog.component';

describe('EditCounterpartDialogComponent', () => {
  let component: EditCounterpartDialogComponent;
  let fixture: ComponentFixture<EditCounterpartDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditCounterpartDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCounterpartDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
