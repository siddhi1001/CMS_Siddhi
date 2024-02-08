import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformerInfoDialogComponent } from './performer-info-dialog.component';

describe('PerformerInfoDialogComponent', () => {
  let component: PerformerInfoDialogComponent;
  let fixture: ComponentFixture<PerformerInfoDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PerformerInfoDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PerformerInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
