import type { ISelectOption } from "@application/interface/select-option.interface";

/**
 * CLI adapter port for interactive configuration.
 */
export interface ICliInterfaceService {
	confirm(message: string, defaultValue?: boolean): Promise<boolean>;
	info(message: string): void;
	password(message: string, defaultValue?: string, validate?: (value: string) => string | undefined): Promise<string>;
	select<T>(message: string, options: Array<ISelectOption<T>>, defaultValue?: T): Promise<T>;
	success(message: string): void;
	text(message: string, placeholder?: string, defaultValue?: string, validate?: (value: string) => string | undefined): Promise<string>;
	warn(message: string): void;
}
