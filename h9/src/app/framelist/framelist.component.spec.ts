import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FramelistComponent } from './framelist.component';

describe('FramelistComponent', () => {
  let component: FramelistComponent;
  let fixture: ComponentFixture<FramelistComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FramelistComponent]
    });
    fixture = TestBed.createComponent(FramelistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
