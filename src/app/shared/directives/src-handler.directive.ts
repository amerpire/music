import { Directive, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';

@Directive({
  selector: 'img[appSrcHandler]',
  standalone: true,
})
export class SrcHandlerDirective implements OnInit {

  /**
   * Fallback image source when main image source
   * fails to load.
   *
   * This source is also used when main image source
   * is unset (null/undefined).
   *
   * In case of fallback image fails to load, the
   * directive does nothing.
   */
  @Input() public defaultSrc = '/assets/song-default.png';

  /**
   * Triggers when image fails to load and default
   * image is used.
   */
  @Output() public postError = new EventEmitter<void>();

  constructor(private readonly elementRef: ElementRef<HTMLImageElement>) {
  }

  @HostListener('error')
  private error(): void {
    /** If fallback image has error, do nothing. */
    if (this.elementRef.nativeElement.src.endsWith(this.defaultSrc)) {
      return;
    }
    /** Trigger error. */
    this.postError.emit();
    /** Change to fallback image. */
    this.elementRef.nativeElement.src = this.defaultSrc;
  }

  @HostListener('load')
  private load(): void {
    /** Add a class for when it successfully loads. */
    this.elementRef.nativeElement.classList.add('src-loaded');
  }

  public ngOnInit(): void {
    /** If main image is not set, execute error scenario. */
    if (!this.elementRef.nativeElement.src) {
      this.error();
    }
  }
}
