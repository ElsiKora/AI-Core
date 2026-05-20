import type { ICliInterfaceService } from "@application/interface/cli-interface-service.interface";
import type { ISelectOption } from "@application/interface/select-option.interface";
import type { BeanAdapter, IBeanFactoryOptionsInterface } from "@elsikora/bean";

import { NUMERIC_CONSTANT } from "@domain/constant/numeric.constant";
import { createBeanAdapterFactory, SelectOptionValueObject } from "@elsikora/bean";

/**
 * Bean-backed interactive CLI adapter.
 */
export class BeanCliInterfaceService implements ICliInterfaceService {
	private readonly BEAN: BeanAdapter;

	constructor(beanAdapter?: BeanAdapter, beanOptions?: IBeanFactoryOptionsInterface) {
		const activeBeanAdapter: BeanAdapter =
			beanAdapter ??
			createBeanAdapterFactory({
				isSignalHandlingEnabled: false,
				...beanOptions,
			});

		this.BEAN = activeBeanAdapter;
	}

	async confirm(message: string, isDefaultValue: boolean = false): Promise<boolean> {
		const isConfirmed: boolean | null = await this.BEAN.confirm({ isDefaultValue, message });

		return this.requirePromptValue(isConfirmed, message);
	}

	info(message: string): void {
		this.BEAN.log({ level: "info", message });
	}

	async password(message: string, defaultValue?: string, validate?: (value: string) => string | undefined): Promise<string> {
		const result: null | string = await this.BEAN.password({
			defaultValue,
			fallbackValue: defaultValue,
			isRequired: true,
			maskCharacter: "*",
			message,
			validate: validate ? (value: string): null | string => validate(value) ?? null : undefined,
		});

		return this.requirePromptValue(result, message);
	}

	async select<T>(message: string, options: Array<ISelectOption<T>>, defaultValue?: T): Promise<T> {
		if (options.length === 0) {
			throw new Error("Select options cannot be empty");
		}

		const beanOptions: Array<SelectOptionValueObject> = options.map(
			(option: ISelectOption<T>, index: number): SelectOptionValueObject =>
				new SelectOptionValueObject({
					label: option.label,
					value: String(index),
				}),
		);
		const defaultIndex: number = defaultValue === undefined ? -1 : options.findIndex((option: ISelectOption<T>): boolean => Object.is(option.value, defaultValue));

		const selectedOptionIndexText: null | string = await this.BEAN.select({
			initialIndex: defaultIndex >= 0 ? defaultIndex : undefined,
			isSearchEnabled: options.length >= NUMERIC_CONSTANT.MIN_SELECT_OPTIONS_FOR_SEARCH,
			message,
			options: beanOptions,
		});
		const selectedOptionIndex: number = Number.parseInt(this.requirePromptValue(selectedOptionIndexText, message), 10);
		const selectedOption: ISelectOption<T> | undefined = options[selectedOptionIndex];

		if (!selectedOption) {
			throw new Error(`Selected option index '${String(selectedOptionIndex)}' is out of range`);
		}

		return selectedOption.value;
	}

	success(message: string): void {
		this.BEAN.log({ level: "success", message });
	}

	async text(message: string, placeholder?: string, defaultValue?: string, validate?: (value: string) => string | undefined): Promise<string> {
		const result: null | string = await this.BEAN.text({
			defaultValue,
			fallbackValue: defaultValue,
			isRequired: true,
			message,
			placeholder,
			validate: validate ? (value: string): null | string => validate(value) ?? null : undefined,
		});

		return this.requirePromptValue(result, message);
	}

	warn(message: string): void {
		this.BEAN.log({ level: "warn", message });
	}

	private requirePromptValue<T>(value: null | T, promptMessage: string): T {
		if (value === null) {
			throw new Error(`Prompt '${promptMessage}' was cancelled`);
		}

		return value;
	}
}
