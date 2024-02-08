import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityRelationsDialogComponent } from './entity-relations-dialog.component';

describe('EntityRelationsDialogComponent', () => {
  let component: EntityRelationsDialogComponent;
  let fixture: ComponentFixture<EntityRelationsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntityRelationsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityRelationsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
