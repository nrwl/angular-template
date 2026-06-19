import { TestBed, ComponentFixture } from '@angular/core/testing';
import { App } from './app';
import { appRoutes } from './app.routes';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('App', () => {
  let component: App;
  let fixture: ComponentFixture<App>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(appRoutes)],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app component', () => {
    expect(component).toBeTruthy();
  });

  it('should render title in header', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Nx Shop Demo');
  });

  it('should render navigation links', () => {
    const navLinks = fixture.debugElement.queryAll(By.css('nav a'));
    expect(navLinks.length).toBeGreaterThan(0);
    expect(navLinks[0].nativeElement.textContent).toContain('Products');
    expect(navLinks[0].nativeElement.getAttribute('routerLink')).toBe(
      '/products'
    );
  });

  it('should render footer with correct copyright', () => {
    const footer = fixture.nativeElement.querySelector('.app-footer');
    expect(footer).toBeTruthy();
    expect(footer?.textContent).toContain('© 2025 Nx Shop Demo');
    expect(footer?.textContent).toContain(
      'Frontend (Angular) + Backend (Express) + Shared Libraries'
    );
  });

  it('should have router outlet for dynamic content', () => {
    const routerOutlet = fixture.nativeElement.querySelector('router-outlet');
    expect(routerOutlet).toBeTruthy();
  });

  it('should apply change detection strategy OnPush', () => {
    const metadata = (App as unknown as { ɵcmp: { onPush: boolean } })['ɵcmp'];
    expect(metadata.onPush).toBeTruthy();
  });
});
