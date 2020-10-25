
import {
    Directive,
    ElementRef,
    Input,
    OnDestroy,
    HostListener,
    forwardRef
} from '@angular/core';
import { isEmpty, split } from 'lodash';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, Validator, AbstractControl } from '@angular/forms';

@Directive({
    selector: '[time]',
    providers: [
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => TimeDirective),
            multi: true
        },
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TimeDirective),
            multi: true
        }
    ]
})

export class TimeDirective implements OnDestroy, Validator, ControlValueAccessor {
    @Input() set value(value: string | number) {
        this._formatTime(value);
    }

    _changeFn: (any) => void;
    _touchFn: () => void;
    inputElement;

    constructor(private _el: ElementRef) {
        this.inputElement = this._el.nativeElement;
        this.inputElement.placeholder = 'HH:MM';


    }

    ngOnDestroy() {
        this._el = null;
    }


    registerOnChange(fn: any): void {
        this._changeFn = fn;
    }

    registerOnTouched(fn: any): void {
        this._touchFn = fn;
    }

    writeValue(value: any): void {
        this._formatTime(value);
    }

    setDisabledState?(isDisabled: boolean): void {
        this.inputElement.disabled = isDisabled;
    }

    private _formatTime(value) {
        const time = value;
        if (!isEmpty(time)) {

            let splits = [];
            let finalSplits = [];
            if (time.indexOf(':') === -1) {
                splits = time.match(/.{1,2}/g);
                finalSplits = this._processTime(splits);
            } else {
                splits = split(time, ':', 2);
                finalSplits = this._processTime(splits);
            }

            this.inputElement.value = finalSplits[0] + ':' + finalSplits[1];
            if (this._changeFn) {
                this._changeFn(value);
            }
        }
    }
    private _isNumberKey(evt) {
        const charCode = evt.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }

        return true;
    }

    private _processTime(splits) {
        splits[0] = parseInt(splits[0]);
        splits[1] = parseInt(splits[1]);
        if (isNaN(splits[0]) || isNaN(splits[1])) {
            splits[0] = '00';
            splits[1] = '00';
        } else {
            if (splits[0] > 23) {
                splits[0] = '00';
            }
            if (splits[1] > 59) {
                splits[1] = '00';
            }
        }
        if (splits[0] <= 9 && splits[0].toString().length === 1) {
            splits[0] = '0' + splits[0];
        }
        if (splits[1] <= 9 && splits[1].toString().length === 1) {
            splits[1] = '0' + splits[1];
        }
        return splits;
    }
    @HostListener('keypress', ['$event']) onKeypress($event) {
        if ($event.key !== ':' && !this._isNumberKey($event)) {
            return false;
        }
        if (this.inputElement.value.length > 4) {
            return false;
        }
    }

    @HostListener('mousewheel', ['$event']) onMouseWheel($event: any) {
        $event.preventDefault();
    }


    @HostListener('blur') onTouch() {
        if (this._touchFn) {
            this._touchFn();
        }
    }

    @HostListener('focusout') focusout() {
        this._formatTime(this.inputElement.value);
    }

    validate(c: AbstractControl): { [key: string]: any } {
        let inputValue = c.value;
        let splits = [];
        let finalSplits = [];
        if (inputValue.indexOf(':') === -1) {
            splits = inputValue.match(/.{1,2}/g);
        } else {
            splits = split(inputValue, ':', 2);
        }
        finalSplits = this._processTime(splits);

        if (isNaN(splits[0]) && isNaN(splits[1]) ) {
          return {
            'validateTime': {
              notATime: true
            }
          };
        }
      }
}
